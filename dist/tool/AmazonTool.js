import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Box, Button, Card, Flex, Heading, Inline, Spinner, Stack, Text, TextInput, useToast } from '@sanity/ui';
import { useClient } from 'sanity';
export function AmazonTool() {
    const client = useClient({ apiVersion: '2025-05-01' });
    const toast = useToast();
    const [asin, setAsin] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const handleFetch = useCallback(async () => {
        if (!asin)
            return;
        setLoading(true);
        try {
            const res = await fetch('/api/amazon/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asin }),
            });
            if (!res.ok)
                throw new Error('Fetch failed');
            const data = await res.json();
            setResult(data);
            toast.push({ status: 'success', title: 'Product fetched', description: data.title || 'No title' });
        }
        catch (e) {
            toast.push({ status: 'error', title: 'Fetch failed', description: e?.message });
        }
        finally {
            setLoading(false);
        }
    }, [asin, toast]);
    const handleCreate = useCallback(async () => {
        if (!result)
            return;
        setLoading(true);
        try {
            const doc = {
                _type: 'amazon.product',
                asin: result.asin,
                title: result.title || '',
                url: result.url || '',
                brand: result.brand || '',
                price: result.price || '',
                salePrice: result.salePrice || '',
                currency: result.currency || 'USD',
                listPrice: result.listPrice || '',
                images: result.images || [],
                lastSyncedAt: new Date().toISOString(),
            };
            const createdDoc = await client.create(doc);
            toast.push({
                status: 'success',
                title: 'Product created',
                description: `Document created with ID: ${createdDoc._id}`,
            });
            setResult(null);
            setAsin('');
        }
        catch (e) {
            toast.push({ status: 'error', title: 'Create failed', description: e?.message });
        }
        finally {
            setLoading(false);
        }
    }, [client, result, toast]);
    return (_jsx(Card, { padding: 4, children: _jsxs(Stack, { space: 4, children: [_jsx(Heading, { size: 2, children: "Amazon Products" }), _jsx(Text, { muted: true, children: "Fetch Amazon products by ASIN and create product documents in your studio." }), _jsxs(Stack, { space: 3, children: [_jsxs(Flex, { gap: 2, children: [_jsx(Box, { flex: 1, children: _jsx(TextInput, { placeholder: "Enter ASIN (e.g., B0F15TM77B)", value: asin, onChange: (e) => setAsin(e.currentTarget.value) }) }), _jsx(Button, { text: "Fetch Product", tone: "primary", disabled: !asin || loading, onClick: handleFetch, loading: loading })] }), loading && (_jsxs(Flex, { align: "center", justify: "center", padding: 4, children: [_jsx(Spinner, { muted: true }), _jsx(Text, { muted: true, size: 1, style: { marginLeft: '8px' }, children: "Fetching product data..." })] })), result && (_jsx(Card, { padding: 3, radius: 2, tone: "positive", shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Heading, { size: 1, children: result.title || 'Untitled Product' }), _jsxs(Text, { size: 1, children: [_jsx("strong", { children: "ASIN:" }), " ", result.asin] }), _jsxs(Text, { size: 1, children: [_jsx("strong", { children: "Brand:" }), " ", result.brand || 'Unknown'] }), _jsxs(Text, { size: 1, children: [_jsx("strong", { children: "Price:" }), " ", result.price || 'Not available'] }), result.salePrice && (_jsxs(Text, { size: 1, children: [_jsx("strong", { children: "Sale Price:" }), " ", result.salePrice] })), _jsxs(Text, { size: 1, children: [_jsx("strong", { children: "Currency:" }), " ", result.currency || 'USD'] }), _jsxs(Inline, { space: 2, children: [_jsx(Button, { text: "Create Document", tone: "primary", onClick: handleCreate, disabled: loading }), result.url && (_jsx(Button, { as: "a", target: "_blank", href: result.url, text: "View on Amazon", mode: "ghost" }))] })] }) }))] }), _jsx(Card, { padding: 3, radius: 2, tone: "caution", children: _jsxs(Stack, { space: 2, children: [_jsx(Text, { size: 1, weight: "semibold", children: "API Configuration Required" }), _jsxs(Text, { size: 1, children: ["This tool requires a working API endpoint at ", _jsx("code", { children: "/api/amazon/fetch" }), " in your frontend. See the plugin README for setup instructions with Next.js, Express.js, or other frameworks."] })] }) })] }) }));
}
