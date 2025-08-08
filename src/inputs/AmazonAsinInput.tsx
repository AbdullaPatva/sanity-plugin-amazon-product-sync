import React, {useCallback, useMemo, useState} from 'react'
import {Box, Button, Card, Flex, Stack, Text, TextInput} from '@sanity/ui'
import {set} from 'sanity'
import type {StringInputProps} from 'sanity'

type Props = StringInputProps

export function AmazonAsinInput(props: Props) {
  const {onChange, value, schemaType} = props
  const [asin, setAsinState] = useState<string>(() => (typeof value === 'string' ? value : ''))

  const disabled = useMemo(() => !asin || asin.trim().length < 5, [asin])

  const handleFetch = useCallback(async () => {
    try {
      // Call Sanity Function route (user will deploy under /api/amazon/fetch)
      const res = await fetch('/api/amazon/fetch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({asin}),
      })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      // Apply returned fields to the current document via patches in the tool/Action; here set ASIN only
      onChange(set(asin))
      // Optional: The tool will materialize full product; input only ensures the asin field is set.
      alert('Fetched product data. Open the Amazon tool to sync all fields.')
    } catch (err) {
      console.error(err)
      alert('Failed to fetch product. Check settings and function logs.')
    }
  }, [asin, onChange])

  return (
    <Card padding={3} tone="primary" radius={2} shadow={1}>
      <Stack space={3}>
        <Text size={1} muted>
          {schemaType.title || 'ASIN'}
        </Text>
        <Flex gap={2}>
          <Box flex={1}>
            <TextInput
              value={asin}
              onChange={(e) => setAsinState(e.currentTarget.value)}
              placeholder="Enter Amazon ASIN"
            />
          </Box>
          <Button text="Fetch" tone="primary" disabled={disabled} onClick={handleFetch} />
        </Flex>
        <Text size={1} muted>
          This field stores the ASIN. Use the Amazon tool to populate title, images, price, etc.
        </Text>
      </Stack>
    </Card>
  )
}

