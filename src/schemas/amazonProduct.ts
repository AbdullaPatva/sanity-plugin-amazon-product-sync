import { defineType, defineField, defineArrayMember } from 'sanity'

export const amazonProductSchema = defineType({
  name: 'amazon.product',
  title: 'Amazon Product',
  type: 'document',
  groups: [
    { name: 'product', title: 'Product' },
    { name: 'pricing', title: 'Pricing' },
    { name: 'assets', title: 'Assets' },
  ],
  fields: [
    defineField({
      name: 'asin',
      title: 'ASIN',
      type: 'amazon.asin',
      group: 'product',
      validation: (r: any) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'product',
    }),
    defineField({
      name: 'url',
      title: 'Product URL',
      type: 'url',
      group: 'product',
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      group: 'product',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'product',
    }),
    defineField({
      name: 'price',
      title: 'Price (display)',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price (display)',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'listPrice',
      title: 'List Price (display)',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'url', title: 'URL', type: 'url' },
            { name: 'width', title: 'Width', type: 'number' },
            { name: 'height', title: 'Height', type: 'number' },
          ],
        }),
      ],
      group: 'assets',
    }),
    defineField({
      name: 'lastSyncedAt',
      title: 'Last Synced At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Amazon Product',
    }),
  },
})

