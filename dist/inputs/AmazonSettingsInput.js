import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Button, Card, Flex, Stack, Text } from '@sanity/ui';
export function AmazonSettingsInput(props) {
    const { value, onChange, schemaType } = props;
    const [loading, setLoading] = useState(false);
    const handleTestApiConnection = useCallback(async () => {
        if (!value?.asinNumber) {
            alert('Please enter an ASIN number first');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/amazon/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asin: value.asinNumber }),
            });
            if (res.ok) {
                alert('API connection successful! Product data fetched successfully.');
            }
            else {
                alert('API connection failed. Please check your credentials and try again.');
            }
        }
        catch (err) {
            alert('API connection failed. Please check your credentials and try again.');
        }
        finally {
            setLoading(false);
        }
    }, [value?.asinNumber]);
    const handleClearCache = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/amazon/clear-cache', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                alert('Cache cleared successfully!');
            }
            else {
                alert('Failed to clear cache. Please try again.');
            }
        }
        catch (err) {
            alert('Failed to clear cache. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }, []);
    return (_jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Text, { size: 1, muted: true, children: schemaType.title || 'Amazon Settings' }), _jsxs(Flex, { gap: 2, children: [_jsx(Button, { text: "Test API Connection", tone: "primary", disabled: !value?.asinNumber || loading, onClick: handleTestApiConnection }), _jsx(Button, { text: "Clear Cache", tone: "critical", disabled: loading, onClick: handleClearCache })] }), _jsx(Text, { size: 1, muted: true, children: "Use these buttons to test your API connection and manage cache. Enter an ASIN number first to test the connection." })] }) }));
}
