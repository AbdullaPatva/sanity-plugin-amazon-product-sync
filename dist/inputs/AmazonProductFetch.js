import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Button, Card, Flex, Stack, Text, useToast } from '@sanity/ui';
import { useClient } from 'sanity';
export function AmazonProductFetch(props) {
    const { schemaType, document } = props;
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const client = useClient({ apiVersion: '2025-01-01' });
    const asinNumber = document?.asin?.asin || document?.asin;
    const handleFetchFromAmazon = useCallback(async () => {
        if (!asinNumber) {
            toast.push({
                status: 'warning',
                title: 'ASIN Required',
                description: 'Please enter an ASIN number first'
            });
            return;
        }
        setLoading(true);
        try {
            // Call the user's frontend API endpoint
            const response = await fetch('http://localhost:3001/api/amazon/fetch-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asin: asinNumber
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            if (result.success) {
                // Update the document with fetched data
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
                // Use Sanity client to update the document
                await client.patch(document._id).set(updateData).commit();
                toast.push({
                    status: 'success',
                    title: 'Product Fetched Successfully!',
                    description: `Fetched: ${result.product.title}`
                });
                // Trigger a re-render of the form
                window.location.reload();
            }
            else {
                throw new Error(result.error || 'Failed to fetch product data');
            }
        }
        catch (error) {
            toast.push({
                status: 'error',
                title: 'Fetch Failed',
                description: error?.message || 'Unknown error occurred'
            });
        }
        finally {
            setLoading(false);
        }
    }, [asinNumber, client, toast]);
    return (_jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Text, { size: 1, muted: true, children: schemaType.title || 'Fetch from Amazon' }), _jsx(Flex, { gap: 2, children: _jsx(Button, { text: "Fetch from Amazon", tone: "positive", disabled: !asinNumber || loading, onClick: handleFetchFromAmazon, loading: loading }) }), _jsx(Text, { size: 1, muted: true, children: !asinNumber
                        ? 'Enter an ASIN number above, then click "Fetch from Amazon" to automatically populate product details.'
                        : loading
                            ? 'Fetching product data from Amazon...'
                            : `Ready to fetch product data for ASIN: ${asinNumber}` }), asinNumber && !loading && (_jsxs(Text, { size: 1, muted: true, children: ["\u2705 ASIN entered: ", asinNumber] }))] }) }));
}
