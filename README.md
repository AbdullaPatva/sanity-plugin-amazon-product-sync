# Sanity Plugin: Amazon Product Sync

A comprehensive Sanity Studio plugin for fetching and managing Amazon products using the Amazon Product Advertising API (PA-API v5). This plugin provides seamless integration between Sanity Studio and Amazon's product data with real-time fetching capabilities.

## 🚀 Features

- **Amazon Settings Management**: Configure PA-API credentials with a dedicated settings singleton
- **Product Document Management**: Create multiple Amazon product documents with auto-fetching
- **Real-time Product Fetching**: "Fetch from Amazon" button to auto-populate product data
- **ASIN Input Component**: Custom input with validation and fetch functionality
- **Amazon Products Tool**: Simple tool for testing and creating products
- **Multi-region Support**: US, UK, DE, FR, IT, ES, CA, AU, JP, IN marketplaces
- **Comprehensive Product Data**: Title, brand, pricing, images, features, and more
- **TypeScript Support**: Full type safety throughout the plugin
- **Modern Sanity v4**: Built for the latest Sanity Studio architecture

## 📦 Installation

```bash
npm install @multidots/sanity-plugin-amazon-product-sync
```

## ⚙️ Setup

### 1. Add Plugin to Sanity Config

```typescript
// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { amazonProductsPlugin } from '@multidots/sanity-plugin-amazon-product-sync'
import { structure } from './structure'

export default defineConfig({
  name: 'default',
  title: 'Your Studio',
  projectId: 'your-project-id',
  dataset: 'production',
  
  plugins: [
    structureTool({ structure }),
    visionTool(),
    amazonProductsPlugin(),
  ],
  
  schema: {
    types: [
      // Your existing schemas
    ],
  },
})
```

### 2. Create Structure Configuration

Create `structure.ts` in your project root:

```typescript
// structure.ts
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...S.documentTypeListItems().filter(
        (item) => item.getId() &&
          !['amazon.settings'].includes(item.getId()!)
      ),
      S.divider(),
      S.listItem()
        .id('amazonSettings')
        .title('Amazon Settings')
        .child(
            S.document()
                .schemaType('amazon.settings')
                .documentId('amazon-settings')
        ),
    ])
```

### 3. Update Sanity Config for Document Rules

```typescript
// sanity.config.ts (add these document rules)
export default defineConfig({
  // ... other config
  document: {
    // Hide singleton types from the global "New document" menu
    newDocumentOptions: (prev: any, { creationContext }: any) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem: any) =>
            !['amazon.settings'].includes(templateItem.templateId)
        )
      }
      return prev
    },
    // Prevent duplicate/delete on singleton documents
    actions: (prev: any, { schemaType }: any) => {
      if (['amazon.settings'].includes(schemaType)) {
        return prev.filter(({ action }: any) => action !== 'duplicate' && action !== 'delete')
      }
      return prev
    },
  },
  // ... rest of config
})
```

## 🌐 Frontend Integration

The plugin requires server-side API routes to handle Amazon PA-API calls due to CORS restrictions and security requirements.

### Required API Routes

You need to implement these endpoints in your frontend:

- `POST /api/amazon/test-connection` - Test PA-API credentials
- `POST /api/amazon/fetch-product` - Fetch product data by ASIN

### Quick Setup with Next.js

#### 1. Install Dependencies

```bash
npm install @sanity/client
```

#### 2. Environment Variables

Create `.env.local`:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 3. Create Sanity Client

```typescript
// lib/sanity.ts
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export async function getAmazonSettings() {
  const query = `*[_type == "amazon.settings"][0]{
    accessKey,
    secretKey,
    region,
    partnerTag
  }`
  
  return await client.fetch(query)
}
```

## 📎 Referencing Amazon Products in Your Schemas

You can easily reference Amazon products in your own document schemas using a simple field definition. This allows you to associate Amazon products with blog posts, reviews, comparisons, or any other content type.

### Quick Copy-Paste Field

```typescript
// Copy this field into any schema where you want to reference Amazon products
defineField({
  name: 'amazonProduct',
  title: 'Choose Product',
  type: 'reference',
  to: [{ type: 'amazon.product' }],
  options: {
    filter: ({ document }) => ({
      filter: '_type == "amazon.product"',
      params: {}
    })
  },
  description: 'Select an Amazon product',
})
```

