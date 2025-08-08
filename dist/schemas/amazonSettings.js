import { defineType, defineField } from 'sanity';
export const amazonSettingsSchema = defineType({
    name: 'amazon.settings',
    title: 'Amazon Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'region',
            title: 'Amazon Region',
            type: 'string',
            options: {
                list: [
                    { title: 'US (default)', value: 'com' },
                    { title: 'Australia', value: 'com.au' },
                    { title: 'Belgium', value: 'com.be' },
                    { title: 'Brazil', value: 'com.br' },
                    { title: 'Canada', value: 'ca' },
                    { title: 'Egypt', value: 'eg' },
                    { title: 'France', value: 'fr' },
                    { title: 'Germany', value: 'de' },
                    { title: 'India', value: 'in' },
                    { title: 'Italy', value: 'it' },
                    { title: 'Japan', value: 'co.jp' },
                    { title: 'Mexico', value: 'com.mx' },
                    { title: 'Netherlands', value: 'nl' },
                    { title: 'Poland', value: 'pl' },
                    { title: 'Singapore', value: 'sg' },
                    { title: 'Saudi Arabia', value: 'sa' },
                    { title: 'Spain', value: 'es' },
                    { title: 'Sweden', value: 'se' },
                    { title: 'Turkey', value: 'com.tr' },
                    { title: 'United Arab Emirates', value: 'ae' },
                    { title: 'United Kingdom', value: 'co.uk' }
                ],
            },
            initialValue: 'com',
            validation: (r) => r.required(),
        }),
        defineField({
            name: 'accessKey',
            title: 'PA-API Access Key',
            type: 'string',
            description: 'Enter your Amazon API Access Key to authenticate API requests.',
            validation: (r) => r.required(),
        }),
        defineField({
            name: 'secretKey',
            title: 'PA-API Secret Key',
            type: 'string',
            description: 'Enter your Amazon API Secret Key for secure access to the API.',
            validation: (r) => r.required(),
        }),
        defineField({
            name: 'partnerTag',
            title: 'Associate Tag (Partner Tag)',
            type: 'string',
            description: 'Enter your Amazon Partner Tag for tracking and attribution in the affiliate program.',
            validation: (r) => r.required(),
        }),
        defineField({
            name: 'asinNumber',
            title: 'Enter random ASIN Number',
            type: 'string',
            description: 'From Amazon product\'s page add ASIN number of any product for testing API connection.',
            validation: (r) => r.required(),
        }),
        defineField({
            name: 'cacheHours',
            title: 'Cache Duration (hours)',
            type: 'number',
            initialValue: 24,
            validation: (r) => r.min(1).max(168),
        }),
        // Field Display Settings (matching WordPress plugin)
        defineField({
            name: 'showProductTitle',
            title: 'Show Product Title',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showProductImage',
            title: 'Show Product Image',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showProductFeatures',
            title: 'Show Product Features',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showProductPrice',
            title: 'Show Product Price',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showCtaLink',
            title: 'Show CTA Link',
            type: 'boolean',
            initialValue: true,
        }),
        // Import Settings
        defineField({
            name: 'enableShortcode',
            title: 'Enable Shortcode',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'enableGutenbergBlock',
            title: 'Enable Gutenberg Block',
            type: 'boolean',
            initialValue: false,
        }),
        // Actions (modern: dedicated field component)
        defineField({
            name: 'settingsActions',
            title: 'Actions',
            type: 'string',
            components: {
                input: (props) => {
                    const { AmazonSettingsActions } = require('../inputs/AmazonSettingsActions');
                    return AmazonSettingsActions(props);
                },
            },
            options: { layout: 'none' },
        }),
    ],
});
