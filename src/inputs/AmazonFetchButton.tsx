import * as React from 'react'
import { useCallback, useState } from 'react'
import { Button, Card, Flex, Stack, Text, useToast } from '@sanity/ui'
import type { InputProps } from 'sanity'
import { useClient, useFormValue } from 'sanity'
import { getApiBaseUrl, getFetchProductPath } from '../lib/config'

export type AmazonFetchButtonInputProps = InputProps & {
  document?: any
}

export function AmazonFetchButton(props: AmazonFetchButtonInputProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const client = useClient({ apiVersion: '2025-01-01' })

  // State to store Amazon settings
  const [amazonSettings, setAmazonSettings] = useState<any>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // Fetch Amazon settings using GROQ
  React.useEffect(() => {
    const fetchAmazonSettings = async () => {
      try {
        const query = `*[_type == "amazon.settings"][0]{
          accessKey,
          secretKey,
          region,
          partnerTag
        }`
        
        const settings = await client.fetch(query)
        setAmazonSettings(settings)
      } catch (error) {
        console.error('Error fetching Amazon settings:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }

    fetchAmazonSettings()
  }, [client])

  // Get ASIN value from the form context
  const asinValue = useFormValue(['asin']) as string || ''
  const documentID = useFormValue(['_id']) as string || ''

  const handleFetchFromAmazon = useCallback(async () => {
    if (!asinValue) {
      toast.push({
        status: 'warning',
        title: 'ASIN Required',
        description: 'Please enter an ASIN number first'
      })
      return
    }

    if (!amazonSettings?.accessKey || !amazonSettings?.secretKey || !amazonSettings?.partnerTag) {
      toast.push({
        status: 'warning',
        title: 'Missing Amazon Settings',
        description: 'Please configure Amazon API credentials first'
      })
      return
    }

    
    if (!documentID) {
      toast.push({
        status: 'error',
        title: 'Document Not Found',
        description: 'Cannot update document - document ID not available. Please save the document first.'
      })
      return
    }

    setLoading(true)

    try {
      const apiUrl = `${getApiBaseUrl()}${getFetchProductPath()}`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin: asinValue })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const updateData = {
          title: result.product.title,
          slug: { current: result.product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') },
          brand: result.product.brand,
          price: result.product.price,
          salePrice: result.product.salePrice,
          currency: result.product.currency,
          listPrice: result.product.listPrice,
          url: result.product.url,
          features: result.product.features,
          images: result.product.images,
          lastSyncedAt: result.product.lastSyncedAt
        }

        await client.patch(documentID).set(updateData).commit()

        toast.push({
          status: 'success',
          title: 'Product Fetched Successfully!',
          description: `Fetched: ${result.product.title}`
        })
      } else {
        throw new Error(result.error || 'Failed to fetch product data')
      }
    } catch (error: any) {
      toast.push({
        status: 'error',
        title: 'Fetch Failed',
        description: error?.message || 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }, [asinValue, amazonSettings, client, toast, documentID])

  return (
    <Card padding={3} tone="primary" radius={2} shadow={1}>
      <Stack space={3}>
        <Flex gap={2}>
          <Button
            text="Fetch from Amazon"
            tone="positive"
            disabled={!asinValue || loading || isLoadingSettings}
            onClick={handleFetchFromAmazon}
            loading={loading}
          />
        </Flex>
        
        <Text size={1} muted>
          {isLoadingSettings 
            ? 'Loading Amazon settings...'
            : !amazonSettings?.accessKey 
            ? 'Please configure Amazon API credentials first'
            : !asinValue 
            ? 'Enter an ASIN number above, then click "Fetch from Amazon" to automatically populate product details.'
            : loading
            ? 'Fetching product data from Amazon...'
            : `Ready to fetch product data for ASIN: ${asinValue}`
          }
        </Text>
        
        {asinValue && !loading && !isLoadingSettings && (
          <Text size={1} muted>
            ✅ ASIN entered: {asinValue}
          </Text>
        )}
      </Stack>
    </Card>
  )
} 