# Sanity Plugin: Amazon Products

A comprehensive Sanity Studio plugin for fetching and managing Amazon products using the Amazon Product Advertising API. This plugin provides a complete solution for integrating Amazon product data into your Sanity Studio with modern development practices.

## Features

- **Studio Tools**: Custom tools for single product and bulk import functionality
- **Custom ASIN Input**: Enhanced input component with fetch functionality
- **Portable Text Block**: Native Sanity content block for embedding products
- **Serverless Functions**: Scalable API integration with PA-API v5
- **Settings Management**: Comprehensive settings schema with API configuration and display preferences
- **Help System**: Built-in documentation and troubleshooting guide
- **TypeScript Support**: Full type safety throughout the plugin
- **Document Actions**: "Sync from Amazon" action on product documents

## Installation

```bash
npm install sanity-plugin-amazon-products
```

## Setup

### 1. Add to Sanity Config

```typescript
// sanity.config.ts
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {amazonProductsPlugin} from 'sanity-plugin-amazon-products'
import {structure} from './structure' // Import the structure

export default defineConfig({
  name: 'default',
  title: 'Your Studio',
  
  projectId: 'your-project-id',
  dataset: 'production',
  
  plugins: [
    structureTool({
      structure: structure, // Use the imported structure
    }),
    amazonProductsPlugin(),
  ],
  
  schema: {
    types: [
      // Your existing schemas
    ],
  },
})
```

### 2. Create Structure File

Create a `structure.ts` file in your project root:

```typescript
// structure.ts
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Amazon Settings singleton (opens form directly)
      S.listItem()
        .id('amazonSettings')
        .title('Amazon Settings')
        .child(
          S.document()
            .schemaType('amazon.settings')
            .documentId('amazon-settings')
        ),

      // Amazon Product singleton (opens form directly)
      S.listItem()
        .id('amazonProduct')
        .title('Amazon Product')
        .child(
          S.document()
            .schemaType('amazon.product')
            .documentId('amazon-product')
        ),

      S.divider(),

      // Show all remaining document types except the amazon singletons
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id && !['amazon.settings', 'amazon.product'].includes(id)
      }),
    ])
```

### 3. Add Schemas to Your Studio

The plugin automatically registers its schemas, but you can also import them manually if needed:

```typescript
import {
  amazonSettingsSchema,
  amazonProductSchema,
  amazonAsinType,
  amazonProductBlock
} from 'sanity-plugin-amazon-products'

export default defineConfig({
  // ... other config
  schema: {
    types: [
      amazonSettingsSchema,
      amazonProductSchema,
      amazonAsinType,
      amazonProductBlock,
      // ... your other schemas
    ],
  },
})
```

### 4. Add Portable Text Block (Optional)

To use the Amazon product block in your Portable Text:

```typescript
import {defineType, defineArrayMember} from 'sanity'

export const portableTextSchema = defineType({
  name: 'portableText',
  title: 'Portable Text',
  type: 'array',
  of: [
    defineArrayMember({type: 'block'}),
    defineArrayMember({type: 'amazon.productBlock'}),
  ],
})
```

## Serverless Functions Setup

### Required Functions

Create these serverless functions in your Sanity Studio project:

#### `/api/amazon/fetch.ts`
```typescript
export async function POST(req: Request): Promise<Response> {
  const {asin} = await req.json()
  
  // TODO: Implement PA-API v5 request
  // Use credentials from amazon.settings document
  
  return new Response(JSON.stringify({
    asin,
    title: 'Product Title',
    price: '$24.99',
    salePrice: '$19.99',
    currency: 'USD',
    listPrice: '$29.99',
    brand: 'Brand Name',
    url: `https://www.amazon.com/dp/${asin}`,
    images: [
      {url: `https://images-na.ssl-images-amazon.com/images/I/${asin}._SL1500_.jpg`, width: 1500, height: 1500}
    ]
  }))
}
```

#### `/api/amazon/bulk-import.ts`
```typescript
export async function POST(req: Request): Promise<Response> {
  const {asins, postType, postStatus} = await req.json()
  
  // TODO: Implement bulk import
  // Create multiple amazon.product documents
  // postType and postStatus are for reference only
  
  return new Response(JSON.stringify({
    status: 'success',
    message: `Imported ${asins.length} products`
  }))
}
```

#### `/api/amazon/clear-cache.ts`
```typescript
export async function POST(req: Request): Promise<Response> {
  // TODO: Implement cache clearing
  // Clear any cached product data
  
  return new Response(JSON.stringify({
    status: 'success',
    message: 'Cache cleared'
  }))
}
```

## Usage

### Amazon Settings

1. Click "Amazon Settings" from the left menu (opens directly to settings form)
2. Configure your PA-API credentials:
   - Amazon Region (US, UK, etc.)
   - PA-API Access Key
   - PA-API Secret Key
   - Associate Tag (Partner Tag)
   - Test ASIN Number for API testing
   - Cache Duration (1-168 hours)
3. Set display preferences (show/hide product elements)
4. Use the "Test API Connection" and "Clear Cache" buttons

### Amazon Products Tool

1. Click "Amazon Products" tool from the top toolbar
2. **Single Product Tab:**
   - Enter an ASIN and click "Fetch"
   - Review product data and click "Create Product"
3. **Bulk Import Tab:**
   - Enter multiple ASINs (comma-separated, max 10)
   - Set import preferences
   - Click "Bulk Import"
4. Use "Clear Cache" button when needed

### Custom ASIN Input

1. Add an `amazon.asin` field to any document
2. Enter an ASIN and click "Fetch"
3. Product data will be fetched and stored

### Portable Text Block

1. Add `amazon.productBlock` to your Portable Text arrays
2. Select a product reference
3. Choose display options (show/hide price)

## Schema Types

### `amazon.settings`
Settings document with API credentials and display preferences:
- **API Settings**: Region, Access Key, Secret Key, Partner Tag, Test ASIN, Cache Duration
- **Display Settings**: Show/hide product title, image, features, price, CTA link
- **Import Settings**: Product import and management tools
- **Actions**: Test API Connection, Clear Cache buttons

### `amazon.product`
Product document with all Amazon product data:
- **Product Info**: ASIN, title, URL, brand, features
- **Pricing**: Price, sale price, currency, list price
- **Assets**: Images array with URL, width, height
- **Metadata**: Last synced timestamp

### `amazon.asin`
Custom input type for ASIN fields with fetch functionality.

### `amazon.productBlock`
Portable Text block for embedding products in content with price display option.



## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build

# Clean
npm run clean
```

## Requirements

- Sanity Studio v3 or v4
- React 18+
- TypeScript 4.9+
- PA-API v5 credentials

## License

MIT

## Support

For issues and questions, please refer to the help documentation within the plugin or create an issue on GitHub.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request 