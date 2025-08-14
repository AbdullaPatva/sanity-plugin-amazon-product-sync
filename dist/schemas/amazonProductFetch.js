import { defineType } from 'sanity';
export const amazonProductFetchSchema = defineType({
    name: 'amazonProductFetch',
    title: 'Amazon Product Fetch',
    type: 'string',
    readOnly: true,
    // Not hidden so the custom input component can be rendered
});
