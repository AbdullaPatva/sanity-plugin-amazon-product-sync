import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Card, Flex, Stack, Text, TextInput } from '@sanity/ui';
import { set } from 'sanity';
export function AmazonAsinInput(props) {
    const { onChange, value, schemaType } = props;
    const [asin, setAsinState] = useState(() => (typeof value === 'string' ? value : ''));
    const disabled = useMemo(() => !asin || asin.trim().length < 5, [asin]);
    const handleFetch = useCallback(async () => {
        try {
            // Call Sanity Function route (user will deploy under /api/amazon/fetch)
            const res = await fetch('/api/amazon/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asin }),
            });
            if (!res.ok)
                throw new Error('Fetch failed');
            const data = await res.json();
            // Apply returned fields to the current document via patches in the tool/Action; here set ASIN only
            onChange(set(asin));
            // Optional: The tool will materialize full product; input only ensures the asin field is set.
            alert('Fetched product data. Open the Amazon tool to sync all fields.');
        }
        catch (err) {
            console.error(err);
            alert('Failed to fetch product. Check settings and function logs.');
        }
    }, [asin, onChange]);
    return (_jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Text, { size: 1, muted: true, children: schemaType.title || 'ASIN' }), _jsxs(Flex, { gap: 2, children: [_jsx(Box, { flex: 1, children: _jsx(TextInput, { value: asin, onChange: (e) => setAsinState(e.currentTarget.value), placeholder: "Enter Amazon ASIN" }) }), _jsx(Button, { text: "Fetch", tone: "primary", disabled: disabled, onClick: handleFetch })] }), _jsx(Text, { size: 1, muted: true, children: "This field stores the ASIN. Use the Amazon tool to populate title, images, price, etc." })] }) }));
}
