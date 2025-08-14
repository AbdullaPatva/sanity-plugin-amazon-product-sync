import React from 'react'
import { useEffect, useState } from 'react'
import { createClient } from '@sanity/client'
import AmazonProductDisplay, { 
  PostWithAmazonProduct, 
  AmazonProductByASIN,
  AmazonProduct 
} from './AmazonProductDisplay'

// Initialize Sanity client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

// ==========================================
// EXAMPLE 1: Blog Post with Referenced Product
// ==========================================

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: any[] // Portable text
  amazonProduct?: AmazonProduct
}

export function BlogPostWithProduct({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = `
      *[_type == "post" && slug.current == $slug][0]{
        _id,
        title,
        slug,
        content,
        amazonProduct->{
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
      }
    `

    sanityClient
      .fetch(query, { slug })
      .then(setPost)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div>Loading...</div>
  if (!post) return <div>Post not found</div>

  return (
    <article className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
      
      {/* Featured Product */}
      {post.amazonProduct && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured Product</h2>
          <PostWithAmazonProduct
            post={post}
            client={sanityClient}
            layout="horizontal"
            imageSize="large"
            onProductClick={(product) => {
              console.log('Product clicked:', product.title)
            }}
          />
        </div>
      )}

      {/* Blog content would go here */}
      <div className="prose max-w-none">
        {/* Render your portable text content */}
      </div>
    </article>
  )
}

// ==========================================
// EXAMPLE 2: Product Review with Rating
// ==========================================

interface ProductReview {
  _id: string
  title: string
  rating: number
  pros: string[]
  cons: string[]
  content: any[]
  amazonProduct?: AmazonProduct
}

export function ProductReviewDisplay({ reviewId }: { reviewId: string }) {
  const [review, setReview] = useState<ProductReview | null>(null)

  useEffect(() => {
    const query = `
      *[_type == "review" && _id == $reviewId][0]{
        _id,
        title,
        rating,
        pros,
        cons,
        content,
        amazonProduct->{
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
      }
    `

    sanityClient.fetch(query, { reviewId }).then(setReview)
  }, [reviewId])

  if (!review) return <div>Loading review...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Display */}
        <div>
          {review.amazonProduct && (
            <AmazonProductDisplay
              product={review.amazonProduct}
              layout="card"
              imageSize="large"
              ctaText="Buy Now on Amazon"
            />
          )}
        </div>

        {/* Review Content */}
        <div>
          <h1 className="text-2xl font-bold mb-4">{review.title}</h1>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="ml-2 text-gray-600">{review.rating}/5</span>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {review.pros && review.pros.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Pros</h3>
                <ul className="text-sm space-y-1">
                  {review.pros.map((pro, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review.cons && review.cons.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 mb-2">Cons</h3>
                <ul className="text-sm space-y-1">
                  {review.cons.map((con, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">-</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// EXAMPLE 3: Product Comparison
// ==========================================

interface ProductComparison {
  _id: string
  title: string
  amazonProducts: AmazonProduct[]
}

export function ProductComparisonDisplay({ comparisonId }: { comparisonId: string }) {
  const [comparison, setComparison] = useState<ProductComparison | null>(null)

  useEffect(() => {
    const query = `
      *[_type == "comparison" && _id == $comparisonId][0]{
        _id,
        title,
        amazonProducts[]->{
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
      }
    `

    sanityClient.fetch(query, { comparisonId }).then(setComparison)
  }, [comparisonId])

  if (!comparison) return <div>Loading comparison...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{comparison.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparison.amazonProducts.map((product) => (
          <AmazonProductDisplay
            key={product._id}
            product={product}
            layout="card"
            imageSize="medium"
            className="h-full"
          />
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-3 text-left">Product</th>
              <th className="border border-gray-300 p-3 text-left">Brand</th>
              <th className="border border-gray-300 p-3 text-left">Price</th>
              <th className="border border-gray-300 p-3 text-left">Features</th>
            </tr>
          </thead>
          <tbody>
            {comparison.amazonProducts.map((product) => (
              <tr key={product._id}>
                <td className="border border-gray-300 p-3">{product.title}</td>
                <td className="border border-gray-300 p-3">{product.brand}</td>
                <td className="border border-gray-300 p-3">{product.price}</td>
                <td className="border border-gray-300 p-3">
                  {product.features.slice(0, 3).join(', ')}
                  {product.features.length > 3 && '...'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==========================================
// EXAMPLE 4: Direct ASIN Lookup
// ==========================================

export function DirectProductLookup() {
  const [asin, setAsin] = useState('')
  const [showProduct, setShowProduct] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (asin.trim()) {
      setShowProduct(true)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Product Lookup by ASIN</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={asin}
            onChange={(e) => setAsin(e.target.value)}
            placeholder="Enter ASIN (e.g., B0F15TM77B)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Lookup
          </button>
        </div>
      </form>

      {showProduct && asin && (
        <AmazonProductByASIN
          asin={asin}
          client={sanityClient}
          layout="card"
          imageSize="large"
          onProductClick={(product) => {
            alert(`Clicked on: ${product.title}`)
          }}
        />
      )}
    </div>
  )
}

// ==========================================
// EXAMPLE 5: Product Widget (Compact)
// ==========================================

export function ProductWidget({ asin }: { asin: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Recommended Product</h3>
      <AmazonProductByASIN
        asin={asin}
        client={sanityClient}
        layout="horizontal"
        imageSize="small"
        showFeatures={false}
        showBrand={false}
        className="bg-white rounded p-3"
      />
    </div>
  )
}

// ==========================================
// EXAMPLE 6: Product Grid
// ==========================================

export function ProductGrid({ asins }: { asins: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {asins.map((asin) => (
        <AmazonProductByASIN
          key={asin}
          asin={asin}
          client={sanityClient}
          layout="card"
          imageSize="medium"
          showFeatures={false}
        />
      ))}
    </div>
  )
}