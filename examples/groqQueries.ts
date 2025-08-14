// GROQ Query Examples for Amazon Product References
// Copy these queries and modify them for your specific needs

// ==========================================
// SINGLE AMAZON PRODUCT REFERENCE QUERIES
// ==========================================

// Basic query - Get document with Amazon product reference
export const basicProductReference = `
*[_type == "post" && defined(amazonProduct)][0]{
  _id,
  title,
  slug,
  amazonProduct->{
    _id,
    asin,
    title,
    brand,
    price,
    currency,
    url,
    images,
    features,
    lastSyncedAt
  }
}
`

// Query specific Amazon product fields only
export const specificProductFields = `
*[_type == "post" && defined(amazonProduct)][0]{
  title,
  amazonProduct->{
    asin,
    title,
    price,
    currency,
    url,
    "mainImage": images[0].url
  }
}
`

// Query with conditional Amazon product data
export const conditionalProductData = `
*[_type == "post"][0]{
  title,
  slug,
  amazonProduct->{
    asin,
    title,
    brand,
    price,
    currency,
    url,
    images[0]{
      url,
      width,
      height
    },
    features[0..2], // Only first 3 features
    lastSyncedAt
  },
  "hasProduct": defined(amazonProduct),
  "productTitle": amazonProduct->title,
  "productPrice": amazonProduct->price
}
`

// ==========================================
// MULTIPLE AMAZON PRODUCTS ARRAY QUERIES
// ==========================================

// Basic array query - Get document with multiple Amazon products
export const basicProductsArray = `
*[_type == "comparison"][0]{
  _id,
  title,
  amazonProducts[]->{
    _id,
    asin,
    title,
    brand,
    price,
    currency,
    url,
    images[0].url,
    features[0..2]
  }
}
`

// Array query with product count and filtering
export const productsArrayWithCount = `
*[_type == "comparison"][0]{
  title,
  amazonProducts[]->{
    asin,
    title,
    brand,
    price,
    currency,
    "isAffordable": price < "$100"
  },
  "productCount": count(amazonProducts),
  "affordableProducts": amazonProducts[]->{ 
    title, 
    price 
  }[price < "$100"]
}
`

// ==========================================
// FILTERED QUERIES BY AMAZON PRODUCT DATA
// ==========================================

// Find posts featuring specific Amazon product
export const postsByProduct = `
*[_type == "post" && amazonProduct->asin == $asin]{
  _id,
  title,
  slug,
  publishedAt,
  amazonProduct->{
    asin,
    title,
    price
  }
}
`

// Find posts with products in specific price range
export const postsByPriceRange = `
*[_type == "post" && defined(amazonProduct) && amazonProduct->price match "*$*"]{
  title,
  amazonProduct->{
    asin,
    title,
    price,
    currency
  }
}
`

// Find posts with products from specific brand
export const postsByBrand = `
*[_type == "post" && amazonProduct->brand match $brand + "*"]{
  title,
  amazonProduct->{
    asin,
    title,
    brand,
    price
  }
}
`

// ==========================================
// REVIEW-SPECIFIC QUERIES
// ==========================================

// Get product reviews with ratings
export const productReviews = `
*[_type == "review" && defined(amazonProduct)] | order(rating desc){
  _id,
  title,
  rating,
  pros,
  cons,
  amazonProduct->{
    asin,
    title,
    brand,
    price,
    url,
    images[0].url
  }
}
`

// Get average rating for specific Amazon product
export const productAverageRating = `
{
  "product": *[_type == "amazon.product" && asin == $asin][0]{
    asin,
    title,
    brand,
    price
  },
  "reviews": *[_type == "review" && amazonProduct->asin == $asin]{
    title,
    rating
  },
  "averageRating": math::avg(*[_type == "review" && amazonProduct->asin == $asin].rating),
  "reviewCount": count(*[_type == "review" && amazonProduct->asin == $asin])
}
`

// ==========================================
// BLOG POST LISTINGS WITH PRODUCTS
// ==========================================

// Get all blog posts with featured products
export const blogPostsWithProducts = `
*[_type == "post" && defined(amazonProduct)] | order(publishedAt desc){
  _id,
  title,
  slug,
  publishedAt,
  amazonProduct->{
    asin,
    title,
    brand,
    price,
    currency,
    images[0]{
      url,
      width,
      height
    }
  }
}
`

// Get recent posts grouped by product brand
export const postsByProductBrand = `
*[_type == "post" && defined(amazonProduct)] | order(publishedAt desc)[0..10]{
  title,
  slug,
  "productBrand": amazonProduct->brand,
  amazonProduct->{
    asin,
    title,
    price
  }
} | group(productBrand)
`

// ==========================================
// COMPARISON QUERIES
// ==========================================

// Get product comparison with price analysis
export const comparisonWithAnalysis = `
*[_type == "comparison"][0]{
  title,
  amazonProducts[]->{
    asin,
    title,
    brand,
    price,
    currency
  },
  "lowestPrice": amazonProducts[]->price | order(@) | [0],
  "highestPrice": amazonProducts[]->price | order(@ desc) | [0],
  "brands": array::unique(amazonProducts[]->brand)
}
`

// ==========================================
// SITEMAP / SEO QUERIES
// ==========================================

// Get all pages with Amazon products for sitemap
export const sitemapWithProducts = `
*[_type in ["post", "review", "comparison"] && defined(amazonProduct) || defined(amazonProducts)]{
  _type,
  slug,
  _updatedAt,
  "hasProducts": defined(amazonProduct) || defined(amazonProducts)
}
`

// ==========================================
// USAGE EXAMPLES WITH PARAMETERS
// ==========================================

// Example with parameters (use in your frontend)
export const queryExamples = {
  // Usage: client.fetch(postBySlug, { slug: 'my-post-slug' })
  postBySlug: `
    *[_type == "post" && slug.current == $slug][0]{
      title,
      content,
      amazonProduct->{
        asin,
        title,
        brand,
        price,
        currency,
        url,
        images,
        features
      }
    }
  `,
  
  // Usage: client.fetch(reviewsByRating, { minRating: 4 })
  reviewsByRating: `
    *[_type == "review" && rating >= $minRating]{
      title,
      rating,
      amazonProduct->{
        asin,
        title,
        price
      }
    }
  `,
  
  // Usage: client.fetch(productsByBrand, { brand: 'Apple' })
  productsByBrand: `
    *[_type == "amazon.product" && brand match $brand + "*"]{
      asin,
      title,
      brand,
      price,
      currency,
      images[0].url
    }
  `
}

// ==========================================
// TYPESCRIPT INTERFACES FOR RESULTS
// ==========================================

export interface PostWithProduct {
  _id: string
  title: string
  slug: string
  amazonProduct: {
    _id: string
    asin: string
    title: string
    brand: string
    price: string
    currency: string
    url: string
    images: Array<{
      url: string
      width: number
      height: number
    }>
    features: string[]
    lastSyncedAt: string
  }
}

export interface ReviewWithProduct {
  _id: string
  title: string
  rating: number
  pros: string[]
  cons: string[]
  amazonProduct: {
    asin: string
    title: string
    brand: string
    price: string
    url: string
  }
}

export interface ComparisonWithProducts {
  title: string
  amazonProducts: Array<{
    asin: string
    title: string
    brand: string
    price: string
    currency: string
  }>
}