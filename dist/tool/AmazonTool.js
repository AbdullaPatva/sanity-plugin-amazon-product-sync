import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Box, Button, Card, Code, Flex, Grid, Heading, Inline, Label, Radio, Spinner, Stack, Text, TextInput, TextArea } from '@sanity/ui';
import { useClient, useToast } from 'sanity';
export function AmazonTool() {
    const client = useClient({ apiVersion: '2025-05-01' });
    const { toast } = useToast();
    const [asin, setAsin] = useState('');
    const [bulkAsins, setBulkAsins] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('single');
    const [importSettings, setImportSettings] = useState({
        postType: 'post',
        postStatus: 'publish'
    });
    const handleFetch = useCallback(async () => {
        if (!asin)
            return;
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/amazon/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asin }),
            });
            if (!res.ok)
                throw new Error('Fetch failed');
            const data = (await res.json());
            setResult({ ...data, asin });
        }
        catch (e) {
            toast.push({ status: 'error', title: 'Failed to fetch', description: e?.message });
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
                title: result.title,
                url: result.url,
                brand: result.brand,
                features: [],
                price: result.price,
                salePrice: result.salePrice,
                currency: result.currency,
                listPrice: result.listPrice,
                images: result.images,
                lastSyncedAt: new Date().toISOString(),
            };
            const created = await client.create(doc);
            toast.push({ status: 'success', title: 'Created product', description: created._id });
        }
        catch (e) {
            toast.push({ status: 'error', title: 'Create failed', description: e?.message });
        }
        finally {
            setLoading(false);
        }
    }, [client, result, toast]);
    const handleBulkImport = useCallback(async () => {
        if (!bulkAsins.trim())
            return;
        setLoading(true);
        try {
            const asinArray = bulkAsins.split(',').map(s => s.trim()).filter(s => s.length > 0);
            if (asinArray.length > 10) {
                toast.push({ status: 'error', title: 'Too many ASINs', description: 'Maximum 10 ASINs allowed' });
                return;
            }
            // Call bulk import endpoint
            const res = await fetch('/api/amazon/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asins: asinArray,
                    postType: importSettings.postType,
                    postStatus: importSettings.postStatus
                }),
            });
            if (!res.ok)
                throw new Error('Bulk import failed');
            const data = await res.json();
            toast.push({ status: 'success', title: 'Bulk import completed', description: data.message });
            setBulkAsins('');
        }
        catch (e) {
            toast.push({ status: 'error', title: 'Bulk import failed', description: e?.message });
        }
        finally {
            setLoading(false);
        }
    }, [bulkAsins, importSettings, toast]);
    const handleClearCache = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/amazon/clear-cache', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok)
                throw new Error('Cache clear failed');
            toast.push({ status: 'success', title: 'Cache cleared', description: 'All cached data has been removed' });
        }
        catch (e) {
            toast.push({ status: 'error', title: 'Cache clear failed', description: e?.message });
        }
        finally {
            setLoading(false);
        }
    }, [toast]);
    return (_jsx(Card, { padding: 4, children: _jsxs(Stack, { space: 4, children: [_jsx(Heading, { size: 2, children: "Amazon Products" }), _jsx(Text, { muted: true, children: "Fetch and import Amazon products by ASIN. Supports single product creation and bulk import (up to 10 products)." }), _jsxs(Flex, { gap: 2, children: [_jsx(Button, { mode: activeTab === 'single' ? 'default' : 'ghost', onClick: () => setActiveTab('single'), text: "Single Product" }), _jsx(Button, { mode: activeTab === 'bulk' ? 'default' : 'ghost', onClick: () => setActiveTab('bulk'), text: "Bulk Import" })] }), activeTab === 'single' ? (
                // Single Product Tab
                _jsxs(Stack, { space: 3, children: [_jsxs(Flex, { gap: 2, children: [_jsx(Box, { flex: 1, children: _jsx(TextInput, { placeholder: "ASIN", value: asin, onChange: (e) => setAsin(e.currentTarget.value) }) }), _jsx(Button, { text: "Fetch", tone: "primary", disabled: !asin || loading, onClick: handleFetch })] }), loading && (_jsx(Flex, { align: "center", justify: "center", padding: 4, children: _jsx(Spinner, { muted: true }) })), result && (_jsx(Card, { padding: 3, radius: 2, tone: "transparent", shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Heading, { size: 1, children: result.title || '—' }), _jsxs(Text, { size: 1, children: ["ASIN: ", result.asin] }), _jsxs(Text, { size: 1, children: ["Brand: ", result.brand || '—'] }), _jsxs(Text, { size: 1, children: ["Price: ", result.price || '—'] }), _jsxs(Text, { size: 1, children: ["Sale Price: ", result.salePrice || '—'] }), _jsxs(Text, { size: 1, children: ["Currency: ", result.currency || '—'] }), _jsxs(Inline, { space: 2, children: [_jsx(Button, { text: "Create Document", tone: "primary", onClick: handleCreate }), result.url && (_jsx(Button, { as: "a", target: "_blank", href: result.url, text: "View on Amazon" }))] })] }) }))] })) : (
                // Bulk Import Tab
                _jsxs(Stack, { space: 3, children: [_jsx(Text, { size: 1, muted: true, children: "Enter up to 10 ASIN numbers separated by commas" }), _jsx(TextArea, { placeholder: "B08N5WRWNW, B08N5WRWNW, B08N5WRWNW", value: bulkAsins, onChange: (e) => setBulkAsins(e.currentTarget.value), rows: 4 }), _jsxs(Grid, { columns: 2, gap: 3, children: [_jsxs(Stack, { space: 2, children: [_jsx(Label, { children: "Post Type" }), _jsxs(Stack, { space: 2, children: [_jsx(Radio, { checked: importSettings.postType === 'post', onChange: () => setImportSettings(prev => ({ ...prev, postType: 'post' })), name: "postType", value: "post" }), _jsx(Radio, { checked: importSettings.postType === 'page', onChange: () => setImportSettings(prev => ({ ...prev, postType: 'page' })), name: "postType", value: "page" })] })] }), _jsxs(Stack, { space: 2, children: [_jsx(Label, { children: "Post Status" }), _jsxs(Stack, { space: 2, children: [_jsx(Radio, { checked: importSettings.postStatus === 'publish', onChange: () => setImportSettings(prev => ({ ...prev, postStatus: 'publish' })), name: "postStatus", value: "publish" }), _jsx(Radio, { checked: importSettings.postStatus === 'draft', onChange: () => setImportSettings(prev => ({ ...prev, postStatus: 'draft' })), name: "postStatus", value: "draft" }), _jsx(Radio, { checked: importSettings.postStatus === 'private', onChange: () => setImportSettings(prev => ({ ...prev, postStatus: 'private' })), name: "postStatus", value: "private" })] })] })] }), _jsx(Button, { text: "Import Products", tone: "primary", disabled: !bulkAsins.trim() || loading, onClick: handleBulkImport })] })), _jsx(Card, { padding: 3, radius: 2, tone: "caution", children: _jsxs(Stack, { space: 2, children: [_jsx(Text, { size: 1, weight: "semibold", children: "Cache Management" }), _jsx(Text, { size: 1, children: "Products are cached for 24 hours to reduce API calls. Clear cache to force fresh data." }), _jsx(Button, { text: "Clear Cache", tone: "critical", onClick: handleClearCache, disabled: loading })] }) }), _jsx(Card, { padding: 3, radius: 2, tone: "caution", children: _jsxs(Text, { size: 1, children: ["Configure your Function at ", _jsx(Code, { children: "/api/amazon/fetch" }), ". It must use your PA-API keys and return basic product info. See plugin README for a starter Function."] }) })] }) }));
}
