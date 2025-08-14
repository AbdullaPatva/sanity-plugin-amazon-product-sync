export interface AmazonSettings {
    region: string;
    accessKey: string;
    secretKey: string;
    partnerTag: string;
    asinNumber: string;
    cacheHours: number;
}
export declare class SanityClient {
    private client;
    constructor();
    /**
     * Get Amazon settings from Sanity
     */
    getAmazonSettings(): Promise<AmazonSettings | null>;
    /**
     * Test if we can connect to Sanity
     */
    testConnection(): Promise<boolean>;
}
