import { defineType, defineField } from 'sanity'

// Example: Blog Post schema with Amazon Product reference
export const blogPostSchema = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent', // Your portable text type
    }),
    
    // Amazon Product Reference Field
    defineField({
      name: 'amazonProduct',
      title: 'Choose Product',
      type: 'reference',
      to: [{ type: 'amazon.product' }],
      options: {
        filter: ({ document }: { document: any }) => ({
          filter: '_type == "amazon.product"',
          params: {}
        })
      },
      description: 'Select an Amazon product to feature in this blog post',
    }),
    
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      amazonProduct: 'amazonProduct.title',
      media: 'amazonProduct.images.0',
    },
    prepare(selection: any) {
      const { title, amazonProduct } = selection
      return {
        title: title,
        subtitle: amazonProduct ? `Features: ${amazonProduct}` : 'No product selected',
        media: selection.media,
      }
    },
  },
})

// Example: Product Review schema with Amazon Product reference
export const productReviewSchema = defineType({
  name: 'review',
  title: 'Product Review',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Review Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    
    // Amazon Product Reference Field
    defineField({
      name: 'amazonProduct',
      title: 'Choose Product',
      type: 'reference',
      to: [{ type: 'amazon.product' }],
      options: {
        filter: ({ document }: { document: any }) => ({
          filter: '_type == "amazon.product"',
          params: {}
        })
      },
      validation: (Rule: any) => Rule.required(),
      description: 'Select the Amazon product being reviewed',
    }),
    
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      options: {
        range: { min: 1, max: 5, step: 0.5 }
      },
      validation: Rule => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'pros',
      title: 'Pros',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'cons',
      title: 'Cons',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'content',
      title: 'Review Content',
      type: 'blockContent', // Your portable text type
    }),
  ],
  preview: {
    select: {
      title: 'title',
      rating: 'rating',
      productTitle: 'amazonProduct.title',
      media: 'amazonProduct.images.0',
    },
    prepare(selection: any) {
      const { title, rating, productTitle } = selection
      return {
        title: title,
        subtitle: `${rating}/5 stars - ${productTitle || 'No product'}`,
        media: selection.media,
      }
    },
  },
})

// Example: Comparison schema with multiple Amazon Products
export const productComparisonSchema = defineType({
  name: 'comparison',
  title: 'Product Comparison',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Comparison Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    
    // Array of Amazon Products
    defineField({
      name: 'amazonProducts',
      title: 'Choose Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'amazon.product' }],
          options: {
            filter: ({ document }: { document: any }) => ({
              filter: '_type == "amazon.product"',
              params: {}
            })
          }
        }
      ],
      validation: Rule => Rule.required().min(2).max(5),
      description: 'Select 2-5 Amazon products to compare',
    }),
    
    defineField({
      name: 'content',
      title: 'Comparison Content',
      type: 'blockContent', // Your portable text type
    }),
  ],
  preview: {
    select: {
      title: 'title',
      products: 'amazonProducts',
    },
    prepare(selection: any) {
      const { title, products } = selection
      const productCount = products?.length || 0
      return {
        title: title,
        subtitle: `Comparing ${productCount} products`,
      }
    },
  },
})