### Field Variations

**Single Product (Required):**
```typescript
defineField({
  name: 'amazonProduct',
  title: 'Choose Product',
  type: 'reference',
  to: [{ type: 'amazon.product' }],
  validation: Rule => Rule.required(),
})
```

**Single Product (Optional):**
```typescript
defineField({
  name: 'amazonProduct',
  title: 'Choose Product',
  type: 'reference',
  to: [{ type: 'amazon.product' }],
})
```

**Multiple Products (Array):**
```typescript
defineField({
  name: 'amazonProducts',
  title: 'Choose Products',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'amazon.product' }],
    }
  ],
  validation: Rule => Rule.min(1).max(10),
})
```

### Example Usage in Schemas

**Blog Post with Amazon Product:**
```typescript
export const blogPostSchema = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    // Amazon Product Reference
    defineField({
      name: 'amazonProduct',
      title: 'Choose Product',
      type: 'reference',
      to: [{ type: 'amazon.product' }],
      description: 'Select an Amazon product to feature in this blog post',
    }),
    // ... other fields
  ],
})
```

**Product Review Schema:**
```typescript
export const productReviewSchema = defineType({
  name: 'review',
  title: 'Product Review',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Review Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    // Amazon Product Reference (Required)
    defineField({
      name: 'amazonProduct',
      title: 'Choose Product',
      type: 'reference',
      to: [{ type: 'amazon.product' }],
      validation: Rule => Rule.required(),
      description: 'Select the Amazon product being reviewed',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      options: { range: { min: 1, max: 5, step: 0.5 } },
    }),
    // ... other fields
  ],
})
```

**Product Comparison Schema:**
```typescript
export const comparisonSchema = defineType({
  name: 'comparison',
  title: 'Product Comparison',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Comparison Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    // Multiple Amazon Products
    defineField({
      name: 'amazonProducts',
      title: 'Choose Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'amazon.product' }],
        }
      ],
      validation: Rule => Rule.required().min(2).max(5),
      description: 'Select 2-5 Amazon products to compare',
    }),
    // ... other fields
  ],
})
```

### Frontend Usage with GROQ Queries

Once you have Amazon product references in your schemas, you can query them using GROQ. Here are comprehensive examples:

#### Basic Single Product Reference

```typescript
// Get blog post with Amazon product reference
const query = `*[_type == "post" && defined(amazonProduct)][0]{
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
}`

const post = await sanityClient.fetch(query)
console.log(post.amazonProduct.title) // Amazon product title
console.log(post.amazonProduct.price) // Amazon product price
```

#### Direct Product Queries

**Get product by ASIN:**
```typescript
const query = `*[_type == "amazon.product" && asin == $asin][0]{
  _id, asin, title, brand, price, currency, url, images, features, lastSyncedAt
}`

const product = await sanityClient.fetch(query, { asin: "B09XFQL45V" })
```

**Get product by Reference ID:**
```typescript
const query = `*[_type == "amazon.product" && _id == $referenceId][0]{
  _id, asin, title, brand, price, currency, url, images, features, lastSyncedAt
}`

const product = await sanityClient.fetch(query, { referenceId: "3f995870-12ea-4d02-b242-ce78abfbf56e" })
```

**Unified query (either ASIN or Reference ID):**
```typescript
const query = `*[_type == "amazon.product" && (
  ($asin != null && asin == $asin) || 
  ($referenceId != null && _id == $referenceId)
)][0]{
  _id, asin, title, brand, price, currency, url, images, features, lastSyncedAt
}`

// Use with ASIN
const productByAsin = await sanityClient.fetch(query, { asin: "B09XFQL45V", referenceId: null })

// Use with Reference ID
const productByRef = await sanityClient.fetch(query, { asin: null, referenceId: "3f995870-12ea-4d02-b242-ce78abfbf56e" })
```

#### Multiple Products Array

```typescript
// Get comparison with multiple Amazon products
const query = `*[_type == "comparison"][0]{
  title,
  amazonProducts[]->{
    asin,
    title,
    brand,
    price,
    currency,
    url,
    images[0].url,
    features[0..2]
  },
  "productCount": count(amazonProducts)
}`

const comparison = await sanityClient.fetch(query)
comparison.amazonProducts.forEach(product => {
  console.log(`${product.title}: ${product.price}`)
})
```

#### Filtered Queries

