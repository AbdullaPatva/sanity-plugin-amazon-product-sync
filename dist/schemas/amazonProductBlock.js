import { defineType, defineField } from 'sanity';
export const amazonProductBlock = defineType({
    name: 'amazon.productBlock',
    title: 'Amazon Product',
    type: 'object',
    fields: [
        defineField({
            name: 'product',
            title: 'Product',
            type: 'reference',
            to: [{ type: 'amazon.product' }],
            validation: (r) => r.required(),
        }),
        defineField({
            name: 'showPrice',
            title: 'Show price',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        select: { title: 'product.title', subtitle: 'product.asin' },
        prepare: ({ title, subtitle }) => ({ title: title || 'Amazon Product', subtitle }),
    },
});
