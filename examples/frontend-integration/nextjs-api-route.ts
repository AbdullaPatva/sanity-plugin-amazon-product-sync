// app/api/amazon/test-connection/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAmazonSettings } from '@/lib/sanity'
import { AmazonClient } from '@/lib/amazon-client'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3333',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body to get credentials and test ASIN
    const body = await request.json()
    const { testAsin, accessKey, secretKey, partnerTag, region } = body

    if (!testAsin || !accessKey || !secretKey || !partnerTag) {
      const response = NextResponse.json({
        success: false,
        message: 'Missing required fields',
        error: 'Please provide testAsin, accessKey, secretKey, and partnerTag'
      }, { status: 400 })

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3333')
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      
      return response
    }

    // Create Amazon client with credentials from request body (real-time form values)
    const amazonClient = new AmazonClient({
      accessKey,
      secretKey,
      partnerTag,
      region: region || 'com'
    })

    // Test the connection by fetching product data
    const product = await amazonClient.testConnection(testAsin)
    
    const response = NextResponse.json({
      success: true,
      message: 'Amazon API connection successful!',
      testProduct: product,
      settings: {
        region: region || 'com',
        partnerTag: partnerTag,
        cacheHours: 0 // No cache for real-time testing
      },
      timestamp: new Date().toISOString()
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3333')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response

  } catch (error: unknown) {
    console.error('Amazon API Test Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const response = NextResponse.json({
      success: false,
      message: 'Amazon API test failed',
      error: errorMessage
    }, { status: 500 })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3333')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
  }
}