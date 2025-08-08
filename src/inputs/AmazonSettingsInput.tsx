import * as React from 'react'
import {useCallback, useState} from 'react'
import {Box, Button, Card, Flex, Stack, Text} from '@sanity/ui'
import type {FormInputProps} from 'sanity'

type Props = FormInputProps

export function AmazonSettingsInput(props: Props) {
  const {value, onChange, schemaType} = props
  const [loading, setLoading] = useState(false)

  const handleTestApiConnection = useCallback(async () => {
    if (!value?.asinNumber) {
      alert('Please enter an ASIN number first')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/amazon/fetch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({asin: value.asinNumber}),
      })
      
      if (res.ok) {
        alert('API connection successful! Product data fetched successfully.')
      } else {
        alert('API connection failed. Please check your credentials and try again.')
      }
    } catch (err) {
      alert('API connection failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }, [value?.asinNumber])

  const handleClearCache = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/amazon/clear-cache', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      })
      
      if (res.ok) {
        alert('Cache cleared successfully!')
      } else {
        alert('Failed to clear cache. Please try again.')
      }
    } catch (err) {
      alert('Failed to clear cache. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Card padding={3} tone="primary" radius={2} shadow={1}>
      <Stack space={3}>
        <Text size={1} muted>
          {schemaType.title || 'Amazon Settings'}
        </Text>
        
        {/* API Action Buttons */}
        <Flex gap={2}>
          <Button 
            text="Test API Connection" 
            tone="primary" 
            disabled={!value?.asinNumber || loading} 
            onClick={handleTestApiConnection} 
          />
          <Button 
            text="Clear Cache" 
            tone="critical" 
            disabled={loading} 
            onClick={handleClearCache} 
          />
        </Flex>
        
        <Text size={1} muted>
          Use these buttons to test your API connection and manage cache. Enter an ASIN number first to test the connection.
        </Text>
      </Stack>
    </Card>
  )
} 