```typescript
// Find posts featuring specific Amazon product
const postsByProduct = `*[_type == "post" && amazonProduct->asin == $asin]{
  title,
  slug,
  amazonProduct->{
    asin,
    title,
    price
  }
}`

const posts = await sanityClient.fetch(postsByProduct, { asin: 'B0F15TM77B' })

// Find posts with products from specific brand
const postsByBrand = `*[_type == "post" && amazonProduct->brand match $brand + "*"]{
  title,
  amazonProduct->{
    asin,
    title,
    brand,
    price
  }
}`

const applePosts = await sanityClient.fetch(postsByBrand, { brand: 'Apple' })
```

#### Product Reviews with Ratings

```typescript
// Get product reviews with ratings
const reviewsQuery = `*[_type == "review" && defined(amazonProduct)] | order(rating desc){
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
}`

const reviews = await sanityClient.fetch(reviewsQuery)

// Get average rating for specific product
const ratingQuery = `{
  "product": *[_type == "amazon.product" && asin == $asin][0]{
    asin,
    title,
    price
  },
  "averageRating": math::avg(*[_type == "review" && amazonProduct->asin == $asin].rating),
  "reviewCount": count(*[_type == "review" && amazonProduct->asin == $asin])
}`

const productStats = await sanityClient.fetch(ratingQuery, { asin: 'B0F15TM77B' })
```

#### Advanced Analysis Queries

```typescript
// Get comparison with price analysis
const analysisQuery = `*[_type == "comparison"][0]{
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
}`

const analysis = await sanityClient.fetch(analysisQuery)
console.log(`Price range: ${analysis.lowestPrice} - ${analysis.highestPrice}`)
```

#### TypeScript Interfaces

```typescript
interface PostWithProduct {
  _id: string
  title: string
  slug: string
  amazonProduct: {
    asin: string
    title: string
    brand: string
    price: string
    currency: string
    url: string
    images: Array<{ url: string; width: number; height: number }>
    features: string[]
  }
}

// Use with type safety
const post: PostWithProduct = await sanityClient.fetch(query)
```

For more GROQ query examples, check the `examples/groqQueries.ts` file in the plugin.

## 🎨 React Component for Frontend Display

The plugin includes a flexible React component for displaying Amazon products in your frontend applications.

### Quick Start

```tsx
import AmazonProductDisplay from './AmazonProductDisplay'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

// Option 1: Display product from reference field
function BlogPost({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      {post.amazonProduct && (
        <AmazonProductDisplay
          product={post.amazonProduct}
          layout="card"
          imageSize="medium"
        />
      )}
    </div>
  )
}

// Option 2: Display product by ASIN lookup
function ProductPage({ asin }) {
  return (
    <AmazonProductDisplay
      asin={asin}
      client={client}
      layout="horizontal"
      imageSize="large"
      onProductClick={(product) => {
        console.log('Product clicked:', product.title)
      }}
    />
  )
}
```

### Component Props

```tsx
interface AmazonProductDisplayProps {
  // Data source (choose one)
  product?: AmazonProduct          // Direct product data
  asin?: string                    // ASIN for lookup
  referenceId?: string             // Reference ID for lookup
  client?: SanityClient           // Required when using asin or referenceId
  
  // Display options
  showFeatures?: boolean          // Show feature list (default: true)
  showImages?: boolean            // Show product image (default: true)
  showPrice?: boolean             // Show pricing (default: true)
  showBrand?: boolean             // Show brand name (default: true)
  showCTA?: boolean               // Show "View on Amazon" button (default: true)
  
  // Styling options
  layout?: 'horizontal' | 'vertical' | 'card'  // Layout style (default: 'card')
  imageSize?: 'small' | 'medium' | 'large'     // Image size (default: 'medium')
  className?: string              // Custom CSS classes
  ctaText?: string                // Custom CTA button text (default: 'View on Amazon')
  
  // Development options
  debug?: boolean                 // Enable debug mode (default: false)
  
  // Interaction
  onProductClick?: (product: AmazonProduct) => void  // Click handler
}
```

### Usage Examples

### 🎯 Dual Parameter Support

The component supports **3 different ways** to display products:

**1. By ASIN Lookup:**
```tsx
import { AmazonProductByASIN } from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

<AmazonProductByASIN
  asin="B09XFQL45V"
  client={sanityClient}
  layout="card"
  debug={true}
/>
```

