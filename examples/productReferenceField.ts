import { defineField } from 'sanity'

// Amazon Product Reference Field
// Copy this field definition into any schema where you want to reference Amazon products
export const amazonProductReference = defineField({
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
})

// Optional: Amazon Product Reference Field (not required)
export const amazonProductReferenceOptional = defineField({
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
})

// Array of Amazon Products (for multiple product selection)
export const amazonProductsArray = defineField({
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
  validation: (Rule: any) => Rule.min(1).max(10),
})