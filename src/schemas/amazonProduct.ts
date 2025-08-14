import { defineType, defineField, defineArrayMember } from 'sanity'

export const amazonProductSchema = defineType({
  name: 'amazon.product',
  title: 'Amazon Products',
  type: 'document',
  fields: [
    defineField({
      name: 'asin',
      title: 'ASIN',
      type: 'amazon.asin',
      validation: (r: any) => r.required(),
    }),
    defineField({
      name: 'fetchButton',
      title: 'Fetch from Amazon',
      type: 'amazonFetchButton',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: 'Product URL',
      type: 'url',
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'price',
      title: 'Price (display)',
      type: 'string',
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price (display)',
      type: 'string',
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
    }),
    defineField({
      name: 'listPrice',
      title: 'List Price (display)',
      type: 'string',
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
    }),
    defineField({
      name: 'lastSyncedAt',
      title: 'Last Synced At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
})