**2. By Reference ID Lookup:**
```tsx
import { AmazonProductByReferenceId } from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

<AmazonProductByReferenceId
  referenceId="3f995870-12ea-4d02-b242-ce78abfbf56e"
  client={sanityClient}
  layout="card"
  debug={true}
/>
```

**3. Unified Component (accepts any parameter):**
```tsx
import AmazonProductDisplay from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

// Option A: ASIN lookup
<AmazonProductDisplay asin="B09XFQL45V" client={sanityClient} />

// Option B: Reference ID lookup  
<AmazonProductDisplay referenceId="3f995870..." client={sanityClient} />

// Option C: Direct product data
<AmazonProductDisplay product={productData} />
```

### 🔍 Single GROQ Query

All lookup methods use **one optimized GROQ query**:

```groq
*[_type == "amazon.product" && (
  ($asin != null && asin == $asin) || 
  ($referenceId != null && _id == $referenceId)
)][0]{
  _id, asin, title, brand, price, currency, url, images, features, lastSyncedAt
}
```

**4. Blog Post with Featured Product:**
```tsx
function BlogPostWithProduct({ slug }) {
  const [post, setPost] = useState(null)
  
  useEffect(() => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
      title, content,
      amazonProduct->{ asin, title, brand, price, url, images, features }
    }`
    client.fetch(query, { slug }).then(setPost)
  }, [slug])

  return (
    <article>
      <h1>{post?.title}</h1>
      {post?.amazonProduct && (
        <AmazonProductDisplay
          product={post.amazonProduct}
          layout="horizontal"
          imageSize="large"
        />
      )}
    </article>
  )
}
```

**Product Comparison Grid:**
```tsx
function ProductComparison({ comparisonId }) {
  const [comparison, setComparison] = useState(null)
  
  useEffect(() => {
    const query = `*[_type == "comparison" && _id == $comparisonId][0]{
      title,
      amazonProducts[]->{ asin, title, brand, price, url, images, features }
    }`
    client.fetch(query, { comparisonId }).then(setComparison)
  }, [comparisonId])

  return (
    <div>
      <h1>{comparison?.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparison?.amazonProducts.map((product) => (
          <AmazonProductDisplay
            key={product.asin}
            product={product}
            layout="card"
            showFeatures={false}
          />
        ))}
      </div>
    </div>
  )
}
```

**Direct ASIN Lookup:**
```tsx
function ProductWidget({ asin }) {
  return (
    <div className="bg-gray-50 p-4 rounded">
      <h3>Recommended Product</h3>
      <AmazonProductDisplay
        asin={asin}
        client={client}
        layout="horizontal"
        imageSize="small"
        showFeatures={false}
      />
    </div>
  )
}
```

**Product Review with Rating:**
```tsx
function ProductReview({ reviewId }) {
  const [review, setReview] = useState(null)
  
  useEffect(() => {
    const query = `*[_type == "review" && _id == $reviewId][0]{
      title, rating, pros, cons,
      amazonProduct->{ asin, title, brand, price, url, images }
    }`
    client.fetch(query, { reviewId }).then(setReview)
  }, [reviewId])

  return (
    <div className="grid grid-cols-2 gap-8">
      <AmazonProductDisplay
        product={review?.amazonProduct}
        layout="card"
        ctaText="Buy Now"
      />
      <div>
        <h1>{review?.title}</h1>
        <div className="rating">Rating: {review?.rating}/5</div>
        {/* Review content */}
      </div>
    </div>
  )
}
```

### Styling

The component includes default Tailwind CSS classes and can be customized with:

1. **CSS Import:**
```tsx
import './AmazonProductDisplay.css'
```

2. **Custom Classes:**
```tsx
<AmazonProductDisplay
  className="my-custom-product-card shadow-lg"
  // ... other props
/>
```

3. **Layout Variants:**
- `card` - Card layout with border and shadow
- `horizontal` - Side-by-side image and content
- `vertical` - Stacked image above content

## 🚀 Quick Start: Frontend Integration

### Next.js Copy & Paste Setup

For immediate setup, copy the complete working example:

```bash
# 1. Copy the complete Next.js example files
cp examples/complete-nextjs-example/page.tsx src/app/page.tsx
cp examples/components/AmazonProductDisplay.tsx src/components/
cp examples/frontend-integration/sanity-client-setup.ts src/lib/sanity-client.ts

