import React from 'react'
import { useEffect, useState } from 'react'
import { SanityClient } from '@sanity/client'

// Types for our Amazon product data
export interface AmazonProduct {
  _id: string
  asin: string
  title: string
  brand: string
  price: string
  salePrice?: string
  currency: string
  listPrice?: string
  url: string
  images: Array<{
    _key: string
    url: string
    width?: number
    height?: number
  }>
  features: string[]
  lastSyncedAt: string
}

export interface AmazonProductDisplayProps {
  // Option 1: Pass product data directly (from reference field)
  product?: AmazonProduct
  
  // Option 2: Pass ASIN to fetch product directly
  asin?: string
  
  // Option 3: Pass reference ID to fetch product directly
  referenceId?: string
  
  // Sanity client for fetching (required when using asin or referenceId)
  client?: SanityClient
  
  // Display options
  showFeatures?: boolean
  showImages?: boolean
  showPrice?: boolean
  showBrand?: boolean
  showCTA?: boolean
  
  // Styling options
  className?: string
  imageSize?: 'small' | 'medium' | 'large'
  layout?: 'horizontal' | 'vertical' | 'card'
  
  // Custom CTA text
  ctaText?: string
  
  // Development options
  debug?: boolean
  
  // Callback when product is clicked
  onProductClick?: (product: AmazonProduct) => void
}

// Unified GROQ query to fetch product by either ASIN or reference ID
const PRODUCT_LOOKUP_QUERY = `
  *[_type == "amazon.product" && (
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
  }
`

