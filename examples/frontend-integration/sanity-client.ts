import { createClient } from '@sanity/client'

// Sanity client configuration
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, // Your Sanity project ID
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', // Your dataset
  apiVersion: '2025-01-01',
  useCdn: false, // We need fresh data for API calls
  token: process.env.SANITY_API_TOKEN, // Required for private datasets and accessing amazon.settings
})

// Helper function to get Amazon settings
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
    
    const settings = await sanityClient.fetch(query)
    
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