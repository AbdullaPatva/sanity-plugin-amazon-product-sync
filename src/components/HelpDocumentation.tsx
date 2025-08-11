import React, {useState} from 'react'
import {Box, Button, Card, Heading, Stack, Text} from '@sanity/ui'

type AccordionItemProps = {
  title: string
  children: React.ReactNode
}

function AccordionItem({title, children}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card padding={3} radius={2} tone="transparent" shadow={1}>
      <Stack space={3}>
        <Button
          mode="ghost"
          onClick={() => setIsOpen(!isOpen)}
          text={title}
          style={{justifyContent: 'space-between'}}
        />
        {isOpen && (
          <Box padding={3} style={{borderTop: '1px solid var(--card-shadow-color)'}}>
            {children}
          </Box>
        )}
      </Stack>
    </Card>
  )
}

export function HelpDocumentation() {
  return (
    <Card padding={4}>
      <Stack space={4}>
        <Heading size={2}>Help & Documentation</Heading>
        
        <Text size={1} muted>
          Welcome to the Amazon Products plugin help page! This plugin allows you to fetch products from Amazon using the Amazon Advertising API directly into Sanity Studio.
        </Text>

        <AccordionItem title="API Settings">
          <Stack space={3}>
            <Text size={1}>
              <strong>Amazon Region:</strong> The AWS region corresponding to the target locale where you are sending requests. This varies based on the Amazon locale.
            </Text>
            <Text size={1}>
              <strong>API Access Key:</strong> You can obtain the Amazon Product Advertising API Access Key, Secret Key, and Partner Tag from your Amazon Associates account.
            </Text>
            <Text size={1}>
              <strong>Cache:</strong> Product data is cached for 24 hours to minimize API calls and improve performance.
            </Text>
          </Stack>
        </AccordionItem>

        <AccordionItem title="Import Products">
          <Stack space={3}>
            <Text size={1}>
              You can import products in bulk with this plugin, allowing you to add multiple products at once using the Import Product feature.
            </Text>
            <Text size={1}>
              Simply enter the ASIN numbers into the provided text area, then select the post where you want the products to be added and choose the post status. You can import products into post type by entering multiple (up to 10) ASIN numbers.
            </Text>
          </Stack>
        </AccordionItem>

        <AccordionItem title="Field Settings">
          <Stack space={3}>
            <Text size={1}>
              <strong>Show Product Title:</strong> Display the product title in the frontend output.
            </Text>
            <Text size={1}>
              <strong>Show Product Image:</strong> Display the product image in the frontend output.
            </Text>
            <Text size={1}>
              <strong>Show Product Features:</strong> Display the product features in the frontend output.
            </Text>
            <Text size={1}>
              <strong>Show Product Price:</strong> Display the product price in the frontend output.
            </Text>
            <Text size={1}>
              <strong>Show CTA Link:</strong> Display the "View on Amazon" link in the frontend output.
            </Text>
          </Stack>
        </AccordionItem>

        <AccordionItem title="Important Notes">
          <Stack space={3}>
            <Text size={1}>
              Effective March 9, 2020, Amazon mandates the use of version 5.0 of the Product Advertising API. This updated version offers a more efficient response format, but some data, including Product Descriptions and Customer Reviews, is no longer accessible.
            </Text>
            <Text size={1}>
              If you already have an Amazon Affiliate account, you will need to either migrate your current API keys or generate new ones to ensure the plugin functions correctly.
            </Text>
            <Text size={1}>
              Additionally, Amazon requires full approval of your affiliate account before granting access to the Product Advertising API.
            </Text>
            <Text size={1}>
              For those who don't yet have an Amazon Affiliate account or API keys, the setup process is free and relatively straightforward, typically taking around 15 to 20 minutes.
            </Text>
          </Stack>
        </AccordionItem>

        <AccordionItem title="Common Issues">
          <Stack space={3}>
            <Text size={1}>
              Even after your Amazon Product Advertising API application is approved, it may take several weeks before you can access the API.
            </Text>
            <Text size={1}>
              As you add more products, API requests increase, which can lead to higher overhead. To optimize performance, the caching system groups API requests together, reducing the number of individual requests.
            </Text>
            <Text size={1}>
              Be aware that Amazon OneLink scripts can interfere with standard product links, causing them to malfunction.
            </Text>
            <Text size={1}>
              Some products or product details are not available through the Amazon Product Advertising API. When this occurs, either the product or specific product elements will not appear on your site.
            </Text>
            <Text size={1}>
              To maintain access to the Amazon Product Advertising API, you are required to make at least two referral sales every 30 days. If this threshold is not met, Amazon may deactivate your account, causing the plugin to stop displaying products.
            </Text>
          </Stack>
        </AccordionItem>

        <AccordionItem title="Usage Examples">
          <Stack space={3}>
            <Text size={1}>
              <strong>Single Product Import:</strong> Use the "Single Product" tab to fetch and create individual Amazon products.
            </Text>
            <Text size={1}>
              <strong>Bulk Import:</strong> Use the "Bulk Import" tab to import up to 10 products at once by entering comma-separated ASIN numbers.
            </Text>
            <Text size={1}>
              <strong>Portable Text Block:</strong> Add the amazon.productBlock to your Portable Text arrays to embed products in your content.
            </Text>
            <Text size={1}>
              <strong>Settings Management:</strong> Configure your Amazon API credentials and display preferences in the Amazon Settings document.
            </Text>
          </Stack>
        </AccordionItem>
      </Stack>
    </Card>
  )
} 