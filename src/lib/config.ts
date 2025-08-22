/**
 * Amazon Plugin Configuration
 * 
 * This file centralizes configuration settings for the Amazon plugin,
 * including API endpoints and environment variable handling.
 */

/**
 * Get the API base URL from environment variables
 * 
 * @returns The API base URL (e.g., http://localhost:3001)
 * @throws Error if SANITY_STUDIO_AMAZON_API_URL is not defined
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.SANITY_STUDIO_AMAZON_API_URL
  
  if (!envUrl) {
    throw new Error('SANITY_STUDIO_AMAZON_API_URL environment variable is not defined. Please add it to your .env.local file in the Sanity Studio root.')
  }
  
  // Validate URL format
  try {
    new URL(envUrl)
    return envUrl
  } catch {
    throw new Error(`Invalid SANITY_STUDIO_AMAZON_API_URL format: ${envUrl}. Please provide a valid URL (e.g., http://localhost:3001)`)
  }
}

/**
 * Get the test connection endpoint path from environment variables
 * 
 * @returns The test connection endpoint path
 * @throws Error if SANITY_STUDIO_AMAZON_TEST_CONNECTION_PATH is not defined
 */
export function getTestConnectionPath(): string {
  const path = process.env.SANITY_STUDIO_AMAZON_TEST_CONNECTION_PATH
  
  if (!path) {
    throw new Error('SANITY_STUDIO_AMAZON_TEST_CONNECTION_PATH environment variable is not defined. Please add it to your .env.local file in the Sanity Studio root.')
  }
  
  return path
}

/**
 * Get the fetch product endpoint path from environment variables
 * 
 * @returns The fetch product endpoint path
 * @throws Error if SANITY_STUDIO_AMAZON_FETCH_PRODUCT_PATH is not defined
 */
export function getFetchProductPath(): string {
  const path = process.env.SANITY_STUDIO_AMAZON_FETCH_PRODUCT_PATH
  
  if (!path) {
    throw new Error('SANITY_STUDIO_AMAZON_FETCH_PRODUCT_PATH environment variable is not defined. Please add it to your .env.local file in the Sanity Studio root.')
  }
  
  return path
} 