import crypto from 'crypto'

export interface AmazonCredentials {
  accessKey: string
  secretKey: string
  partnerTag: string
  region: string
}

export interface AmazonProduct {
  asin: string
  title: string
  brand: string
  price: string
  salePrice?: string
  currency: string
  listPrice?: string
  images: Array<{_key: string; url: string; width?: number; height?: number}>
  features: string[]
  url: string
  lastSyncedAt: string
  item?: any
}

interface AmazonApiResponse {
  ItemsResult?: {
    Items?: Array<{
      ItemInfo?: {
        Title?: { DisplayValue?: string }
        ByLineInfo?: { 
          Brand?: { DisplayValue?: string }
          Manufacturer?: { DisplayValue?: string }
        }
        Features?: { DisplayValues?: string[] }
        ManufactureInfo?: {
          ItemPartNumber?: { DisplayValue?: string }
        }
      }
      Offers?: {
        Listings?: Array<{
          Price?: {
            DisplayAmount?: string
            Currency?: string
          }
          SavingBasis?: {
            DisplayAmount?: string
          }
        }>
        Summaries?: Array<{
          LowestPrice?: {
            DisplayAmount?: string
            Currency?: string
          }
          HighestPrice?: {
            DisplayAmount?: string
            Currency?: string
          }
        }>
      }
      Images?: {
        Primary?: {
          Large?: { URL?: string; Width?: number; Height?: number }
        }
      }
    }>
  }
}

export class AmazonClient {
  private credentials: AmazonCredentials
  private readonly service = 'ProductAdvertisingAPI'
  private readonly host: string
  private readonly endpoint: string
  private readonly awsRegion: string

  constructor(credentials: AmazonCredentials) {
    this.credentials = credentials
    
    // Set host, endpoint, and awsRegion based on PA-API documentation
    if (credentials.region === 'com') {
      this.host = 'webservices.amazon.com'
      this.endpoint = 'https://webservices.amazon.com/paapi5/getitems'
      this.awsRegion = 'us-east-1'
    } else if (credentials.region === 'co.uk') {
      this.host = 'webservices.amazon.co.uk'
      this.endpoint = 'https://webservices.amazon.co.uk/paapi5/getitems'
      this.awsRegion = 'eu-west-1'
    } else if (credentials.region === 'de') {
      this.host = 'webservices.amazon.de'
      this.endpoint = 'https://webservices.amazon.de/paapi5/getitems'
      this.awsRegion = 'eu-west-1'
    } else if (credentials.region === 'fr') {
      this.host = 'webservices.amazon.fr'
      this.endpoint = 'https://webservices.amazon.fr/paapi5/getitems'
      this.awsRegion = 'eu-west-1'
    } else if (credentials.region === 'it') {
      this.host = 'webservices.amazon.it'
      this.endpoint = 'https://webservices.amazon.it/paapi5/getitems'
      this.awsRegion = 'eu-west-1'
    } else if (credentials.region === 'es') {
      this.host = 'webservices.amazon.es'
      this.endpoint = 'https://webservices.amazon.es/paapi5/getitems'
      this.awsRegion = 'eu-west-1'
    } else if (credentials.region === 'ca') {
      this.host = 'webservices.amazon.ca'
      this.endpoint = 'https://webservices.amazon.ca/paapi5/getitems'
      this.awsRegion = 'us-east-1'
    } else if (credentials.region === 'com.au') {
      this.host = 'webservices.amazon.com.au'
      this.endpoint = 'https://webservices.amazon.com.au/paapi5/getitems'
      this.awsRegion = 'us-west-2'
    } else if (credentials.region === 'co.jp') {
      this.host = 'webservices.amazon.co.jp'
      this.endpoint = 'https://webservices.amazon.co.jp/paapi5/getitems'
      this.awsRegion = 'ap-northeast-1'
    } else if (credentials.region === 'in') {
      this.host = 'webservices.amazon.in'
      this.endpoint = 'https://webservices.amazon.in/paapi5/getitems'
      this.awsRegion = 'ap-south-1'
    } else {
      // Default to US
      this.host = 'webservices.amazon.com'
      this.endpoint = 'https://webservices.amazon.com/paapi5/getitems'
      this.awsRegion = 'us-east-1'
    }
  }

  async testConnection(asin: string): Promise<AmazonProduct> {
    // Test connection uses the same logic as fetchProduct
    return this.fetchProduct(asin)
  }

  async fetchProduct(asin: string): Promise<AmazonProduct> {
    const operation = 'GetItems'
    const payload = {
      ItemIds: [asin],
      PartnerTag: this.credentials.partnerTag,
      PartnerType: 'Associates',
      Marketplace: this.getMarketplace(),
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ByLineInfo',
        'ItemInfo.ManufactureInfo',
        'ItemInfo.ProductInfo',
        'ItemInfo.TechnicalInfo',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Summaries.HighestPrice',
        'Offers.Summaries.LowestPrice',
        'Images.Primary.Large'
      ]
    }

