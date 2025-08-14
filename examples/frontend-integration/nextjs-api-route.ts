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
    // Get Amazon settings from Sanity
    const settings = await getAmazonSettings()
    
    if (!settings) {
      const response = NextResponse.json({
        success: false,
        message: 'Amazon API credentials not configured',
        error: 'Please configure your Amazon API credentials in Sanity Studio first'
      }, { status: 400 })

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3333')
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      
      return response
    }

    // Parse request body
    const body = await request.json()
    const { testAsin } = body

    if (!testAsin) {
      const response = NextResponse.json({
        success: false,
        message: 'Test ASIN is required',
        error: 'Please provide a test ASIN number'
      }, { status: 400 })

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3333')
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      
      return response
    }

    // Create Amazon client with credentials from Sanity
    const amazonClient = new AmazonClient({
      accessKey: settings.accessKey,
      secretKey: settings.secretKey,
      partnerTag: settings.partnerTag,
      region: settings.region
    })

    // Test the connection by fetching product data
    const product = await amazonClient.testConnection(testAsin)
    
    const response = NextResponse.json({
      success: true,
      message: 'Amazon API connection successful!',
      testProduct: product,
      settings: {
        region: settings.region,
        partnerTag: settings.partnerTag,
        cacheHours: settings.cacheHours
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