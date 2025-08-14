import crypto from 'crypto';
export class AmazonClient {
    credentials;
    service = 'ProductAdvertisingAPI';
    host;
    endpoint;
    awsRegion;
    constructor(credentials) {
        this.credentials = credentials;
        // Set host and endpoint based on region (PA-API endpoints)
        if (credentials.region === 'com') {
            this.host = 'webservices.amazon.com';
            this.endpoint = 'https://webservices.amazon.com/paapi5';
            this.awsRegion = 'us-east-1';
        }
        else if (credentials.region === 'co.uk') {
            this.host = 'webservices.amazon.co.uk';
            this.endpoint = 'https://webservices.amazon.co.uk/paapi5';
            this.awsRegion = 'eu-west-1';
        }
        else if (credentials.region === 'de') {
            this.host = 'webservices.amazon.de';
            this.endpoint = 'https://webservices.amazon.de/paapi5';
            this.awsRegion = 'eu-west-1';
        }
        else if (credentials.region === 'fr') {
            this.host = 'webservices.amazon.fr';
            this.endpoint = 'https://webservices.amazon.fr/paapi5';
            this.awsRegion = 'eu-west-1';
        }
        else if (credentials.region === 'it') {
            this.host = 'webservices.amazon.it';
            this.endpoint = 'https://webservices.amazon.it/paapi5';
            this.awsRegion = 'eu-west-1';
        }
        else if (credentials.region === 'es') {
            this.host = 'webservices.amazon.es';
            this.endpoint = 'https://webservices.amazon.es/paapi5';
            this.awsRegion = 'eu-west-1';
        }
        else if (credentials.region === 'ca') {
            this.host = 'webservices.amazon.ca';
            this.endpoint = 'https://webservices.amazon.ca/paapi5';
            this.awsRegion = 'us-east-1';
        }
        else if (credentials.region === 'com.au') {
            this.host = 'webservices.amazon.com.au';
            this.endpoint = 'https://webservices.amazon.com.au/paapi5';
            this.awsRegion = 'us-west-2';
        }
        else if (credentials.region === 'co.jp') {
            this.host = 'webservices.amazon.co.jp';
            this.endpoint = 'https://webservices.amazon.co.jp/paapi5';
            this.awsRegion = 'ap-northeast-1';
        }
        else if (credentials.region === 'in') {
            this.host = 'webservices.amazon.in';
            this.endpoint = 'https://webservices.amazon.in/paapi5';
            this.awsRegion = 'ap-south-1';
        }
        else {
            // Default to US
            this.host = 'webservices.amazon.com';
            this.endpoint = 'https://webservices.amazon.com/paapi5';
            this.awsRegion = 'us-east-1';
        }
    }
    /**
     * Test API connection by fetching a single product
     */
    async testConnection(asin) {
        const payload = {
            Resources: ['Images.Primary.Medium', 'ItemInfo.Title', 'Offers.Listings.Price', 'ItemInfo.Features'],
            ItemIds: [asin],
            PartnerTag: this.credentials.partnerTag,
            PartnerType: 'Associates',
            Marketplace: this.getMarketplace()
        };
        const response = await this.makeRequest('GetItems', payload);
        if (response.ItemsResult?.Items?.[0]) {
            const item = response.ItemsResult.Items[0];
            return this.transformProduct(item, asin);
        }
        throw new Error('No product data returned from Amazon API');
    }
    /**
     * Make authenticated request to Amazon PA-API
     */
    async makeRequest(operation, payload) {
        const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
        const date = timestamp.slice(0, 8);
        const headers = {
            'Content-Type': 'application/json',
            'X-Amz-Date': timestamp,
            'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPI.${operation}`,
            'Host': this.host
        };
        const canonicalRequest = this.createCanonicalRequest(operation, payload, headers, date);
        const stringToSign = this.createStringToSign(timestamp, canonicalRequest);
        const signature = this.calculateSignature(stringToSign, date);
        const authorizationHeader = this.createAuthorizationHeader(signature, date);
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                ...headers,
                'Authorization': authorizationHeader
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Amazon API error: ${response.status} - ${errorText}`);
        }
        return response.json();
    }
    /**
     * Create canonical request for AWS SigV4
     */
    createCanonicalRequest(operation, payload, headers, date) {
        const httpMethod = 'POST';
        const canonicalUri = '/';
        const canonicalQueryString = '';
        const canonicalHeaders = Object.keys(headers)
            .sort()
            .map(key => `${key.toLowerCase()}:${headers[key]}`)
            .join('\n') + '\n';
        const signedHeaders = Object.keys(headers)
            .sort()
            .map(key => key.toLowerCase())
            .join(';');
        const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
        return [
            httpMethod,
            canonicalUri,
            canonicalQueryString,
            canonicalHeaders,
            signedHeaders,
            payloadHash
        ].join('\n');
    }
    /**
     * Create string to sign for AWS SigV4
     */
    createStringToSign(timestamp, canonicalRequest) {
        const date = timestamp.slice(0, 8);
        const scope = `${date}/${this.awsRegion}/${this.service}/aws4_request`;
        const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
        return [
            'AWS4-HMAC-SHA256',
            timestamp,
            scope,
            canonicalRequestHash
        ].join('\n');
    }
    /**
     * Calculate AWS SigV4 signature
     */
    calculateSignature(stringToSign, date) {
        const kDate = crypto.createHmac('sha256', `AWS4${this.credentials.secretKey}`).update(date).digest();
        const kRegion = crypto.createHmac('sha256', kDate).update(this.awsRegion).digest();
        const kService = crypto.createHmac('sha256', kRegion).update(this.service).digest();
        const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
        return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
    }
    /**
     * Create authorization header
     */
    createAuthorizationHeader(signature, date) {
        const scope = `${date}/${this.awsRegion}/${this.service}/aws4_request`;
        return `AWS4-HMAC-SHA256 Credential=${this.credentials.accessKey}/${scope}, SignedHeaders=host;x-amz-date;x-amz-target, Signature=${signature}`;
    }
    /**
     * Get marketplace based on region
     */
    getMarketplace() {
        const marketplaces = {
            'com': 'www.amazon.com',
            'ca': 'www.amazon.ca',
            'com.br': 'www.amazon.com.br',
            'com.mx': 'www.amazon.com.mx',
            'co.uk': 'www.amazon.co.uk',
            'de': 'www.amazon.de',
            'fr': 'www.amazon.fr',
            'it': 'www.amazon.it',
            'es': 'www.amazon.es',
            'co.jp': 'www.amazon.co.jp',
            'in': 'www.amazon.in',
            'com.au': 'www.amazon.com.au',
            'com.tr': 'www.amazon.com.tr',
            'ae': 'www.amazon.ae',
            'sa': 'www.amazon.sa',
            'se': 'www.amazon.se',
            'nl': 'www.amazon.nl',
            'pl': 'www.amazon.pl',
            'sg': 'www.amazon.sg',
            'eg': 'www.amazon.eg',
            'be': 'www.amazon.com.be'
        };
        return marketplaces[this.credentials.region] || 'www.amazon.com';
    }
    /**
     * Transform Amazon API response to our product format
     */
    transformProduct(item, asin) {
        const product = { asin };
        // Extract title
        if (item.ItemInfo?.Title?.DisplayValue) {
            product.title = item.ItemInfo.Title.DisplayValue;
        }
        // Extract brand
        if (item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue) {
            product.brand = item.ItemInfo.ByLineInfo.Brand.DisplayValue;
        }
        // Extract features
        if (item.ItemInfo?.Features?.DisplayValues) {
            product.features = item.ItemInfo.Features.DisplayValues;
        }
        // Extract pricing
        if (item.Offers?.Listings?.[0]?.Price) {
            const price = item.Offers.Listings[0].Price;
            product.price = price.DisplayAmount;
            product.currency = price.Currency;
            if (price.SavedAmount) {
                product.salePrice = price.DisplayAmount;
                product.listPrice = price.SavedAmount.DisplayAmount;
            }
        }
        // Extract images
        if (item.Images?.Primary?.Medium) {
            const image = item.Images.Primary.Medium;
            product.images = [{
                    url: image.URL,
                    width: image.Width,
                    height: image.Height
                }];
        }
        // Set URL
        product.url = `https://www.amazon.com/dp/${asin}`;
        return product;
    }
}
