import * as React from 'react'
import {useCallback, useState} from 'react'
import {Button, Card, Flex, Stack, Text, useToast} from '@sanity/ui'
import type {FormInputProps} from 'sanity'

export type SettingsActionsInputProps = FormInputProps & {
  // document is available on props in Studio; typing as any for plugin portability
  document?: any
}

export function AmazonSettingsActions(props: SettingsActionsInputProps) {
  const {schemaType, document} = props as any
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const asinNumber: string | undefined = document?.asinNumber

  const handleTestApiConnection = useCallback(async () => {
    if (!asinNumber) {
      toast.push({status: 'warning', title: 'Enter an ASIN first', description: 'Provide a test ASIN in settings.'})
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/amazon/fetch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({asin: asinNumber}),
      })

      if (res.ok) {
        toast.push({status: 'success', title: 'API connection successful'})
      } else {
        toast.push({status: 'error', title: 'API connection failed'})
      }
    } catch (err) {
      toast.push({status: 'error', title: 'API connection failed'})
    } finally {
      setLoading(false)
    }
  }, [asinNumber, toast])

  const handleClearCache = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/amazon/clear-cache', {method: 'POST', headers: {'Content-Type': 'application/json'}})
      if (res.ok) {
        toast.push({status: 'success', title: 'Cache cleared'})
      } else {
        toast.push({status: 'error', title: 'Failed to clear cache'})
      }
    } catch (err) {
      toast.push({status: 'error', title: 'Failed to clear cache'})
    } finally {
      setLoading(false)
    }
  }, [toast])

  return (
    <Card padding={3} tone="primary" radius={2} shadow={1}>
      <Stack space={3}>
        <Text size={1} muted>{schemaType.title || 'Actions'}</Text>
        <Flex gap={2}>
          <Button
            text="Test API Connection"
            tone="primary"
            disabled={!asinNumber || loading}
            onClick={handleTestApiConnection}
          />
          <Button
            text="Clear Cache"
            tone="critical"
            disabled={loading}
            onClick={handleClearCache}
          />
        </Flex>
        <Text size={1} muted>Use these buttons to test your API credentials and manage cache.</Text>
      </Stack>
    </Card>
  )
}