export function AmazonProductDisplay({
  product: initialProduct,
  asin,
  referenceId,
  client,
  showFeatures = true,
  showImages = true,
  showPrice = true,
  showBrand = true,
  showCTA = true,
  className = '',
  imageSize = 'medium',
  layout = 'card',
  ctaText = 'View on Amazon',
  debug = false,
  onProductClick
}: AmazonProductDisplayProps) {
  const [product, setProduct] = useState<AmazonProduct | null>(initialProduct || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manual fetch function for debugging
  const manualFetch = () => {
    if ((!asin && !referenceId) || !client) return
    
    const identifier = asin ? `ASIN: ${asin}` : `ID: ${referenceId}`
    console.log('🔥 Manual fetch triggered for', identifier)
    setLoading(true)
    setError(null)
    
    const queryParams = {
      asin: asin || null,
      referenceId: referenceId || null
    }
    
    client.fetch(PRODUCT_LOOKUP_QUERY, queryParams)
      .then((fetchedProduct: AmazonProduct) => {
        console.log('🎯 Manual fetch result:', fetchedProduct)
        if (fetchedProduct) {
          setProduct(fetchedProduct)
        } else {
          setError(`Product with ${identifier} not found`)
        }
      })
      .catch((err) => {
        console.error('🚨 Manual fetch error:', err)
        setError(`Failed to fetch product: ${err.message}`)
      })
      .finally(() => setLoading(false))
  }

  // Fetch product by ASIN or reference ID if not provided directly
  useEffect(() => {
    if (debug) {
      console.log('🎬 useEffect triggered', { 
        initialProduct: !!initialProduct, 
        asin, 
        referenceId,
        client: !!client 
      })
    }
    
    // Only fetch if we don't have initial product data and we have either asin or referenceId
    if (!initialProduct && (asin || referenceId) && client) {
      setLoading(true)
      setError(null)
      
      const identifier = asin ? `ASIN: ${asin}` : `ID: ${referenceId}`
      if (debug) console.log('🔍 Fetching product with', identifier)
      
      const queryParams = {
        asin: asin || null,
        referenceId: referenceId || null
      }
      
      client
        .fetch(PRODUCT_LOOKUP_QUERY, queryParams)
        .then((fetchedProduct: AmazonProduct) => {
          if (debug) console.log('📦 Fetched product:', fetchedProduct)
          if (fetchedProduct) {
            setProduct(fetchedProduct)
            if (debug) console.log('✅ Product set successfully')
          } else {
            if (debug) console.log('❌ No product found')
            setError(`Product with ${identifier} not found`)
          }
        })
        .catch((err) => {
          if (debug) console.error('❌ Fetch error:', err)
          setError(`Failed to fetch product: ${err.message}`)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      if (debug) {
        console.log('⏭️ Skipping fetch:', {
          hasInitialProduct: !!initialProduct,
          hasAsin: !!asin,
          hasReferenceId: !!referenceId,
          hasClient: !!client
        })
      }
    }
  }, [asin, referenceId, client, initialProduct, debug])

  // Handle click events
  const handleProductClick = () => {
    if (product && onProductClick) {
      onProductClick(product)
    }
  }

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product?.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={`amazon-product-loading ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 w-full rounded mb-4"></div>
          <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
          <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        </div>
        {debug && (
          <div className="mt-2 text-xs text-blue-600">
            🔄 Loading product data...
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`amazon-product-error ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error Loading Product</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          {debug && (
            <button 
              onClick={manualFetch}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded"
            >
              🔄 Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // No product state
  if (!product) {
    return (
      <div className={`amazon-product-empty ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-center">No product available</div>
          
          {/* Debug info */}
          {debug && (
            <div className="mt-2 text-xs text-gray-400 border-t pt-2">
              <div><strong>Debug Info:</strong></div>
              <div>ASIN: {asin || 'Not provided'}</div>
              <div>Reference ID: {referenceId || 'Not provided'}</div>
              <div>Client: {client ? '✅ Available' : '❌ Not available'}</div>
              <div>Initial Product: {initialProduct ? '✅ Provided' : '❌ Not provided'}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Error: {error || 'None'}</div>
              
              {/* Manual test button */}
              {(asin || referenceId) && client && (
                <button 
                  onClick={manualFetch}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  🔄 Manual Fetch
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Image size mapping
  const imageSizes = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  }

  // Layout styles
  const layoutStyles = {
    horizontal: 'flex flex-row gap-4 items-start',
    vertical: 'flex flex-col gap-4',
    card: 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm'
  }

  const primaryImage = product.images?.[0]

  return (
    <div 
      className={`amazon-product ${layoutStyles[layout]} ${className} ${onProductClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onProductClick ? handleProductClick : undefined}
    >
      {/* Product Image */}
      {showImages && primaryImage && (
        <div className="amazon-product-image flex-shrink-0">
          <img
            src={primaryImage.url}
            alt={product.title}
            className={`${imageSizes[imageSize]} object-contain rounded`}
            loading="lazy"
          />
        </div>
      )}

      {/* Product Details */}
      <div className="amazon-product-details flex-1 min-w-0">
        {/* Title */}
        <h3 className="amazon-product-title font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Brand */}
        {showBrand && product.brand && (
          <div className="amazon-product-brand text-sm text-gray-600 mb-2">
            by {product.brand}
          </div>
        )}

        {/* Price */}
        {showPrice && (
          <div className="amazon-product-price mb-3">
            {product.salePrice && product.salePrice !== product.price ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  {product.salePrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.listPrice || product.price}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {product.price}
              </span>
            )}
            {product.currency && product.currency !== 'USD' && (
              <span className="text-sm text-gray-500 ml-1">
                {product.currency}
              </span>
            )}
          </div>
        )}

        {/* Features */}
        {showFeatures && product.features && product.features.length > 0 && (
          <div className="amazon-product-features mb-4">
            <ul className="text-sm text-gray-600 space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {product.features.length > 3 && (
                <li className="text-gray-400 text-xs">
                  +{product.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        {showCTA && product.url && (
          <button
            onClick={handleCTAClick}
            className="amazon-product-cta bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            {ctaText}
          </button>
        )}

        {/* Metadata */}
        <div className="amazon-product-meta text-xs text-gray-400 mt-3 space-y-1">
          <div>ASIN: {product.asin}</div>
          {product.lastSyncedAt && (
            <div>
              Updated: {new Date(product.lastSyncedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Debug panel */}
        {debug && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div><strong>Debug Panel:</strong></div>
            <div>Product ID: {product._id}</div>
            <div>Images: {product.images?.length || 0}</div>
            <div>Features: {product.features?.length || 0}</div>
            <button 
              onClick={() => console.log('Full product data:', product)}
              className="mt-1 px-2 py-1 bg-blue-500 text-white rounded"
            >
              Log Full Data
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Utility component for displaying products by ASIN with debug option
export function AmazonProductByASIN({ 
  asin, 
  client,
  debug = false,
  ...displayProps 
}: { 
  asin: string
  client: SanityClient
  debug?: boolean
} & Omit<AmazonProductDisplayProps, 'product' | 'asin' | 'referenceId' | 'client'>) {
  return (
    <AmazonProductDisplay
      asin={asin}
      client={client}
      debug={debug}
      {...displayProps}
    />
  )
}

// Utility component for displaying products by Reference ID with debug option
export function AmazonProductByReferenceId({ 
  referenceId, 
  client,
  debug = false,
  ...displayProps 
}: { 
  referenceId: string
  client: SanityClient
  debug?: boolean
} & Omit<AmazonProductDisplayProps, 'product' | 'asin' | 'referenceId' | 'client'>) {
  return (
    <AmazonProductDisplay
      referenceId={referenceId}
      client={client}
      debug={debug}
      {...displayProps}
    />
  )
}

// Utility component for displaying products from reference fields
export function PostWithAmazonProduct({ 
  post, 
  client,
  debug = false,
  ...displayProps 
}: { 
  post: { amazonProduct?: AmazonProduct }
  client: SanityClient
  debug?: boolean
} & Omit<AmazonProductDisplayProps, 'product' | 'asin' | 'referenceId' | 'client'>) {
  if (!post.amazonProduct) {
    return debug ? (
      <div className="text-gray-500 text-sm">No amazon product in post</div>
    ) : null
  }

  return (
    <AmazonProductDisplay
      product={post.amazonProduct}
      client={client}
      debug={debug}
      {...displayProps}
    />
  )
}

export default AmazonProductDisplay