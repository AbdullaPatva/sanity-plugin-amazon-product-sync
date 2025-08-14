import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Button, Card, Flex, Stack, Text, useToast } from '@sanity/ui';
import { useClient, useFormValue } from 'sanity';
export function AmazonFetchButton(props) {
    const { schemaType, parent } = props;
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const client = useClient({ apiVersion: '2025-01-01' });
    // State to store Amazon settings
    const [amazonSettings, setAmazonSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    // Fetch Amazon settings using GROQ
    React.useEffect(() => {
        const fetchAmazonSettings = async () => {
            try {
                const query = `*[_type == "amazon.settings"][0]{
          accessKey,
          secretKey,
          region,
          partnerTag
        }`;
                const settings = await client.fetch(query);
                setAmazonSettings(settings);
            }
            catch (error) {
                console.error('Error fetching Amazon settings:', error);
            }
            finally {
                setIsLoadingSettings(false);
            }
        };
        fetchAmazonSettings();
    }, [client]);
    // Get ASIN value from the form context
    const asinValue = useFormValue(['asin']) || '';
    const handleFetchFromAmazon = useCallback(async () => {
        if (!asinValue) {
            toast.push({
                status: 'warning',
                title: 'ASIN Required',
                description: 'Please enter an ASIN number first'
            });
            return;
        }
        if (!amazonSettings?.accessKey || !amazonSettings?.secretKey || !amazonSettings?.partnerTag) {
            toast.push({
                status: 'warning',
                title: 'Missing Amazon Settings',
                description: 'Please configure Amazon API credentials first'
            });
            return;
        }
        // Get document ID from parent context or URL
        let documentId = null;
        if (parent?._id) {
            documentId = parent._id;
        }
        else {
            // Fallback to URL parsing
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split(';');
            if (pathParts.length > 1) {
                const encodedId = pathParts[1];
                const decodedId = decodeURIComponent(encodedId);
                documentId = decodedId.split(',')[0];
            }
        }
        if (!documentId) {
            toast.push({
                status: 'error',
                title: 'Document Not Found',
                description: 'Cannot update document - document ID not available. Please save the document first.'
            });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/amazon/fetch-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
                await client.patch(documentId).set(updateData).commit();
                toast.push({
                    status: 'success',
                    title: 'Product Fetched Successfully!',
                    description: `Fetched: ${result.product.title}`
                });
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
    }, [asinValue, amazonSettings, client, toast, parent]);
    return (_jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Text, { size: 1, muted: true, children: schemaType.title || 'Fetch from Amazon' }), _jsx(Flex, { gap: 2, children: _jsx(Button, { text: "Fetch from Amazon", tone: "positive", disabled: !asinValue || loading || isLoadingSettings, onClick: handleFetchFromAmazon, loading: loading }) }), _jsx(Text, { size: 1, muted: true, children: isLoadingSettings
                        ? 'Loading Amazon settings...'
                        : !amazonSettings?.accessKey
                            ? 'Please configure Amazon API credentials first'
                            : !asinValue
                                ? 'Enter an ASIN number above, then click "Fetch from Amazon" to automatically populate product details.'
                                : loading
                                    ? 'Fetching product data from Amazon...'
                                    : `Ready to fetch product data for ASIN: ${asinValue}` }), asinValue && !loading && !isLoadingSettings && (_jsxs(Text, { size: 1, muted: true, children: ["\u2705 ASIN entered: ", asinValue] }))] }) }));
}
