import { useClient, defineType, defineField, defineArrayMember, useFormValue, set, definePlugin } from "sanity";
import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useToast, Card, Stack, Text, Flex, Button, Box, TextInput } from "@sanity/ui";
function AmazonSettingsActions(props) {
  const { schemaType, document } = props, toast = useToast(), [loading, setLoading] = useState(!1), client = useClient({ apiVersion: "2025-01-01" }), [documentData, setDocumentData] = useState({}), [isLoadingData, setIsLoadingData] = useState(!0);
  useEffect(() => {
    (async () => {
      try {
        const pathParts = window.location.pathname.split(";");
        let documentId = "amazon-settings";
        pathParts.length > 1 && (documentId = pathParts[1]);
        const data = await client.fetch(`*[_type == "amazon.settings" && _id == $id][0]{
          region,
          accessKey,
          secretKey,
          partnerTag,
          asinNumber,
          cacheHours
        }`, { id: documentId });
        data && setDocumentData(data);
      } catch {
      } finally {
        setIsLoadingData(!1);
      }
    })();
  }, [client]);
  const asinNumber = documentData?.asinNumber, hasCredentials = documentData?.accessKey && documentData?.secretKey && documentData?.partnerTag;
  return /* @__PURE__ */ jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: /* @__PURE__ */ jsxs(Stack, { space: 3, children: [
    /* @__PURE__ */ jsx(Text, { size: 1, muted: !0, children: schemaType.title || "Actions" }),
    /* @__PURE__ */ jsxs(Flex, { gap: 2, children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          text: "Test API Connection",
          tone: "positive",
          disabled: isLoadingData || loading,
          onClick: async () => {
            if (!documentData?.accessKey || !documentData?.secretKey || !documentData?.partnerTag || !documentData?.asinNumber) {
              toast.push({
                status: "warning",
                title: "Missing Credentials",
                description: "Please fill in all required fields first"
              });
              return;
            }
            setLoading(!0);
            try {
              const response = await fetch("http://localhost:3001/api/amazon/test-connection", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  testAsin: documentData.asinNumber
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
          }
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          text: "Debug Document",
          tone: "caution",
          disabled: isLoadingData,
          onClick: () => {
            console.log("=== DEBUG DOCUMENT STATE ==="), console.log("Document:", document), console.log("DocumentData:", documentData), console.log("Has Credentials:", hasCredentials), console.log("ASIN Number:", asinNumber), console.log("Is Loading Data:", isLoadingData), console.log("Current URL:", window.location.pathname), console.log("========================"), toast.push({
              status: "info",
              title: "Document State Logged",
              description: "Check browser console for detailed document information"
            });
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Text, { size: 1, muted: !0, children: isLoadingData ? "Loading document data..." : hasCredentials ? asinNumber ? "Use these buttons to test your API credentials and debug document state." : "Provide a test ASIN number to test the API connection." : "Fill in API credentials first, then provide a test ASIN to test the connection." }),
    isLoadingData && /* @__PURE__ */ jsx(Text, { size: 1, muted: !0, children: "\u23F3 Loading document data from Sanity..." }),
    !isLoadingData && hasCredentials && asinNumber && /* @__PURE__ */ jsxs(Text, { size: 1, muted: !0, children: [
      "\u2705 Ready to test API connection with ",
      documentData.region || "com",
      " region"
    ] })
  ] }) });
}
const amazonSettingsSchema = defineType({
  name: "amazon.settings",
  title: "Amazon Settings",
  type: "document",
  groups: [
    { name: "api", title: "API Configuration" },
    { name: "display", title: "Display Settings" },
    { name: "actions", title: "Actions" }
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
      group: "api",
      description: "From Amazon product's page add ASIN number of any product for testing API connection.",
      validation: (r) => r.required()
    }),
    defineField({
      name: "cacheHours",
      title: "Cache Duration (hours)",
      type: "number",
      group: "api",
      initialValue: 24,
      validation: (r) => r.min(1).max(168)
    }),
    // Field Display Settings
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
    }),
    // Actions (modern: dedicated field component)
    defineField({
      name: "settingsActions",
      title: "Actions",
      type: "string",
      group: "actions",
      components: {
        input: AmazonSettingsActions
      }
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
      type: "amazon.asin",
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
}), amazonAsinType = defineType({
  name: "amazon.asin",
  title: "ASIN",
  type: "string"
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
  const { schemaType, parent } = props, toast = useToast(), [loading, setLoading] = useState(!1), client = useClient({ apiVersion: "2025-01-01" }), [amazonSettings, setAmazonSettings] = useState(null), [isLoadingSettings, setIsLoadingSettings] = useState(!0);
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
  const asinValue = useFormValue(["asin"]) || "", handleFetchFromAmazon = useCallback(async () => {
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
    let documentId = null;
    if (parent?._id)
      documentId = parent._id;
    else {
      const pathParts = window.location.pathname.split(";");
      if (pathParts.length > 1) {
        const encodedId = pathParts[1];
        documentId = decodeURIComponent(encodedId).split(",")[0];
      }
    }
    if (!documentId) {
      toast.push({
        status: "error",
        title: "Document Not Found",
        description: "Cannot update document - document ID not available. Please save the document first."
      });
      return;
    }
    setLoading(!0);
    try {
      const response = await fetch("http://localhost:3001/api/amazon/fetch-product", {
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
        await client.patch(documentId).set(updateData).commit(), toast.push({
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
  }, [asinValue, amazonSettings, client, toast, parent]);
  return /* @__PURE__ */ jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: /* @__PURE__ */ jsxs(Stack, { space: 3, children: [
    /* @__PURE__ */ jsx(Text, { size: 1, muted: !0, children: schemaType.title || "Fetch from Amazon" }),
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
});
function AmazonAsinInput(props) {
  const { schemaType, document, value, onChange } = props, toast = useToast(), [loading, setLoading] = useState(!1), client = useClient({ apiVersion: "2025-01-01" });
  useEffect(() => {
    console.log("\u{1F50D} AmazonAsinInput Debug Info:"), console.log("Props:", props), console.log("Value:", value), console.log("Document:", document), console.log("Document ASIN:", document?.asin), console.log("OnChange function:", onChange);
  }, [props, value, document, onChange]);
  const handleInputChange = (next) => {
    const trimmed = next ?? "";
    console.log("\u{1F50D} ASIN Input Change:", { next, trimmed }), onChange(set(trimmed));
  }, handleFetchFromAmazon = useCallback(async () => {
    if (!value) {
      toast.push({
        status: "warning",
        title: "ASIN Required",
        description: "Please enter an ASIN number first"
      });
      return;
    }
    setLoading(!0);
    try {
      const response = await fetch("http://localhost:3001/api/amazon/fetch-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          asin: value
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        const updateData = {
          title: result.product.title,
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
        await client.patch(document._id).set(updateData).commit(), toast.push({
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
  }, [value, client, toast, document]);
  return /* @__PURE__ */ jsxs(Stack, { space: 3, children: [
    /* @__PURE__ */ jsx(Card, { padding: 2, tone: "caution", radius: 1, children: /* @__PURE__ */ jsxs(Stack, { space: 2, children: [
      /* @__PURE__ */ jsx(Text, { size: 0, weight: "semibold", children: "\u{1F50D} ASIN Input Debug:" }),
      /* @__PURE__ */ jsxs(Text, { size: 0, children: [
        "Current Value: ",
        value || "EMPTY"
      ] }),
      /* @__PURE__ */ jsxs(Text, { size: 0, children: [
        "Document ASIN: ",
        JSON.stringify(document?.asin)
      ] }),
      /* @__PURE__ */ jsxs(Text, { size: 0, children: [
        "OnChange Type: ",
        typeof onChange
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsx("label", { style: { display: "block", marginBottom: "8px", fontWeight: "bold" }, children: schemaType.title || "ASIN" }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          value: value || "",
          onChange: (e) => handleInputChange(e.currentTarget.value),
          placeholder: "Enter Amazon ASIN (e.g., B0F15TM77B)"
        }
      )
    ] }),
    value && /* @__PURE__ */ jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: /* @__PURE__ */ jsxs(Stack, { space: 3, children: [
      /* @__PURE__ */ jsx(Text, { size: 1, muted: !0, children: "Fetch Product Details" }),
      /* @__PURE__ */ jsx(Flex, { gap: 2, children: /* @__PURE__ */ jsx(
        Button,
        {
          text: "Fetch from Amazon",
          tone: "positive",
          disabled: loading,
          onClick: handleFetchFromAmazon,
          loading
        }
      ) }),
      /* @__PURE__ */ jsx(Text, { size: 1, muted: !0, children: loading ? "Fetching product data from Amazon..." : `Ready to fetch product data for ASIN: ${value}` })
    ] }) })
  ] });
}
const amazonProductsPlugin = definePlugin((opts) => ({
  name: "sanity-plugin-amazon-products",
  schema: {
    types: [amazonSettingsSchema, amazonProductSchema, amazonAsinType, amazonProductBlock, amazonFetchButtonSchema]
  },
  form: {
    renderInput(props, next) {
      return props.schemaType.name === "amazon.asin" ? AmazonAsinInput(props) : next(props);
    }
  }
}));
export {
  amazonProductsPlugin,
  amazonProductsPlugin as default
};
//# sourceMappingURL=index.js.map