    try {
      const result = await this.makeRequest(operation, payload)
      
      if (result.ItemsResult?.Items?.[0]) {
        return this.transformProduct(result.ItemsResult.Items[0], asin)
      } else {
        throw new Error('No product data returned from Amazon API')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Amazon API error: ${errorMessage}`)
    }
  }

  private async makeRequest(operation: string, payload: unknown): Promise<AmazonApiResponse> {
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
    const date = timestamp.slice(0, 8)
    const payloadString = JSON.stringify(payload)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Amz-Date': timestamp,
      'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
      'content-encoding': 'amz-1.0',
      'Host': this.host
    }

    const canonicalRequest = this.createCanonicalRequest(operation, payload, headers)
    const stringToSign = this.createStringToSign(timestamp, canonicalRequest)
    const signature = this.calculateSignature(stringToSign, date)
    
    const signedHeaders = this.getSignedHeaders()
    const authorizationHeader = this.createAuthorizationHeader(signature, date, signedHeaders)

    headers['Authorization'] = authorizationHeader

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: payloadString
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  }

  private createCanonicalRequest(operation: string, payload: unknown, headers: Record<string, string>): string {
    const httpMethod = 'POST'
    const canonicalUri = '/paapi5/getitems'
    const canonicalQueryString = ''
    
    const essentialHeaders = [
      'content-encoding',
      'host', 
      'x-amz-date',
      'x-amz-target'
    ]
    
    const canonicalHeaders = essentialHeaders
      .map(key => {
        let headerValue = headers[key]
        if (!headerValue) {
          if (key === 'x-amz-date') headerValue = headers['X-Amz-Date']
          else if (key === 'x-amz-target') headerValue = headers['X-Amz-Target']
          else if (key === 'host') headerValue = headers['Host']
          else if (key === 'content-encoding') headerValue = headers['content-encoding']
        }
        return `${key}:${headerValue}`
      })
      .join('\n') + '\n'
    
    const signedHeaders = essentialHeaders.join(';')
    const payloadHash = this.sha256(JSON.stringify(payload))
    
    return [
      httpMethod,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n')
  }

  private createStringToSign(timestamp: string, canonicalRequest: string): string {
    const date = timestamp.slice(0, 8)
    const scope = `${date}/${this.awsRegion}/${this.service}/aws4_request`
    const canonicalRequestHash = this.sha256(canonicalRequest)
    
    return [
      'AWS4-HMAC-SHA256',
      timestamp,
      scope,
      canonicalRequestHash
    ].join('\n')
  }

  private calculateSignature(stringToSign: string, date: string): string {
    const kDate = crypto.createHmac('sha256', `AWS4${this.credentials.secretKey}`).update(date).digest()
    const kRegion = crypto.createHmac('sha256', kDate).update(this.awsRegion).digest()
    const kService = crypto.createHmac('sha256', kRegion).update(this.service).digest()
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()
    
    return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')
  }

  private getSignedHeaders(): string {
    // Only include the essential headers that should be signed, matching the working examples
    const essentialHeaders = [
      'content-encoding',
      'host', 
      'x-amz-date',
      'x-amz-target'
    ]
    
    return essentialHeaders.join(';')
  }

  private createAuthorizationHeader(signature: string, date: string, signedHeaders: string): string {
    const scope = `${date}/${this.awsRegion}/${this.service}/aws4_request`
    
    return [
      'AWS4-HMAC-SHA256',
      `Credential=${this.credentials.accessKey}/${scope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`
    ].join(', ')
  }

  private getMarketplace(): string {
    const marketplaces: Record<string, string> = {
      'com': 'www.amazon.com',
      'co.uk': 'www.amazon.co.uk',
      'de': 'www.amazon.de',
      'fr': 'www.amazon.fr',
      'it': 'www.amazon.it',
      'es': 'www.amazon.es',
      'ca': 'www.amazon.ca',
      'com.au': 'www.amazon.com.au',
      'co.jp': 'www.amazon.co.jp',
      'in': 'www.amazon.in'
    }
    
    return marketplaces[this.credentials.region] || 'www.amazon.com'
  }

  private transformProduct(item: NonNullable<NonNullable<AmazonApiResponse['ItemsResult']>['Items']>[0], asin: string): AmazonProduct {
    // Basic product info
    const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Title'
    const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 
                  item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || 
                  item.ItemInfo?.ManufactureInfo?.ItemPartNumber?.DisplayValue || 'Unknown Brand'
    
    // Pricing information
    const listing = item.Offers?.Listings?.[0]
    const summaries = item.Offers?.Summaries?.[0]
    
    const price = listing?.Price?.DisplayAmount || 
                  summaries?.LowestPrice?.DisplayAmount || 
                  'Price not available'
    const salePrice = listing?.Price?.DisplayAmount || undefined
    const currency = listing?.Price?.Currency || 
                     summaries?.LowestPrice?.Currency || 'USD'
    const listPrice = listing?.SavingBasis?.DisplayAmount || 
                      summaries?.HighestPrice?.DisplayAmount || 
                      listing?.Price?.DisplayAmount || undefined

    // Image - only primary large image
    const images = []
    if (item.Images?.Primary?.Large?.URL) {
      images.push({
        _key: 'primary-large',
        url: item.Images.Primary.Large.URL,
        width: item.Images.Primary.Large.Width || 500,
        height: item.Images.Primary.Large.Height || 500
      })
    }
    
    // Features and description
    const features = item.ItemInfo?.Features?.DisplayValues || []
    const url = `https://${this.getMarketplace()}/dp/${asin}`
    
    return {
      asin,
      title,
      brand,
      price,
      salePrice,
      currency,
      listPrice,
      images,
      features,
      url,
      lastSyncedAt: new Date().toISOString(),
      item,
    }
  }

  private sha256(message: string): string {
    return crypto.createHash('sha256').update(message).digest('hex')
  }
}