# 2. Install required dependencies
npm install @sanity/client @sanity/image-url

# 3. Configure environment variables
cp examples/complete-nextjs-example/env-template.txt .env.local
# Edit .env.local with your actual Sanity project details

# 4. Start development server
npm run dev
```

### Verify Setup

1. Visit `http://localhost:3000` (or your configured port)
2. You should see:
   - ✅ "Product by ASIN Lookup" section 
   - ✅ "Product by Reference ID Lookup" section
   - ✅ Debug panels showing component state
   - ✅ Manual fetch buttons for testing

### Available Files & Examples

**Complete Working Examples:**
- `examples/complete-nextjs-example/` - **🚀 Full Next.js integration**
  - `page.tsx` - Complete page demonstrating ASIN & Reference ID lookups
  - `package.json` - All required dependencies
  - `env-template.txt` - Environment variables template
  - `SETUP_GUIDE.md` - **📖 Detailed step-by-step setup guide**

**Individual Components:**
- `examples/components/AmazonProductDisplay.tsx` - **Main component with dual parameter support**
- `examples/components/AmazonProductDisplay.css` - Optional styling
- `examples/frontend-integration/sanity-client-setup.ts` - **Production-ready Sanity client**

**Schema Integration:**
- `examples/productReferenceField.ts` - Reusable reference field snippets
- `examples/exampleSchema.ts` - Blog post & comparison schema examples
- `examples/groqQueries.ts` - Comprehensive GROQ query examples

**API Integration (Optional):**
- `examples/frontend-integration/amazon-client.ts` - Amazon PA-API client
- `examples/frontend-integration/nextjs-api-route.ts` - API route examples
- `examples/frontend-integration/fetch-product-api-route.ts` - Product fetch API

**Troubleshooting:**
- `examples/environment-setup.md` - Environment setup & common issues
- Built-in debug mode in components

## 🎯 Usage

### 1. Configure Amazon Settings

1. Open your Sanity Studio
2. Go to **"Amazon Settings"** from the sidebar
3. Fill in your Amazon PA-API credentials:
   - **Region**: Select your marketplace (US, UK, DE, etc.)
   - **Access Key**: Your PA-API access key
   - **Secret Key**: Your PA-API secret key
   - **Partner Tag**: Your Amazon Associate tag
   - **Test ASIN**: An ASIN for testing (e.g., `B0F15TM77B`)
   - **Cache Hours**: Duration to cache results (1-168 hours)

4. Click **"Test API Connection"** to verify your setup

### 2. Create Amazon Products

1. Go to **"Amazon Products"** from the sidebar
2. Click **"Add new"** to create a product document
3. Enter an **ASIN number** in the ASIN field
4. Navigate to the **"Actions"** tab
5. Click **"Fetch from Amazon"** button
6. The document will be auto-populated with:
   - Product title
   - Brand name
   - Pricing information
   - Product image (primary large)
   - Feature list
   - Amazon URL
   - Last sync timestamp

7. Review and edit the data as needed
8. Click **"Publish"** when ready

### 3. Manual Entry

You can also manually enter product information without fetching from Amazon. All fields are editable.

## 📋 Schema Reference

### Amazon Settings (`amazon.settings`)

**API Settings:**
- `region` - Amazon marketplace region
- `accessKey` - PA-API access key
- `secretKey` - PA-API secret key 
- `partnerTag` - Amazon Associate tag
- `asinNumber` - Test ASIN for API validation
- `cacheHours` - Cache duration (1-168 hours)

**Display Settings:**
- `showTitle` - Show/hide product title
- `showImage` - Show/hide product image
- `showFeatures` - Show/hide feature list
- `showPrice` - Show/hide pricing
- `showCtaLink` - Show/hide CTA link

**Actions:**
- "Test API Connection" - Verify credentials
- "Debug Document" - View document state

### Amazon Product (`amazon.product`)

**Product Information:**
- `asin` - Amazon Standard Identification Number
- `title` - Product title
- `brand` - Brand/manufacturer name
- `url` - Direct Amazon product URL
- `features` - Array of product features

**Pricing:**
- `price` - Current display price
- `salePrice` - Sale price (if available)
- `currency` - Price currency (USD, EUR, etc.)
- `listPrice` - Original list price

**Assets:**
- `images` - Array of product images with URL, width, height

