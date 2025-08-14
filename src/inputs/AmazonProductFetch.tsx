import * as React from 'react'
import { useCallback, useState } from 'react'
import { Button, Card, Flex, Stack, Text, useToast } from '@sanity/ui'
import type { InputProps } from 'sanity'
import { useClient } from 'sanity'

export type AmazonProductFetchInputProps = InputProps & {
  document?: any
}

export function AmazonProductFetch(props: AmazonProductFetchInputProps) {
  const { schemaType, document } = props as any
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const client = useClient({ apiVersion: '2025-01-01' })

  const asinNumber = document?.asin?.asin || document?.asin

  const handleFetchFromAmazon = useCallback(async () => {
    if (!asinNumber) {
      toast.push({
        status: 'warning',
        title: 'ASIN Required',
        description: 'Please enter an ASIN number first'
      })
      return
    }

    setLoading(true)
    try {
      // Call the user's frontend API endpoint
      const response = await fetch('http://localhost:3001/api/amazon/fetch-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asin: asinNumber
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Update the document with fetched data
        const updateData = {
          title: result.product.title,
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

        // Use Sanity client to update the document
        await client.patch(document._id).set(updateData).commit()

        toast.push({
          status: 'success',
          title: 'Product Fetched Successfully!',
          description: `Fetched: ${result.product.title}`
        })

        // Trigger a re-render of the form
        window.location.reload()
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
  }, [asinNumber, client, toast])

  return (
    <Card padding={3} tone="primary" radius={2} shadow={1}>
      <Stack space={3}>
        <Text size={1} muted>{schemaType.title || 'Fetch from Amazon'}</Text>
        
        <Flex gap={2}>
          <Button
            text="Fetch from Amazon"
            tone="positive"
            disabled={!asinNumber || loading}
            onClick={handleFetchFromAmazon}
            loading={loading}
          />
        </Flex>
        
        <Text size={1} muted>
          {!asinNumber 
            ? 'Enter an ASIN number above, then click "Fetch from Amazon" to automatically populate product details.'
            : loading
            ? 'Fetching product data from Amazon...'
            : `Ready to fetch product data for ASIN: ${asinNumber}`
          }
        </Text>
        
        {asinNumber && !loading && (
          <Text size={1} muted>
            ✅ ASIN entered: {asinNumber}
          </Text>
        )}
      </Stack>
    </Card>
  )
} 