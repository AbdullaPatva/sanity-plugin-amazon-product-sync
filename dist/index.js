import { useFormValue, defineType, defineField, defineArrayMember, useClient, definePlugin } from "sanity";
import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useCallback } from "react";
import { useToast, Card, Stack, Flex, Button, Text } from "@sanity/ui";
function getApiBaseUrl() {
  const envUrl = process.env.SANITY_STUDIO_AMAZON_API_URL;
  if (!envUrl)
    throw new Error("SANITY_STUDIO_AMAZON_API_URL environment variable is not defined. Please add it to your .env.local file in the Sanity Studio root.");
  try {
    return new URL(envUrl), envUrl;
  } catch {
    throw new Error(`Invalid SANITY_STUDIO_AMAZON_API_URL format: ${envUrl}. Please provide a valid URL (e.g., http://localhost:3001)`);
  }
}
function getTestConnectionPath() {
  const path = process.env.SANITY_STUDIO_AMAZON_TEST_CONNECTION_PATH;
  if (!path)
    throw new Error("SANITY_STUDIO_AMAZON_TEST_CONNECTION_PATH environment variable is not defined. Please add it to your .env.local file in the Sanity Studio root.");
  return path;
}
function getFetchProductPath() {
  const path = process.env.SANITY_STUDIO_AMAZON_FETCH_PRODUCT_PATH;
  if (!path)
    throw new Error("SANITY_STUDIO_AMAZON_FETCH_PRODUCT_PATH environment variable is not defined. Please add it to your .env.local file in the Sanity Studio root.");
  return path;
}
function AmazonSettingsActions(props) {
  const toast = useToast(), [loading, setLoading] = useState(!1), accessKey = useFormValue(["accessKey"]), secretKey = useFormValue(["secretKey"]), partnerTag = useFormValue(["partnerTag"]), asinNumber = useFormValue(["asinNumber"]), region = useFormValue(["region"]), hasCredentials = !!(accessKey && secretKey && partnerTag && asinNumber);
  return /* @__PURE__ */ jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: /* @__PURE__ */ jsxs(Stack, { space: 3, children: [
    /* @__PURE__ */ jsxs(Flex, { gap: 2, children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          text: "Test API Connection",
          tone: "positive",
          disabled: loading || !hasCredentials,
          onClick: async () => {
            if (!accessKey || !secretKey || !partnerTag || !asinNumber) {
              toast.push({
                status: "warning",
                title: "Missing Credentials",
                description: "Please fill in all required fields first"
              });
              return;
            }
            setLoading(!0);
            try {
              const apiUrl = `${getApiBaseUrl()}${getTestConnectionPath()}`, response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  testAsin: asinNumber
                })
              });
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
              }
              const result = await response.json();
              if (result.success)
                toast.push({
                  status: "success",
                  title: "Amazon API Test Successful!",
                  description: `Successfully fetched: ${result.testProduct.title}`
                });
              else
                throw new Error(result.error || "API test failed");
            } catch (error) {
              toast.push({
                status: "error",
                title: "API Test Failed",
                description: error?.message || "Unknown error occurred"
              });
            } finally {
              setLoading(!1);
            }
          },
          loading
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          text: "Debug Document",
          tone: "caution",
          disabled: loading,
          onClick: () => {
            const debugInfo = {
              accessKey: accessKey ? `${accessKey.substring(0, 8)}...` : "Not set",
              secretKey: secretKey ? `${secretKey.substring(0, 8)}...` : "Not set",
              partnerTag: partnerTag || "Not set",
              asinNumber: asinNumber || "Not set",
              region: region || "Not set",
              hasCredentials
            };
            console.log("Amazon Settings Debug Info:", debugInfo), toast.push({
              status: "info",
              title: "Debug Info Logged",
              description: "Check browser console for details"
            });
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Text, { size: 1, children: 'Please make sure to "Publish" the document incase you have modified the Access Key, Secret Key, or Partner Tag.' }),
    hasCredentials && /* @__PURE__ */ jsxs(Text, { size: 1, muted: !0, children: [
      "\u2705 Ready to test API connection with ",
      asinNumber
    ] })
  ] }) });
}
const amazonSettingsSchema = defineType({
  name: "amazon.settings",
  title: "Amazon Settings",
  type: "document",
  groups: [
    { name: "api", title: "API Configuration" },
    { name: "actions", title: "Actions" },
    { name: "display", title: "Display Settings" }
  ],
  fields: [
    defineField({
      name: "region",
      title: "Amazon Region",
      type: "string",
      group: "api",
      options: {
        list: [
          { title: "US (default)", value: "com" },
          { title: "Australia", value: "com.au" },
          { title: "Belgium", value: "com.be" },
          { title: "Brazil", value: "com.br" },
          { title: "Canada", value: "ca" },
          { title: "Egypt", value: "eg" },
          { title: "France", value: "fr" },
          { title: "Germany", value: "de" },
          { title: "India", value: "in" },
          { title: "Italy", value: "it" },
          { title: "Japan", value: "co.jp" },
          { title: "Mexico", value: "com.mx" },
          { title: "Netherlands", value: "nl" },
          { title: "Poland", value: "pl" },
          { title: "Singapore", value: "sg" },
          { title: "Saudi Arabia", value: "sa" },
          { title: "Spain", value: "es" },
          { title: "Sweden", value: "se" },
          { title: "Turkey", value: "com.tr" },
          { title: "United Arab Emirates", value: "ae" },
          { title: "United Kingdom", value: "co.uk" }
        ]
      },
      initialValue: "com",
      validation: (r) => r.required()
    }),
    defineField({
      name: "accessKey",
      title: "PA-API Access Key",
      type: "string",
      group: "api",
      description: "Enter your Amazon API Access Key to authenticate API requests.",
      validation: (r) => r.required()
    }),
    defineField({
      name: "secretKey",
      title: "PA-API Secret Key",
      type: "string",
      group: "api",
      description: "Enter your Amazon API Secret Key for secure access to the API.",
      validation: (r) => r.required()
    }),
    defineField({
      name: "partnerTag",
      title: "Associate Tag (Partner Tag)",
      type: "string",
      group: "api",
      description: "Enter your Amazon Partner Tag for tracking and attribution in the affiliate program.",
      validation: (r) => r.required()
    }),
    defineField({
      name: "asinNumber",
      title: "Enter random ASIN Number",
      type: "string",
      group: "actions",
      description: "From Amazon product's page add ASIN number of any product for testing API connection.",
      validation: (r) => r.required()
    }),
    defineField({
      name: "settingsActions",
      title: "Actions",
      type: "string",
      group: "actions",
      components: {
        input: AmazonSettingsActions
      }
    }),
    defineField({
      name: "cacheHours",
      title: "Cache Duration (hours)",
      type: "number",
      group: "api",
      initialValue: 24,
      validation: (r) => r.min(1).max(168)
    }),
    defineField({
      name: "showProductTitle",
      title: "Show Product Title",
      type: "boolean",
      group: "display",
      initialValue: !0
    }),
    defineField({
      name: "showProductImage",
      title: "Show Product Image",
      type: "boolean",
      group: "display",
      initialValue: !0
    }),
    defineField({
      name: "showProductFeatures",
      title: "Show Product Features",
      type: "boolean",
      group: "display",
      initialValue: !0
    }),
    defineField({
      name: "showProductPrice",
      title: "Show Product Price",
      type: "boolean",
      group: "display",
      initialValue: !0
    }),
    defineField({
      name: "showCtaLink",
      title: "Show CTA Link",
      type: "boolean",
      group: "display",
      initialValue: !0
    })
  ],
  preview: {
    prepare: () => ({
      title: "Amazon Settings"
    })
  }
}), amazonProductSchema = defineType({
  name: "amazon.product",
  title: "Amazon Products",
  type: "document",
  fields: [
    defineField({
      name: "asin",
      title: "ASIN",
      type: "string",
      validation: (r) => r.required()
    }),
    defineField({
      name: "fetchButton",
      title: "Fetch from Amazon",
      type: "amazonFetchButton"
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string"
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96
      }
    }),
    defineField({
      name: "url",
      title: "Product URL",
      type: "url"
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string"
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [defineArrayMember({ type: "string" })]
    }),
    defineField({
      name: "price",
      title: "Price (display)",
      type: "string"
    }),
    defineField({
      name: "salePrice",
      title: "Sale Price (display)",
      type: "string"
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string"
    }),
    defineField({
      name: "listPrice",
      title: "List Price (display)",
      type: "string"
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "url", title: "URL", type: "url" },
            { name: "width", title: "Width", type: "number" },
            { name: "height", title: "Height", type: "number" }
          ]
        })
      ]
    }),
    defineField({
      name: "lastSyncedAt",
      title: "Last Synced At",
      type: "datetime",
      readOnly: !0
    })
  ]
}), amazonProductBlock = defineType({
  name: "amazon.productBlock",
  title: "Amazon Product",
  type: "object",
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "amazon.product" }],
      validation: (r) => r.required()
    }),
    defineField({
      name: "showPrice",
      title: "Show price",
      type: "boolean",
      initialValue: !0
    })
  ],
  preview: {
    select: { title: "product.title", subtitle: "product.asin" },
    prepare: ({ title, subtitle }) => ({ title: title || "Amazon Product", subtitle })
  }
});
function AmazonFetchButton(props) {
  const toast = useToast(), [loading, setLoading] = useState(!1), client = useClient({ apiVersion: "2025-01-01" }), [amazonSettings, setAmazonSettings] = useState(null), [isLoadingSettings, setIsLoadingSettings] = useState(!0);
  React.useEffect(() => {
    (async () => {
      try {
        const settings = await client.fetch(`*[_type == "amazon.settings"][0]{
          accessKey,
          secretKey,
          region,
          partnerTag
        }`);
        setAmazonSettings(settings);
      } catch (error) {
        console.error("Error fetching Amazon settings:", error);
      } finally {
        setIsLoadingSettings(!1);
      }
    })();
  }, [client]);
  const asinValue = useFormValue(["asin"]) || "", documentID = useFormValue(["_id"]) || "", handleFetchFromAmazon = useCallback(async () => {
    if (!asinValue) {
      toast.push({
        status: "warning",
        title: "ASIN Required",
        description: "Please enter an ASIN number first"
      });
      return;
    }
    if (!amazonSettings?.accessKey || !amazonSettings?.secretKey || !amazonSettings?.partnerTag) {
      toast.push({
        status: "warning",
        title: "Missing Amazon Settings",
        description: "Please configure Amazon API credentials first"
      });
      return;
    }
    if (!documentID) {
      toast.push({
        status: "error",
        title: "Document Not Found",
        description: "Cannot update document - document ID not available. Please save the document first."
      });
      return;
    }
    setLoading(!0);
    try {
      const apiUrl = `${getApiBaseUrl()}${getFetchProductPath()}`, response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ asin: asinValue })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        const updateData = {
          title: result.product.title,
          slug: { current: result.product.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") },
          brand: result.product.brand,
          price: result.product.price,
          salePrice: result.product.salePrice,
          currency: result.product.currency,
          listPrice: result.product.listPrice,
          url: result.product.url,
          features: result.product.features,
          images: result.product.images,
          lastSyncedAt: result.product.lastSyncedAt
        };
        await client.patch(documentID).set(updateData).commit(), toast.push({
          status: "success",
          title: "Product Fetched Successfully!",
          description: `Fetched: ${result.product.title}`
        });
      } else
        throw new Error(result.error || "Failed to fetch product data");
    } catch (error) {
      toast.push({
        status: "error",
        title: "Fetch Failed",
        description: error?.message || "Unknown error occurred"
      });
    } finally {
      setLoading(!1);
    }
  }, [asinValue, amazonSettings, client, toast, documentID]);
  return /* @__PURE__ */ jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: /* @__PURE__ */ jsxs(Stack, { space: 3, children: [
    /* @__PURE__ */ jsx(Flex, { gap: 2, children: /* @__PURE__ */ jsx(
      Button,
      {
        text: "Fetch from Amazon",
        tone: "positive",
        disabled: !asinValue || loading || isLoadingSettings,
        onClick: handleFetchFromAmazon,
        loading
      }
    ) }),
    /* @__PURE__ */ jsx(Text, { size: 1, muted: !0, children: isLoadingSettings ? "Loading Amazon settings..." : amazonSettings?.accessKey ? asinValue ? loading ? "Fetching product data from Amazon..." : `Ready to fetch product data for ASIN: ${asinValue}` : 'Enter an ASIN number above, then click "Fetch from Amazon" to automatically populate product details.' : "Please configure Amazon API credentials first" }),
    asinValue && !loading && !isLoadingSettings && /* @__PURE__ */ jsxs(Text, { size: 1, muted: !0, children: [
      "\u2705 ASIN entered: ",
      asinValue
    ] })
  ] }) });
}
const amazonFetchButtonSchema = defineType({
  name: "amazonFetchButton",
  title: "Amazon Fetch Button",
  type: "string",
  readOnly: !0,
  components: {
    input: AmazonFetchButton
  }
}), amazonProductsPlugin = definePlugin((opts) => ({
  name: "sanity-plugin-amazon-product-sync",
  schema: {
    types: [amazonSettingsSchema, amazonProductSchema, amazonProductBlock, amazonFetchButtonSchema]
  }
}));
export {
  amazonProductsPlugin,
  amazonProductsPlugin as default
};
//# sourceMappingURL=index.js.map
