import { createClient } from '@sanity/client';
export class SanityClient {
    client;
    constructor() {
        // These will be set by the calling environment
        const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID;
        const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET;
        const token = process.env.SANITY_API_TOKEN;
        if (!projectId || !dataset) {
            throw new Error('Missing Sanity project ID or dataset');
        }
        this.client = createClient({
            projectId,
            dataset,
            apiVersion: '2025-01-01',
            useCdn: false, // We need fresh data for settings
            token, // Optional: for private datasets
        });
    }
    /**
     * Get Amazon settings from Sanity
     */
    async getAmazonSettings() {
        try {
            const query = `*[_type == "amazon.settings"][0]{
        region,
        accessKey,
        secretKey,
        partnerTag,
        asinNumber,
        cacheHours
      }`;
            const settings = await this.client.fetch(query);
            if (!settings || !settings.accessKey || !settings.secretKey || !settings.partnerTag) {
                return null;
            }
            return {
                region: settings.region || 'com',
                accessKey: settings.accessKey,
                secretKey: settings.secretKey,
                partnerTag: settings.partnerTag,
                asinNumber: settings.asinNumber || '',
                cacheHours: settings.cacheHours || 24
            };
        }
        catch (error) {
            console.error('Error fetching Amazon settings:', error);
            return null;
        }
    }
    /**
     * Test if we can connect to Sanity
     */
    async testConnection() {
        try {
            await this.client.fetch('*[_type == "amazon.settings"][0]');
            return true;
        }
        catch (error) {
            console.error('Error testing Sanity connection:', error);
            return false;
        }
    }
}
