# Complete Next.js Setup Guide

This guide provides step-by-step instructions to integrate the Amazon Product Sync plugin with your Next.js application.

## 📋 Prerequisites

- ✅ Amazon Product Sync plugin installed in Sanity Studio
- ✅ Amazon PA-API credentials configured in Sanity
- ✅ At least one `amazon.product` document in your Sanity dataset
- ✅ Next.js 13+ with App Router

## 🚀 Step-by-Step Setup

### 1. Install Required Dependencies

```bash
npm install @sanity/client @sanity/image-url
```

### 2. Environment Configuration

Create `.env.local` in your Next.js project root:

```bash
# Copy from env-template.txt and fill in your values
cp examples/complete-nextjs-example/env-template.txt .env.local
```

Edit `.env.local` with your actual values:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=rihf4zqy  # Your actual project ID
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...                  # Your actual token
```

### 3. Copy Component Files

Copy these files to your Next.js project:

```bash
# Component
cp examples/components/AmazonProductDisplay.tsx src/components/

# Sanity client setup  
cp examples/frontend-integration/sanity-client-setup.ts src/lib/sanity-client.ts

# CSS (optional, for styling)
cp examples/components/AmazonProductDisplay.css src/styles/
```

### 4. Update Your Page

Replace your page content with the example:

```bash
# For app/page.tsx
cp examples/complete-nextjs-example/page.tsx src/app/page.tsx
```

### 5. Tailwind CSS Setup (Optional)

If using Tailwind CSS, add these custom classes to your `globals.css`:

```css
/* Amazon Product Display Component Styles */
.amazon-product {
  transition: all 0.2s ease-in-out;
}

.amazon-product:hover {
  transform: translateY(-2px);
}

.amazon-product-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.amazon-product-cta:focus {
  outline: 2px solid #ff9900;
  outline-offset: 2px;
}
```

## 🎯 Usage Examples

### Basic Product Display

```tsx
import { AmazonProductByASIN } from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

export default function ProductPage() {
  return (
    <AmazonProductByASIN
      asin="B09XFQL45V"
      client={sanityClient}
      layout="card"
      debug={process.env.NODE_ENV === 'development'}
    />
  )
}
```

### Reference ID Lookup

```tsx
import { AmazonProductByReferenceId } from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

export default function ProductPage() {
  return (
    <AmazonProductByReferenceId
      referenceId="3f995870-12ea-4d02-b242-ce78abfbf56e"
      client={sanityClient}
      layout="horizontal"
      imageSize="large"
    />
  )
}
```

### Unified Component

```tsx
import AmazonProductDisplay from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

export default function FlexibleProductPage({ 
  asin, 
  referenceId, 
  product 
}: {
  asin?: string
  referenceId?: string
  product?: any
}) {
  return (
    <AmazonProductDisplay
      asin={asin}
      referenceId={referenceId}
      product={product}
      client={sanityClient}
      layout="card"
      debug={true}
    />
  )
}
```

## 🔧 GROQ Queries

### Direct Queries

```typescript
import { sanityClient } from '@/lib/sanity-client'

// Get product by ASIN
const productByAsin = await sanityClient.fetch(`
  *[_type == "amazon.product" && asin == $asin][0]{
    _id, asin, title, brand, price, currency, url, images, features
  }
`, { asin: "B09XFQL45V" })

// Get product by Reference ID
const productByRef = await sanityClient.fetch(`
  *[_type == "amazon.product" && _id == $referenceId][0]{
    _id, asin, title, brand, price, currency, url, images, features
  }
`, { referenceId: "3f995870-12ea-4d02-b242-ce78abfbf56e" })

// Unified query (either ASIN or Reference ID)
const product = await sanityClient.fetch(`
  *[_type == "amazon.product" && (
    ($asin != null && asin == $asin) || 
    ($referenceId != null && _id == $referenceId)
  )][0]{
    _id, asin, title, brand, price, currency, url, images, features, lastSyncedAt
  }
`, { asin: "B09XFQL45V", referenceId: null })
```

### In Blog Posts

```typescript
// Get blog post with referenced Amazon product
const postWithProduct = await sanityClient.fetch(`
  *[_type == "post" && slug.current == $slug][0]{
    title,
    content,
    amazonProduct->{
      _id, asin, title, brand, price, currency, url, images, features
    }
  }
`, { slug: "my-post" })
```

## ✅ Testing Your Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit http://localhost:3000** (or your configured port)

3. **Check for:**
   - ✅ Component renders without errors
   - ✅ Debug panels show correct parameters
   - ✅ Manual fetch buttons are available
   - ✅ Browser console shows debug logs (if debug=true)

## 🐛 Troubleshooting

### Component Shows "No product available"

1. **Check environment variables:**
   ```bash
   echo $NEXT_PUBLIC_SANITY_PROJECT_ID
   echo $NEXT_PUBLIC_SANITY_DATASET
   ```

2. **Enable debug mode:**
   ```tsx
   <AmazonProductByASIN asin="B09XFQL45V" client={sanityClient} debug={true} />
   ```

3. **Test Sanity connection:**
   ```tsx
   import { testSanityConnection } from '@/lib/sanity-client'
   
   useEffect(() => {
     testSanityConnection('B09XFQL45V').then(console.log)
   }, [])
   ```

4. **Check manual fetch button:**
   - Click the "🔄 Manual Fetch" button in debug panel
   - Check browser console for error messages

### TypeScript Errors

1. **Install type dependencies:**
   ```bash
   npm install -D @types/react @types/node
   ```

2. **Check imports:**
   ```tsx
   // Correct imports
   import { AmazonProductByASIN } from '@/components/AmazonProductDisplay'
   import { sanityClient } from '@/lib/sanity-client'
   ```

### CORS Errors

1. **Check client configuration:**
   ```typescript
   // Use CDN for client-side
   const sanityClient = createClient({
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
     dataset: 'production',
     apiVersion: '2025-01-01',
     useCdn: true, // Important!
   })
   ```

2. **Verify document permissions in Sanity Studio**

## 📚 Additional Resources

- [Amazon Product Sync Plugin README](../../README.md)
- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Next.js App Router](https://nextjs.org/docs/app)