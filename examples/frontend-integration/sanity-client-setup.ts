import { createClient } from '@sanity/client'

// ====================================================
// SANITY CLIENT CONFIGURATION - PRODUCTION READY
// ====================================================

/**
 * Client-side Sanity client configuration
 * 
 * IMPORTANT: This client is used for reading public data from the browser.
 * No token is needed for reading amazon.product documents if they're public.
 * 
 * Key configurations:
 * - useCdn: true for better performance on client-side
 * - No token needed for public documents
 * - API version set to current date for stability
 */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: true, // Use CDN for better performance on client-side
  // No token needed for reading public documents
})

/**
 * Server-side Sanity client with admin privileges
 * 
 * This client is used on the server-side for:
 * - Reading amazon.settings (which may be private)
 * - Creating/updating documents via API routes
 * - Admin operations
 * 
 * Key configurations:
 * - useCdn: false for fresh data on server-side
 * - token: required for private documents and write operations
 * - Only available in server-side contexts
 */
export const sanityAdminClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: false, // Don't use CDN for admin operations
  token: process.env.SANITY_API_TOKEN, // Only available server-side
})

// ====================================================
// HELPER FUNCTIONS
// ====================================================

/**
 * Get Amazon settings from Sanity (server-side only)
 * 
 * This function should only be called from API routes or server components
 * because it requires the SANITY_API_TOKEN.
 */
export async function getAmazonSettings() {
  try {
    const query = `*[_type == "amazon.settings"][0]{
      region,
      accessKey,
      secretKey,
      partnerTag,
      asinNumber,
      cacheHours
    }`
    
    const settings = await sanityAdminClient.fetch(query)
    
    if (!settings || !settings.accessKey || !settings.secretKey || !settings.partnerTag) {
      return null
    }
    
    return {
      region: settings.region || 'com',
      accessKey: settings.accessKey,
      secretKey: settings.secretKey,
      partnerTag: settings.partnerTag,
      asinNumber: settings.asinNumber || '',
      cacheHours: settings.cacheHours || 24
    }
  } catch (error) {
    console.error('Error fetching Amazon settings:', error)
    return null
  }
}

/**
 * Test the client-side Sanity connection
 * 
 * This function can be called from the browser to verify
 * that the client can read amazon.product documents.
 */
export async function testSanityConnection(asin: string = 'B09XFQL45V') {
  try {
    const query = `*[_type == "amazon.product" && asin == $asin][0]{
      _id,
      asin,
      title,
      brand,
      price
    }`
    
    const product = await sanityClient.fetch(query, { asin })
    
    if (product) {
      console.log('✅ Sanity connection successful:', product.title)
      return { success: true, product }
    } else {
      console.log('⚠️ No product found with ASIN:', asin)
      return { success: false, error: 'Product not found' }
    }
  } catch (error) {
    console.error('❌ Sanity connection failed:', error)
    return { success: false, error: error.message }
  }
}

// ====================================================
// ENVIRONMENT VARIABLE VALIDATION
// ====================================================

/**
 * Validate required environment variables
 * 
 * Call this function during app initialization to ensure
 * all required environment variables are set.
 */
export function validateSanityConfig() {
  const errors: string[] = []
  
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    errors.push('NEXT_PUBLIC_SANITY_PROJECT_ID is required')
  }
  
  if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
    errors.push('NEXT_PUBLIC_SANITY_DATASET is required')
  }
  
  // Only check for token on server-side
  if (typeof window === 'undefined' && !process.env.SANITY_API_TOKEN) {
    errors.push('SANITY_API_TOKEN is required for server-side operations')
  }
  
  if (errors.length > 0) {
    throw new Error(`Sanity configuration errors:\n${errors.join('\n')}`)
  }
  
  return true
}

// ====================================================
// GROQ QUERIES
// ====================================================

export const QUERIES = {
  // Get product by ASIN
  productByAsin: `*[_type == "amazon.product" && asin == $asin][0]{
    _id,
    asin,
    title,
    brand,
    price,
    salePrice,
    currency,
    listPrice,
    url,
    images,
    features,
    lastSyncedAt
  }`,
  
  // Get product by Reference ID
  productByReferenceId: `*[_type == "amazon.product" && _id == $referenceId][0]{
    _id,
    asin,
    title,
    brand,
    price,
    salePrice,
    currency,
    listPrice,
    url,
    images,
    features,
    lastSyncedAt
  }`,
  
  // Unified query for either ASIN or Reference ID lookup
  productLookup: `*[_type == "amazon.product" && (
    ($asin != null && asin == $asin) || 
    ($referenceId != null && _id == $referenceId)
  )][0]{
    _id,
    asin,
    title,
    brand,
    price,
    salePrice,
    currency,
    listPrice,
    url,
    images,
    features,
    lastSyncedAt
  }`,
  
  // Get all products
  allProducts: `*[_type == "amazon.product"] | order(lastSyncedAt desc) {
    _id,
    asin,
    title,
    brand,
    price,
    currency,
    images[0],
    lastSyncedAt
  }`,
  
  // Get products by brand
  productsByBrand: `*[_type == "amazon.product" && brand match $brand + "*"] {
    _id,
    asin,
    title,
    brand,
    price,
    currency,
    images[0]
  }`,
  
  // Get recent products
  recentProducts: `*[_type == "amazon.product"] | order(lastSyncedAt desc) [0...$limit] {
    _id,
    asin,
    title,
    brand,
    price,
    currency,
    images[0],
    lastSyncedAt
  }`
}

// ====================================================
// TYPESCRIPT INTERFACES
// ====================================================

export interface SanityConfig {
  projectId: string
  dataset: string
  apiVersion: string
  useCdn: boolean
  token?: string
}

export interface AmazonSettings {
  region: string
  accessKey: string
  secretKey: string
  partnerTag: string
  asinNumber: string
  cacheHours: number
}

export interface ProductSummary {
  _id: string
  asin: string
  title: string
  brand: string
  price: string
  currency: string
  images: Array<{ url: string }>
  lastSyncedAt: string
}