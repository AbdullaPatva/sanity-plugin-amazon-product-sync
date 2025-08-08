import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Box, Button, Card, Code, Flex, Grid, Heading, Inline, Label, Radio, Spinner, Stack, Text, TextInput, TextArea, useToast} from '@sanity/ui'
import {useClient} from 'sanity'

type ProductData = {
  asin: string
  title?: string
  url?: string
  brand?: string
  price?: string
  salePrice?: string
  currency?: string
  listPrice?: string
  images?: Array<{url: string; width?: number; height?: number}>
}

type ImportSettings = {
  postType: 'post' | 'page'
  postStatus: 'publish' | 'draft' | 'private'
}

export function AmazonTool() {
  const client = useClient({apiVersion: '2025-05-01'})
  const toast = useToast()
  const [asin, setAsin] = useState('')
  const [bulkAsins, setBulkAsins] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProductData | null>(null)
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')
  const [importSettings, setImportSettings] = useState<ImportSettings>({
    postType: 'post',
    postStatus: 'publish'
  })

  const handleFetch = useCallback(async () => {
    if (!asin) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/amazon/fetch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({asin}),
      })
      if (!res.ok) throw new Error('Fetch failed')
      const data = (await res.json()) as ProductData
      setResult({...data, asin})
    } catch (e: any) {
      toast.push({status: 'error', title: 'Failed to fetch', description: e?.message})
    } finally {
      setLoading(false)
    }
  }, [asin, toast])

  const handleCreate = useCallback(async () => {
    if (!result) return
    setLoading(true)
    try {
      const doc = {
        _type: 'amazon.product',
        asin: result.asin,
        title: result.title,
        url: result.url,
        brand: result.brand,
        features: [],
        price: result.price,
        salePrice: result.salePrice,
        currency: result.currency,
        listPrice: result.listPrice,
        images: result.images,
        lastSyncedAt: new Date().toISOString(),
      }
      const created = await client.create(doc)
      toast.push({status: 'success', title: 'Created product', description: created._id})
    } catch (e: any) {
      toast.push({status: 'error', title: 'Create failed', description: e?.message})
    } finally {
      setLoading(false)
    }
  }, [client, result, toast])

  const handleBulkImport = useCallback(async () => {
    if (!bulkAsins.trim()) return
    setLoading(true)
    try {
      const asinArray = bulkAsins.split(',').map(s => s.trim()).filter(s => s.length > 0)
      if (asinArray.length > 10) {
        toast.push({status: 'error', title: 'Too many ASINs', description: 'Maximum 10 ASINs allowed'})
        return
      }
      
      // Call bulk import endpoint
      const res = await fetch('/api/amazon/bulk-import', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          asins: asinArray,
          postType: importSettings.postType,
          postStatus: importSettings.postStatus
        }),
      })
      
      if (!res.ok) throw new Error('Bulk import failed')
      const data = await res.json()
      toast.push({status: 'success', title: 'Bulk import completed', description: data.message})
      setBulkAsins('')
    } catch (e: any) {
      toast.push({status: 'error', title: 'Bulk import failed', description: e?.message})
    } finally {
      setLoading(false)
    }
  }, [bulkAsins, importSettings, toast])

  const handleClearCache = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/amazon/clear-cache', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      })
      if (!res.ok) throw new Error('Cache clear failed')
      toast.push({status: 'success', title: 'Cache cleared', description: 'All cached data has been removed'})
    } catch (e: any) {
      toast.push({status: 'error', title: 'Cache clear failed', description: e?.message})
    } finally {
      setLoading(false)
    }
  }, [toast])

  return (
    <Card padding={4}>
      <Stack space={4}>
        <Heading size={2}>Amazon Products</Heading>
        <Text muted>
          Fetch and import Amazon products by ASIN. Supports single product creation and bulk import (up to 10 products).
        </Text>
        
        {/* Tab Navigation */}
        <Flex gap={2}>
          <Button 
            mode={activeTab === 'single' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('single')}
            text="Single Product"
          />
          <Button 
            mode={activeTab === 'bulk' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('bulk')}
            text="Bulk Import"
          />
        </Flex>

        {activeTab === 'single' ? (
          // Single Product Tab
          <Stack space={3}>
            <Flex gap={2}>
              <Box flex={1}>
                <TextInput placeholder="ASIN" value={asin} onChange={(e) => setAsin(e.currentTarget.value)} />
              </Box>
              <Button text="Fetch" tone="primary" disabled={!asin || loading} onClick={handleFetch} />
            </Flex>
            {loading && (
              <Flex align="center" justify="center" padding={4}>
                <Spinner muted />
              </Flex>
            )}
            {result && (
              <Card padding={3} radius={2} tone="transparent" shadow={1}>
                <Stack space={3}>
                  <Heading size={1}>{result.title || '—'}</Heading>
                  <Text size={1}>ASIN: {result.asin}</Text>
                  <Text size={1}>Brand: {result.brand || '—'}</Text>
                  <Text size={1}>Price: {result.price || '—'}</Text>
                  <Text size={1}>Sale Price: {result.salePrice || '—'}</Text>
                  <Text size={1}>Currency: {result.currency || '—'}</Text>
                  <Inline space={2}>
                    <Button text="Create Document" tone="primary" onClick={handleCreate} />
                    {result.url && (
                      <Button as="a" target="_blank" href={result.url} text="View on Amazon" />
                    )}
                  </Inline>
                </Stack>
              </Card>
            )}
          </Stack>
        ) : (
          // Bulk Import Tab
          <Stack space={3}>
            <Text size={1} muted>
              Enter up to 10 ASIN numbers separated by commas
            </Text>
            <TextArea 
              placeholder="B08N5WRWNW, B08N5WRWNW, B08N5WRWNW"
              value={bulkAsins}
              onChange={(e) => setBulkAsins(e.currentTarget.value)}
              rows={4}
            />
            
            <Grid columns={2} gap={3}>
              <Stack space={2}>
                <Label>Post Type</Label>
                <Stack space={2}>
                  <Radio 
                    checked={importSettings.postType === 'post'}
                    onChange={() => setImportSettings(prev => ({...prev, postType: 'post'}))}
                    name="postType"
                    value="post"
                  />
                  <Radio 
                    checked={importSettings.postType === 'page'}
                    onChange={() => setImportSettings(prev => ({...prev, postType: 'page'}))}
                    name="postType"
                    value="page"
                  />
                </Stack>
              </Stack>
              
              <Stack space={2}>
                <Label>Post Status</Label>
                <Stack space={2}>
                  <Radio 
                    checked={importSettings.postStatus === 'publish'}
                    onChange={() => setImportSettings(prev => ({...prev, postStatus: 'publish'}))}
                    name="postStatus"
                    value="publish"
                  />
                  <Radio 
                    checked={importSettings.postStatus === 'draft'}
                    onChange={() => setImportSettings(prev => ({...prev, postStatus: 'draft'}))}
                    name="postStatus"
                    value="draft"
                  />
                  <Radio 
                    checked={importSettings.postStatus === 'private'}
                    onChange={() => setImportSettings(prev => ({...prev, postStatus: 'private'}))}
                    name="postStatus"
                    value="private"
                  />
                </Stack>
              </Stack>
            </Grid>
            
            <Button 
              text="Import Products" 
              tone="primary" 
              disabled={!bulkAsins.trim() || loading} 
              onClick={handleBulkImport} 
            />
          </Stack>
        )}

        {/* Cache Management */}
        <Card padding={3} radius={2} tone="caution">
          <Stack space={2}>
            <Text size={1} weight="semibold">Cache Management</Text>
            <Text size={1}>
              Products are cached for 24 hours to reduce API calls. Clear cache to force fresh data.
            </Text>
            <Button text="Clear Cache" tone="critical" onClick={handleClearCache} disabled={loading} />
          </Stack>
        </Card>

        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>
            Configure your Function at <Code>/api/amazon/fetch</Code>. It must use your PA-API keys and return
            basic product info. See plugin README for a starter Function.
          </Text>
        </Card>
      </Stack>
    </Card>
  )
}

