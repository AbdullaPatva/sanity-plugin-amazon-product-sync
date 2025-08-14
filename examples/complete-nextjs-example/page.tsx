'use client'

import Image from "next/image"
import { AmazonProductByASIN, AmazonProductByReferenceId } from "@/components/AmazonProductDisplay"
import { sanityClient } from "@/lib/sanity-client"

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Header */}
      <header className="flex flex-col items-center mb-16">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl font-bold text-center mb-4">
          Amazon Product Integration Demo
        </h1>
        <p className="text-gray-600 text-center max-w-2xl">
          This demo showcases the Amazon Product Sync plugin for Sanity. 
          Below you'll see live products fetched from our Sanity backend using both ASIN and Reference ID lookups.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {/* Featured Product by ASIN */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Product by ASIN Lookup</h2>
          <p className="text-center text-gray-600 mb-6">Fetched using ASIN: B09XFQL45V</p>
          <div className="flex justify-center">
            <AmazonProductByASIN
              asin="B09XFQL45V"
              client={sanityClient}
              layout="card"
              imageSize="large"
              className="max-w-lg"
              debug={true}
              onProductClick={(product: any) => {
                console.log('Product clicked:', product.title)
                alert(`You clicked on: ${product.title}`)
              }}
            />
          </div>
        </section>

        {/* Featured Product by Reference ID */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Product by Reference ID Lookup</h2>
          <p className="text-center text-gray-600 mb-6">Fetched using Reference ID: 3f995870-12ea-4d02-b242-ce78abfbf56e</p>
          <div className="flex justify-center">
            <AmazonProductByReferenceId
              referenceId="3f995870-12ea-4d02-b242-ce78abfbf56e"
              client={sanityClient}
              layout="card"
              imageSize="large"
              className="max-w-lg"
              debug={true}
              onProductClick={(product: any) => {
                console.log('Product (by ref ID) clicked:', product.title)
                alert(`You clicked on: ${product.title} (fetched by ref ID: ${product._id})`)
              }}
            />
          </div>
        </section>

        {/* Example Layouts Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Different Layout Examples</h2>
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Horizontal Layout</h3>
            <AmazonProductByASIN
              asin="B09XFQL45V"
              client={sanityClient}
              layout="horizontal"
              imageSize="medium"
              className="bg-white border border-gray-200 rounded-lg p-4"
            />
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Compact Widget</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold mb-3">Recommended Product</h4>
              <AmazonProductByASIN
                asin="B09XFQL45V"
                client={sanityClient}
                layout="horizontal"
                imageSize="small"
                showFeatures={false}
                showPrice={true}
                showBrand={false}
                className="bg-white rounded p-3"
              />
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="bg-gray-50 rounded-lg p-6 mb-16">
          <h2 className="text-2xl font-semibold mb-4">How This Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">🎯 Dual Lookup Methods</h3>
              <p className="text-gray-600 text-sm">
                The component supports both ASIN (B09XFQL45V) and Reference ID (3f995870-12ea-4d02-b242-ce78abfbf56e) lookups using a single GROQ query.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">🚀 Real-time Data</h3>
              <p className="text-gray-600 text-sm">
                Product information is synchronized from Amazon PA-API and stored in Sanity.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">🎨 Flexible Display</h3>
              <p className="text-gray-600 text-sm">
                Multiple layout options: card, horizontal, vertical with customizable features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">⚡ TypeScript Ready</h3>
              <p className="text-gray-600 text-sm">
                Full type safety with TypeScript interfaces and proper error handling.
              </p>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Usage Examples</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">By ASIN:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`import { AmazonProductByASIN } from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

<AmazonProductByASIN
  asin="B09XFQL45V"
  client={sanityClient}
  layout="card"
  debug={true}
/>`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">By Reference ID:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`import { AmazonProductByReferenceId } from '@/components/AmazonProductDisplay'
import { sanityClient } from '@/lib/sanity-client'

<AmazonProductByReferenceId
  referenceId="3f995870-12ea-4d02-b242-ce78abfbf56e"
  client={sanityClient}
  layout="card"
  debug={true}
/>`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Unified Component:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`import AmazonProductDisplay from '@/components/AmazonProductDisplay'

// Option 1: ASIN lookup
<AmazonProductDisplay asin="B09XFQL45V" client={sanityClient} />

// Option 2: Reference ID lookup  
<AmazonProductDisplay referenceId="3f995870..." client={sanityClient} />

// Option 3: Direct product data
<AmazonProductDisplay product={productData} />`}
              </pre>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex gap-[24px] flex-wrap items-center justify-center mt-20">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn Next.js
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://sanity.io/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Sanity Docs
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://webservices.amazon.com/paapi5/documentation/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Amazon PA-API →
        </a>
      </footer>
    </div>
  )
}