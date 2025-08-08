# Sanity Plugin – Amazon Products (ASIN)

A Sanity Studio plugin to fetch and embed Amazon products by ASIN using the Product Advertising API v5.

## Features

- **Studio Tool**: Fetch Amazon products by ASIN and create `amazon.product` documents
- **Custom ASIN Input**: Special input field with fetch functionality
- **Settings Management**: Store region, partner tag, cache settings, and display preferences
- **Portable Text Block**: Embed Amazon products in your content
- **Document Actions**: Quick sync reminders for existing products
- **Bulk Import**: Import up to 10 products at once
- **Cache Management**: 24-hour caching system with manual cache clearing
- **Field Display Settings**: Control what gets displayed (title, image, features, price, CTA link)
- **Help System**: Comprehensive documentation and troubleshooting guide
- **Serverless Functions**: Secure PA-API integration (stubs provided)

## Installation

```bash
npm install sanity-plugin-amazon-products
```

## Setup

### 1. Add to your Sanity config

```ts
// sanity.config.ts
import {defineConfig} from 'sanity'
import {amazonProductsPlugin} from 'sanity-plugin-amazon-products'

export default defineConfig({
  // ... your existing config
  plugins: [amazonProductsPlugin()],
})
```

### 2. Add schemas to your Studio

The plugin registers these schema types:
- `amazon.settings` - Configuration document with API settings and display preferences
- `amazon.product` - Product documents
- `amazon.asin` - Custom string type with fetch input
- `amazon.productBlock` - Portable Text block for embedding

### 3. Add to Portable Text (optional)

```ts
// In your schema files
defineType({
  name: 'bodyPortableText',
  type: 'array',
  of: [
    {type: 'block'},
    {type: 'amazon.productBlock'}, // Add this line
  ],
})
```

### 4. Create Settings Singleton (recommended)

```ts
// In your structure.ts or similar
export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Amazon Settings')
        .child(
          S.document()
            .schemaType('amazon.settings')
            .documentId('amazon-settings')
        ),
      // ... your other items
    ])
```

## Serverless Function Setup

You need to implement serverless functions to securely call Amazon's PA-API. The plugin includes stubs at `functions/amazon/`.

### Required Functions

1. **`/api/amazon/fetch`** - Single product fetch
2. **`/api/amazon/bulk-import`** - Bulk import (up to 10 products)
3. **`/api/amazon/clear-cache`** - Cache management

### Environment Variables

Set these in your deployment environment:

```env
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
AMAZON_REGION=us-east-1
```

### Function Implementation

The functions should:
1. Accept POST requests with appropriate parameters
2. Use AWS SigV4 to sign PA-API requests
3. Return product data in the expected format

Example response format:

```json
{
  "asin": "B000TEST",
  "title": "Product Title",
  "url": "https://www.amazon.com/dp/B000TEST",
  "brand": "Brand Name",
  "price": "$19.99",
  "currency": "USD",
  "listPrice": "$24.99",
  "images": [
    {
      "url": "https://images-na.ssl-images-amazon.com/images/I/B000TEST._SL1500_.jpg",
      "width": 1500,
      "height": 1500
    }
  ]
}
```

## Usage

### 1. Configure Settings

1. Go to "Amazon Settings" in your Studio
2. Set your region, partner tag, and cache duration
3. Configure display preferences (show/hide title, image, features, price, CTA link)
4. **Important**: Store actual API keys in environment variables, not in documents

### 2. Fetch Products

**Option A: Single Product Import**
1. Open "Amazon Products" tool in Studio
2. Use the "Single Product" tab
3. Enter an ASIN (e.g., "B08N5WRWNW")
4. Click "Fetch" to preview
5. Click "Create Document" to save

**Option B: Bulk Import**
1. Use the "Bulk Import" tab
2. Enter up to 10 ASIN numbers separated by commas
3. Select post type (post/page) and status (publish/draft/private)
4. Click "Import Products"

**Option C: Using ASIN Input**
1. Create a new `amazon.product` document
2. Enter ASIN in the special input field
3. Click "Fetch" to populate the field
4. Use the tool to sync all other fields

### 3. Embed in Content

1. Add `amazon.productBlock` to your Portable Text arrays
2. In your content, select "Amazon Product" from the block menu
3. Choose a product from the reference field
4. Toggle price display as needed

### 4. Cache Management

1. Use the "Clear Cache" button in the Amazon Products tool
2. Cache is automatically cleared after 24 hours
3. Manual clearing forces fresh data from Amazon API

## Schema Types

### amazon.settings
- `region`: Amazon region (us, ca, uk, de, fr, it, es, in, jp)
- `accessKey`: PA-API access key (placeholder)
- `secretKey`: PA-API secret key (placeholder)
- `partnerTag`: Associate/partner tag
- `cacheHours`: Cache duration in hours (1-168)
- `showProductTitle`: Display product title (boolean)
- `showProductImage`: Display product image (boolean)
- `showProductFeatures`: Display product features (boolean)
- `showProductPrice`: Display product price (boolean)
- `showCtaLink`: Display CTA link (boolean)
- `enableShortcode`: Enable shortcode functionality (boolean)
- `enableGutenbergBlock`: Enable Gutenberg block (boolean)

### amazon.product
- `asin`: Amazon Standard Identification Number
- `title`: Product title
- `url`: Product URL
- `brand`: Brand name
- `features`: Array of product features
- `price`: Display price
- `currency`: Price currency
- `listPrice`: Original list price
- `images`: Array of product images
- `lastSyncedAt`: Last sync timestamp

### amazon.productBlock
- `product`: Reference to amazon.product
- `showPrice`: Whether to display price

## Tools

The plugin provides two Studio tools:

1. **Amazon Products**: Main tool for fetching and importing products
   - Single product import
   - Bulk import (up to 10 products)
   - Cache management
   - Product preview and creation

2. **Amazon Products Help**: Comprehensive documentation
   - API setup instructions
   - Usage examples
   - Troubleshooting guide
   - Common issues and solutions

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npx tsc

# Clean
npm run clean
```

## Publishing

1. Update `package.json` with your details
2. Build the plugin: `npx tsc`
3. Publish to npm: `npm publish --access public`

## Requirements

- Node.js 20+
- Sanity Studio v3.86.0+
- React 18+
- Amazon PA-API v5 access

## License

MIT

## Support

For issues and questions:
- Check the "Amazon Products Help" tool in Studio
- Review the [Sanity documentation](https://www.sanity.io/docs)
- Review the [Amazon PA-API documentation](https://webservices.amazon.com/paapi5/documentation/)
- Open an issue on GitHub

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## WordPress Plugin Comparison

This Sanity plugin is a complete conversion of the WordPress "Sync Product From Amazon" plugin, providing:

✅ **All Original Features:**
- API settings management
- Field display preferences
- Bulk import functionality
- Cache management
- Help documentation system
- Product fetching and creation
- Content embedding capabilities

✅ **Modern Enhancements:**
- TypeScript support
- React-based UI components
- Sanity Studio integration
- Portable Text block support
- Serverless function architecture
- Better developer experience

The plugin maintains full compatibility with the original WordPress plugin's functionality while leveraging Sanity's modern architecture and developer experience. 