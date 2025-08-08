import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Button, Card, Flex, Stack, Text, useToast } from '@sanity/ui';
export function AmazonSettingsActions(props) {
    const { schemaType, document } = props;
    const { push } = useToast();
    const [loading, setLoading] = useState(false);
    const asinNumber = document?.asinNumber;
    const handleTestApiConnection = useCallback(async () => {
        if (!asinNumber) {
            push({ status: 'warning', title: 'Enter an ASIN first', description: 'Provide a test ASIN in settings.' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/amazon/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asin: asinNumber }),
            });
            if (res.ok) {
                push({ status: 'success', title: 'API connection successful' });
            }
            else {
                push({ status: 'error', title: 'API connection failed' });
            }
        }
        catch (err) {
            push({ status: 'error', title: 'API connection failed' });
        }
        finally {
            setLoading(false);
        }
    }, [asinNumber, push]);
    const handleClearCache = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/amazon/clear-cache', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                push({ status: 'success', title: 'Cache cleared' });
            }
            else {
                push({ status: 'error', title: 'Failed to clear cache' });
            }
        }
        catch (err) {
            push({ status: 'error', title: 'Failed to clear cache' });
        }
        finally {
            setLoading(false);
        }
    }, [push]);
    return (_jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Text, { size: 1, muted: true, children: schemaType.title || 'Actions' }), _jsxs(Flex, { gap: 2, children: [_jsx(Button, { text: "Test API Connection", tone: "primary", disabled: !asinNumber || loading, onClick: handleTestApiConnection }), _jsx(Button, { text: "Clear Cache", tone: "critical", disabled: loading, onClick: handleClearCache })] }), _jsx(Text, { size: 1, muted: true, children: "Use these buttons to test your API credentials and manage cache." })] }) }));
}
