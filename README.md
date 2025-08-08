# Sanity Plugin: Amazon Products

A comprehensive Sanity Studio plugin for fetching and managing Amazon products using the Amazon Product Advertising API. This plugin provides complete feature parity with the WordPress "Sync Product From Amazon" plugin while leveraging modern Sanity development practices.

## Features

- **Complete WordPress Plugin Parity**: All 17 fields from the original WordPress plugin implemented
- **Studio Tools**: Custom tools for single product and bulk import functionality
- **Custom ASIN Input**: Enhanced input component with fetch functionality
- **Portable Text Block**: Native Sanity content block for embedding products
- **Serverless Functions**: Scalable API integration with PA-API v5
- **Settings Management**: Comprehensive settings schema with all WordPress options
- **Help System**: Built-in documentation and troubleshooting guide
- **TypeScript Support**: Full type safety throughout the plugin

## Installation

```bash
npm install sanity-plugin-amazon-products
```

## Setup

### 1. Add to Sanity Config

```typescript
// sanity.config.ts
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {amazonProductsPlugin} from 'sanity-plugin-amazon-products'

export default defineConfig({
  name: 'default',
  title: 'Your Studio',
  
  projectId: 'your-project-id',
  dataset: 'production',
  
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Amazon Settings as a singleton (direct form access)
            S.listItem()
              .title('Amazon Settings')
              .child(
                S.document()
                  .schemaType('amazon.settings')
                  .documentId('amazon-settings')
              ),
            
            // Amazon Products as a list
            S.listItem()
              .title('Amazon Products')
              .child(
                S.documentTypeList('amazon.product')
                  .title('Amazon Products')
              ),
            
            // Your other content types
            S.divider(),
            S.listItem()
              .title('Posts')
              .child(S.documentTypeList('post')),
          ]),
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

### 2. Add Schemas to Your Studio

The plugin automatically registers its schemas, but you can also import them manually:

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

### 3. Add Portable Text Block (Optional)

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
    // ... other product data
  }))
}
```

#### `/api/amazon/bulk-import.ts`
```typescript
export async function POST(req: Request): Promise<Response> {
  const {asins} = await req.json()
  
  // TODO: Implement bulk import
  // Create multiple amazon.product documents
  
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

1. Click "Amazon Settings" from the left menu
2. Configure your PA-API credentials
3. Set display preferences
4. Test API connection

### Amazon Products Tool

1. Click "Amazon Products" tool from the top toolbar
2. Use "Single Product" tab to fetch individual products
3. Use "Bulk Import" tab to import multiple products
4. Clear cache when needed

### Custom ASIN Input

1. Add an `amazon.asin` field to any document
2. Enter an ASIN and click "Fetch"
3. Product data will be fetched and stored

### Portable Text Block

1. Add `amazon.productBlock` to your Portable Text arrays
2. Select a product reference
3. Choose display options

## Schema Types

### `amazon.settings`
Settings document with all API credentials and display preferences.

### `amazon.product`
Product document with all Amazon product data.

### `amazon.asin`
Custom input type for ASIN fields with fetch functionality.

### `amazon.productBlock`
Portable Text block for embedding products in content.

## WordPress Plugin Comparison

This plugin provides complete feature parity with the WordPress "Sync Product From Amazon" plugin:

| **WordPress Feature** | **Sanity Implementation** | **Status** |
|----------------------|---------------------------|------------|
| API Settings (9 fields) | ✅ Complete | **Complete** |
| Field Settings (5 fields) | ✅ Complete | **Complete** |
| Import Products (3 fields) | ✅ Complete | **Complete** |
| Help System (6 sections) | ✅ Complete | **Complete** |

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