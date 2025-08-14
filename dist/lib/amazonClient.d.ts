export interface AmazonCredentials {
    accessKey: string;
    secretKey: string;
    partnerTag: string;
    region: string;
}
export interface AmazonProduct {
    asin: string;
    title?: string;
    url?: string;
    brand?: string;
    features?: string[];
    price?: string;
    salePrice?: string;
    currency?: string;
    listPrice?: string;
    images?: Array<{
        url: string;
        width?: number;
        height?: number;
    }>;
}
export declare class AmazonClient {
    private credentials;
    private readonly service;
    private readonly host;
    private readonly endpoint;
    private readonly awsRegion;
    constructor(credentials: AmazonCredentials);
    /**
     * Test API connection by fetching a single product
     */
    testConnection(asin: string): Promise<AmazonProduct>;
    /**
     * Make authenticated request to Amazon PA-API
     */
    private makeRequest;
    /**
     * Create canonical request for AWS SigV4
     */
    private createCanonicalRequest;
    /**
     * Create string to sign for AWS SigV4
     */
    private createStringToSign;
    /**
     * Calculate AWS SigV4 signature
     */
    private calculateSignature;
    /**
     * Create authorization header
     */
    private createAuthorizationHeader;
    /**
     * Get marketplace based on region
     */
    private getMarketplace;
    /**
     * Transform Amazon API response to our product format
     */
    private transformProduct;
}
