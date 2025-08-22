import {useState} from 'react'
import {Button, Card, Flex, Stack, Text, useToast} from '@sanity/ui'
import type {InputProps} from 'sanity'
import {useFormValue} from 'sanity'
import {getApiBaseUrl, getTestConnectionPath} from '../lib/config'

export type SettingsActionsInputProps = InputProps & {
  // document is available on props in Studio; typing as any for plugin portability
  document?: any
}

export function AmazonSettingsActions(props: SettingsActionsInputProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  
  // Real-time form values
  const accessKey = useFormValue(['accessKey']) as string
  const secretKey = useFormValue(['secretKey']) as string
  const partnerTag = useFormValue(['partnerTag']) as string
  const asinNumber = useFormValue(['asinNumber']) as string
  const region = useFormValue(['region']) as string

  const hasCredentials = Boolean(accessKey && secretKey && partnerTag && asinNumber)

  return (
    <Card padding={3} tone="primary" radius={2} shadow={1}>
      <Stack space={3}>
        <Flex gap={2}>
          <Button
            text="Test API Connection"
            tone="positive"
            disabled={loading || !hasCredentials}
            onClick={async () => {
              if (!accessKey || !secretKey || !partnerTag || !asinNumber) {
                toast.push({
                  status: 'warning',
                  title: 'Missing Credentials',
                  description: 'Please fill in all required fields first'
                })
                return
              }
              
              setLoading(true)
              try {
                const apiUrl = `${getApiBaseUrl()}${getTestConnectionPath()}`
                const response = await fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    testAsin: asinNumber
                  })
                })

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}))
                  throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
                }

                const result = await response.json()
                
                if (result.success) {
                  toast.push({
                    status: 'success',
                    title: 'Amazon API Test Successful!',
                    description: `Successfully fetched: ${result.testProduct.title}`
                  })
                } else {
                  throw new Error(result.error || 'API test failed')
                }
              } catch (error: any) {
                toast.push({
                  status: 'error',
                  title: 'API Test Failed',
                  description: error?.message || 'Unknown error occurred'
                })
              } finally {
                setLoading(false)
              }
            }}
            loading={loading}
          />
          
          <Button
            text="Debug Document"
            tone="caution"
            disabled={loading}
            onClick={() => {
              const debugInfo = {
                accessKey: accessKey ? `${accessKey.substring(0, 8)}...` : 'Not set',
                secretKey: secretKey ? `${secretKey.substring(0, 8)}...` : 'Not set',
                partnerTag: partnerTag || 'Not set',
                asinNumber: asinNumber || 'Not set',
                region: region || 'Not set',
                hasCredentials
              }
              
              console.log('Amazon Settings Debug Info:', debugInfo)
              
              toast.push({
                status: 'info',
                title: 'Debug Info Logged',
                description: 'Check browser console for details'
              })
            }}
          />
        </Flex>
        <Text size={1}>
          Please make sure to "Publish" the document incase you have modified the Access Key, Secret Key, or Partner Tag.
        </Text>
        {hasCredentials && (
          <Text size={1} muted>
            ✅ Ready to test API connection with {asinNumber}
          </Text>
        )}
      </Stack>
    </Card>
  )
}