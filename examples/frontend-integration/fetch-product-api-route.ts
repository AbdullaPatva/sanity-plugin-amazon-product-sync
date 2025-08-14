// app/api/amazon/fetch-product/route.ts
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
    const { asin } = body

    if (!asin) {
      const response = NextResponse.json({
        success: false,
        message: 'ASIN is required',
        error: 'Please provide an ASIN number'
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

    // Fetch product data
    const product = await amazonClient.fetchProduct(asin)
    
    const response = NextResponse.json({
      success: true,
      message: 'Product fetched successfully!',
      product: product,
      timestamp: new Date().toISOString()
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3333')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response

  } catch (error: unknown) {
    console.error('Amazon API Fetch Product Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const response = NextResponse.json({
      success: false,
      message: 'Product fetch failed',
      error: errorMessage
    }, { status: 500 })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3333')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
  }
}