**Metadata:**
- `lastSyncedAt` - Timestamp of last Amazon sync

**Actions:**
- "Fetch from Amazon" - Auto-populate from Amazon API

## 🛠️ Development

### Build the Plugin

```bash
cd plugins/@multidots/sanity-plugin-amazon-product-sync
npm install
npm run build
```

### Start API Server

```bash
cd your-frontend-app
npm install
npm run dev
```

### Start Sanity Studio

```bash
cd your-sanity-project
npm run dev
```

## 🔧 Troubleshooting

### Common Issues

#### Frontend Component Issues

1. **"No product available" despite correct ASIN**
   - **Problem**: Component shows debug info but never fetches data
   - **Solution**: Enable debug mode and check browser console
   ```tsx
   <AmazonProductByASIN
     asin="B09XFQL45V"
     client={sanityClient}
     debug={true} // Shows debug panel with manual fetch button
   />
   ```
   - Click the "🔄 Manual Fetch" button to test the Sanity client directly

2. **Environment variables not working**
   - **Problem**: `process.env.NEXT_PUBLIC_SANITY_PROJECT_ID` is undefined
   - **Solution**: Ensure `.env.local` exists with correct variables
   ```bash
   # .env.local
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your-token
   ```
   - Use `NEXT_PUBLIC_` prefix for client-side variables

3. **CORS errors when fetching from Sanity**
   - **Problem**: Browser blocks requests to Sanity API
   - **Solution**: Use correct client configuration
   ```typescript
   export const sanityClient = createClient({
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
     dataset: 'production',
     apiVersion: '2025-01-01',
     useCdn: true, // Important for client-side
     // NO token needed for public documents
   })
   ```

4. **useEffect not triggering automatically**
   - **Problem**: Component doesn't fetch data on mount
   - **Solution**: Add debug logging to see which conditions fail
   ```typescript
   useEffect(() => {
     console.log('useEffect conditions:', {
       hasInitialProduct: !!initialProduct,
       hasAsin: !!asin,
       hasClient: !!client
     })
   }, [asin, client, initialProduct])
   ```

#### API Issues

5. **"Amazon API credentials not configured"**
   - Verify your Sanity API token has read access to `amazon.settings`
   - Check that amazon.settings document exists in Sanity Studio
   - Ensure token is available server-side only

6. **"InvalidSignature" error**
   - Check your PA-API access key and secret key
   - Verify your system clock is accurate
   - Ensure you're using the correct region

7. **Product documents not accessible**
   - Test with direct GROQ query:
   ```bash
   curl -X POST "https://YOUR_PROJECT_ID.api.sanity.io/v2025-01-01/data/query/production" \
     -H "Content-Type: application/json" \
     -d '{"query": "*[_type == \"amazon.product\"][0]{asin, title}"}'
   ```
   - Ensure documents are published (not drafts)
   - Check document permissions in Sanity Studio

### Debug Mode

The component includes built-in debugging tools:

```tsx
// Enable debug mode to see detailed information
<AmazonProductDisplay
  asin="B09XFQL45V"
  client={sanityClient}
  debug={process.env.NODE_ENV === 'development'}
/>
```

**Debug features:**
- Console logging of all fetch attempts
- Visual debug panel showing component state
- Manual fetch button to test Sanity client
- Full product data logging

### Development Workflow

1. **Test Sanity Connection First**
   ```typescript
   import { testSanityConnection } from './lib/sanity-client-setup'
   
   testSanityConnection('B09XFQL45V').then(result => {
     console.log('Sanity test:', result)
   })
   ```

2. **Create Test Products**
   See `examples/environment-setup.md` for the script

3. **Use Debug Mode**
   ```tsx
   <AmazonProductByASIN debug={true} />
   ```

4. **Check Browser Console**
   - Look for 🎬, 🔍, 📦, ✅, ❌ emoji logs
   - Manual fetch button provides direct testing

## 📚 Additional Resources

- [Amazon Product Advertising API Documentation](https://webservices.amazon.com/paapi5/documentation/)
- [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)
- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 📄 License

MIT

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section above
2. Verify your configuration matches the examples
3. Check browser console and API server logs
4. Ensure your Amazon PA-API account is active

---

**Note**: This plugin requires an active Amazon Product Advertising API account and valid credentials. The PA-API has rate limits and approval requirements.