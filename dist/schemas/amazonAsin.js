import { defineType } from 'sanity';
// String alias with custom input rendered by form.renderInput
export const amazonAsinType = defineType({
    name: 'amazon.asin',
    title: 'ASIN',
    type: 'string',
});
