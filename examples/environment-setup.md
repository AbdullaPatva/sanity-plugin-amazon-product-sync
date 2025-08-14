# Environment Setup Guide

This guide covers the real-world setup challenges and solutions discovered during implementation.

## Environment Variables (.env.local)

```bash
# ====================================================
# SANITY CONFIGURATION
# ====================================================

# Your Sanity project ID (get from manage.sanity.io)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here

# Your dataset name (usually 'production')
NEXT_PUBLIC_SANITY_DATASET=production

# Sanity API token with read/write permissions
# Get from: manage.sanity.io → Your Project → API → Tokens
SANITY_API_TOKEN=your-sanity-api-token-here

# ====================================================
# API CONFIGURATION
# ====================================================

# Your API base URL (for local development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# ====================================================
# OPTIONAL: DEBUGGING
# ====================================================

# Enable debug mode for development
NEXT_PUBLIC_DEBUG_MODE=true
```

## Common Issues & Solutions

### 1. "No product available" despite correct setup

**Problem:** Component shows debug info but never fetches data.

**Solutions:**
- Ensure Sanity client is properly configured for client-side use
- Check that amazon.product documents are publicly readable
- Use `debug={true}` prop to see detailed console logs
- Click the "Manual Fetch" button to test the Sanity client

**Example:**
```tsx
// Enable debug mode to see what's happening
<AmazonProductByASIN
  asin="B09XFQL45V"
  client={sanityClient}
  debug={true} // This shows debug panel
/>
```

### 2. CORS errors when fetching from Sanity

**Problem:** Browser blocks requests to Sanity API.

**Solution:** Ensure you're using the public client configuration:
```typescript
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true, // Important for client-side
  // NO token needed for public documents
})
```

### 3. Environment variables not available in browser

**Problem:** Server-side env vars used in client components.

**Solution:** Use `NEXT_PUBLIC_` prefix for client-side variables:
```bash
# ✅ Available in browser
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id

# ❌ Only available server-side
SANITY_API_TOKEN=your-token
```

### 4. TypeScript errors with Sanity client

**Problem:** Module not found or type errors.

**Solution:** Install correct packages:
```bash
npm install @sanity/client
npm install -D @types/node # For TypeScript support
```

### 5. Product documents not accessible

**Problem:** Client can't read amazon.product documents.

**Solutions:**
1. Check document permissions in Sanity Studio
2. Ensure documents are published (not drafts)
3. Test with direct GROQ query:

```bash
curl -X POST "https://YOUR_PROJECT_ID.api.sanity.io/v2025-01-01/data/query/production" \
  -H "Content-Type: application/json" \
  -d '{"query": "*[_type == \"amazon.product\"][0]{asin, title}"}'
```

### 6. useEffect not triggering

**Problem:** Component's useEffect doesn't run automatically.

**Debugging steps:**
1. Add debug logs to see which conditions fail:
```typescript
useEffect(() => {
  console.log('useEffect check:', {
    hasInitialProduct: !!initialProduct,
    hasAsin: !!asin,
    hasClient: !!client
  })
  // ... rest of effect
}, [asin, client, initialProduct])
```

2. Ensure all props are passed correctly:
```tsx
<AmazonProductByASIN
  asin="B09XFQL45V" // Must be string
  client={sanityClient} // Must be Sanity client instance
  // Don't pass initialProduct for ASIN lookup
/>
```

## Development Workflow

### 1. Test Sanity Connection First

Before using the component, test your Sanity setup:

```typescript
import { testSanityConnection } from './lib/sanity-client-setup'

// In your component or page
useEffect(() => {
  testSanityConnection('B09XFQL45V').then(result => {
    console.log('Sanity test result:', result)
  })
}, [])
```

### 2. Use Debug Mode During Development

Always enable debug mode while developing:

```tsx
<AmazonProductDisplay
  asin="B09XFQL45V"
  client={sanityClient}
  debug={process.env.NODE_ENV === 'development'}
  layout="card"
/>
```

### 3. Create Test Products

Use this script to create test products in Sanity:

```javascript
// create-test-product.js
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function createTestProduct() {
  const product = {
    _type: 'amazon.product',
    asin: 'B09XFQL45V',
    title: 'Test Product',
    brand: 'Test Brand',
    price: '$29.99',
    currency: 'USD',
    url: 'https://amazon.com/dp/B09XFQL45V',
    images: [{
      _key: 'primary',
      url: 'https://example.com/image.jpg',
      width: 500,
      height: 500
    }],
    features: ['Feature 1', 'Feature 2'],
    lastSyncedAt: new Date().toISOString()
  }
  
  const result = await client.create(product)
  console.log('Created product:', result._id)
}

createTestProduct()
```

Run with: `node create-test-product.js`

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Sanity API token has correct permissions
- [ ] amazon.product documents are publicly readable
- [ ] CORS is configured for your domain
- [ ] Debug mode disabled in production
- [ ] Error boundaries implemented
- [ ] Loading states implemented
- [ ] Fallback content for missing products

## Performance Optimization

### 1. Enable CDN for Client-side
```typescript
useCdn: true // For client-side reads
```

### 2. Limit GROQ Query Fields
```typescript
// Only fetch what you need
const query = `*[_type == "amazon.product" && asin == $asin][0]{
  asin, title, price, images[0]
}`
```

### 3. Implement Caching
```typescript
// Use React Query or SWR for caching
import useSWR from 'swr'

const { data: product } = useSWR(
  ['product', asin],
  () => client.fetch(query, { asin })
)
```

### 4. Lazy Loading
```tsx
import dynamic from 'next/dynamic'

const AmazonProductDisplay = dynamic(
  () => import('./AmazonProductDisplay'),
  { loading: () => <ProductSkeleton /> }
)
```