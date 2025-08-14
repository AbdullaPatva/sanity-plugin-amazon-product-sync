// Example: How to add Amazon Product Block to Portable Text in your schema
// This file shows the schema configuration, not the React components

// Example schema configuration for adding Amazon Product Block to Portable Text
export const bodyPortableTextSchema = {
  name: 'bodyPortableText',
  title: 'Body',
  type: 'array',
  of: [
    {
      type: 'block',
      // Your block configuration
    },
    // Add the Amazon product block
    {
      type: 'amazon.productBlock',
    },
    // Other custom blocks
    // {
    //   type: 'image',
    // },
  ],
}

// Example Portable Text data structure with Amazon Product Block
export const examplePortableTextData = [
  {
    _type: 'block',
    _key: 'intro',
    children: [
      {
        _type: 'span',
        _key: 'intro-text',
        text: 'Check out this amazing product:',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
  {
    _type: 'amazonProduct',
    _key: 'product-1',
    asin: 'B0F15TM77B',
    title: 'Example Product',
    brand: 'Example Brand',
    price: '$99.99',
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0F15TM77B',
    images: [
      {
        url: 'https://example.com/image.jpg',
        width: 300,
        height: 300,
      },
    ],
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    lastSyncedAt: '2025-08-14T06:47:18.226Z',
  },
  {
    _type: 'block',
    _key: 'conclusion',
    children: [
      {
        _type: 'span',
        _key: 'conclusion-text',
        text: 'This product is highly recommended!',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
]

// Example: How to use in your React components
// Note: You'll need to implement the actual React components in your project
export const usageInstructions = `
To use the Amazon Product Block in your React components:

1. Install @portabletext/react:
   npm install @portabletext/react

2. Create a custom component for the Amazon Product Block:
   const AmazonProductBlock = ({value}) => {
     return (
       <div className="amazon-product">
         <h3>{value.title}</h3>
         <p>Price: {value.price}</p>
         <a href={value.url}>View on Amazon</a>
       </div>
     )
   }

3. Configure PortableText components:
   const components = {
     types: {
       amazonProduct: AmazonProductBlock,
     },
   }

4. Use in your component:
   <PortableText value={portableTextData} components={components} />
` 