import React, {useCallback, useState} from 'react'
import {Box, Button, Card, Flex, Heading, Inline, Spinner, Stack, Text, TextInput, useToast} from '@sanity/ui'
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

export function AmazonTool() {
  const client = useClient({apiVersion: '2025-05-01'})
  const toast = useToast()
  const [asin, setAsin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProductData | null>(null)

  const handleFetch = useCallback(async () => {
    if (!asin) return
    setLoading(true)
    try {
      const res = await fetch('/api/amazon/fetch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({asin}),
      })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      setResult(data)
      toast.push({status: 'success', title: 'Product fetched', description: data.title || 'No title'})
    } catch (e: any) {
      toast.push({status: 'error', title: 'Fetch failed', description: e?.message})
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
        title: result.title || '',
        url: result.url || '',
        brand: result.brand || '',
        price: result.price || '',
        salePrice: result.salePrice || '',
        currency: result.currency || 'USD',
        listPrice: result.listPrice || '',
        images: result.images || [],
        lastSyncedAt: new Date().toISOString(),
      }

      const createdDoc = await client.create(doc)
      toast.push({
        status: 'success',
        title: 'Product created',
        description: `Document created with ID: ${createdDoc._id}`,
      })
      setResult(null)
      setAsin('')

    } catch (e: any) {
      toast.push({status: 'error', title: 'Create failed', description: e?.message})
    } finally {
      setLoading(false)
    }
  }, [client, result, toast])

  return (
    <Card padding={4}>
      <Stack space={4}>
        <Heading size={2}>Amazon Products</Heading>
        <Text muted>
          Fetch Amazon products by ASIN and create product documents in your studio.
        </Text>
        
        <Stack space={3}>
          <Flex gap={2}>
            <Box flex={1}>
              <TextInput 
                placeholder="Enter ASIN (e.g., B0F15TM77B)" 
                value={asin} 
                onChange={(e) => setAsin(e.currentTarget.value)} 
              />
            </Box>
            <Button 
              text="Fetch Product" 
              tone="primary" 
              disabled={!asin || loading} 
              onClick={handleFetch} 
              loading={loading}
            />
          </Flex>
          
          {loading && (
            <Flex align="center" justify="center" padding={4}>
              <Spinner muted />
              <Text muted size={1} style={{ marginLeft: '8px' }}>
                Fetching product data...
              </Text>
            </Flex>
          )}
          
          {result && (
            <Card padding={3} radius={2} tone="positive" shadow={1}>
              <Stack space={3}>
                <Heading size={1}>{result.title || 'Untitled Product'}</Heading>
                <Text size={1}><strong>ASIN:</strong> {result.asin}</Text>
                <Text size={1}><strong>Brand:</strong> {result.brand || 'Unknown'}</Text>
                <Text size={1}><strong>Price:</strong> {result.price || 'Not available'}</Text>
                {result.salePrice && (
                  <Text size={1}><strong>Sale Price:</strong> {result.salePrice}</Text>
                )}
                <Text size={1}><strong>Currency:</strong> {result.currency || 'USD'}</Text>
                
                <Inline space={2}>
                  <Button 
                    text="Create Document" 
                    tone="primary" 
                    onClick={handleCreate} 
                    disabled={loading}
                  />
                  {result.url && (
                    <Button 
                      as="a" 
                      target="_blank" 
                      href={result.url} 
                      text="View on Amazon" 
                      mode="ghost"
                    />
                  )}
                </Inline>
              </Stack>
            </Card>
          )}
        </Stack>

        <Card padding={3} radius={2} tone="caution">
          <Stack space={2}>
            <Text size={1} weight="semibold">API Configuration Required</Text>
            <Text size={1}>
              This tool requires a working API endpoint at <code>/api/amazon/fetch</code> in your frontend. 
              See the plugin README for setup instructions with Next.js, Express.js, or other frameworks.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Card>
  )
}