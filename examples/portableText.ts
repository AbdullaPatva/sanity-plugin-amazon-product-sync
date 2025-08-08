// Example of adding Amazon product block to Portable Text
// Add this to your schema files

import {defineType, defineArrayMember} from 'sanity'

export const bodyPortableText = defineType({
  name: 'bodyPortableText',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Your block configuration
    }),
    // Add the Amazon product block
    defineArrayMember({
      type: 'amazon.productBlock',
    }),
    // Other custom blocks
    // defineArrayMember({
    //   type: 'image',
    // }),
  ],
}) 