import * as React from 'react'
import { useCallback, useState, useEffect } from 'react'
import { Button, Card, Flex, Stack, Text, useToast, TextInput, Box } from '@sanity/ui'
import type { FormInputProps } from 'sanity'
import { useClient, set } from 'sanity'

export type AmazonAsinInputProps = FormInputProps & {
  document?: any
}

export function AmazonAsinInput(props: AmazonAsinInputProps) {
  const { schemaType, document, value, onChange } = props as any
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const client = useClient({ apiVersion: '2025-01-01' })

  // Debug: Log all props and values
  useEffect(() => {
    console.log('🔍 AmazonAsinInput Debug Info:')
    console.log('Props:', props)
    console.log('Value:', value)
    console.log('Document:', document)
    console.log('Document ASIN:', document?.asin)
    console.log('OnChange function:', onChange)
  }, [props, value, document, onChange])

  const handleInputChange = (next: string) => {
    const trimmed = next ?? ''
    console.log('🔍 ASIN Input Change:', { next, trimmed })
    onChange(set(trimmed))
  }

  const handleFetchFromAmazon = useCallback(async () => {
    if (!value) {
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
          asin: value
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
  }, [value, client, toast, document])

  return (
    <Stack space={3}>
      {/* Debug info display */}
      <Card padding={2} tone="caution" radius={1}>
        <Stack space={2}>
          <Text size={0} weight="semibold">🔍 ASIN Input Debug:</Text>
          <Text size={0}>Current Value: {value || 'EMPTY'}</Text>
          <Text size={0}>Document ASIN: {JSON.stringify(document?.asin)}</Text>
          <Text size={0}>OnChange Type: {typeof onChange}</Text>
        </Stack>
      </Card>

      {/* Default ASIN input */}
      <Box>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          {schemaType.title || 'ASIN'}
        </label>
        <TextInput
          value={value || ''}
          onChange={(e) => handleInputChange(e.currentTarget.value)}
          placeholder="Enter Amazon ASIN (e.g., B0F15TM77B)"
        />
      </Box>

      {/* Fetch from Amazon button (convenience) */}
      {value && (
        <Card padding={3} tone="primary" radius={2} shadow={1}>
          <Stack space={3}>
            <Text size={1} muted>Fetch Product Details</Text>
            
            <Flex gap={2}>
              <Button
                text="Fetch from Amazon"
                tone="positive"
                disabled={loading}
                onClick={handleFetchFromAmazon}
                loading={loading}
              />
            </Flex>
            
            <Text size={1} muted>
              {loading 
                ? 'Fetching product data from Amazon...'
                : `Ready to fetch product data for ASIN: ${value}`
              }
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}

