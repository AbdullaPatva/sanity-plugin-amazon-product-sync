import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button, Card, Flex, Stack, Text, useToast } from '@sanity/ui';
import { useClient } from 'sanity';
export function AmazonSettingsActions(props) {
    const { schemaType, document } = props;
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const client = useClient({ apiVersion: '2025-01-01' });
    // State to store the fetched document data
    const [documentData, setDocumentData] = useState({});
    const [isLoadingData, setIsLoadingData] = useState(true);
    // Fetch the current document data using the Sanity client
    useEffect(() => {
        const fetchDocumentData = async () => {
            try {
                // Get the current document ID from the URL
                const currentPath = window.location.pathname;
                // Extract document ID from URL like /desk/amazon.settings;amazon-settings
                const pathParts = currentPath.split(';');
                let documentId = 'amazon-settings'; // default singleton ID
                if (pathParts.length > 1) {
                    documentId = pathParts[1];
                }
                // Fetch the document data
                const query = `*[_type == "amazon.settings" && _id == $id][0]{
          region,
          accessKey,
          secretKey,
          partnerTag,
          asinNumber,
          cacheHours
        }`;
                const data = await client.fetch(query, { id: documentId });
                if (data) {
                    setDocumentData(data);
                }
            }
            catch {
                // Silently handle errors
            }
            finally {
                setIsLoadingData(false);
            }
        };
        fetchDocumentData();
    }, [client]);
    const asinNumber = documentData?.asinNumber;
    const hasCredentials = documentData?.accessKey && documentData?.secretKey && documentData?.partnerTag;
    return (_jsx(Card, { padding: 3, tone: "primary", radius: 2, shadow: 1, children: _jsxs(Stack, { space: 3, children: [_jsx(Text, { size: 1, muted: true, children: schemaType.title || 'Actions' }), _jsxs(Flex, { gap: 2, children: [_jsx(Button, { text: "Test API Connection", tone: "positive", disabled: isLoadingData || loading, onClick: async () => {
                                if (!documentData?.accessKey || !documentData?.secretKey || !documentData?.partnerTag || !documentData?.asinNumber) {
                                    toast.push({
                                        status: 'warning',
                                        title: 'Missing Credentials',
                                        description: 'Please fill in all required fields first'
                                    });
                                    return;
                                }
                                setLoading(true);
                                try {
                                    const response = await fetch('http://localhost:3001/api/amazon/test-connection', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
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
                                    if (result.success) {
                                        toast.push({
                                            status: 'success',
                                            title: 'Amazon API Test Successful!',
                                            description: `Successfully fetched: ${result.testProduct.title}`
                                        });
                                    }
                                    else {
                                        throw new Error(result.error || 'API test failed');
                                    }
                                }
                                catch (error) {
                                    toast.push({
                                        status: 'error',
                                        title: 'API Test Failed',
                                        description: error?.message || 'Unknown error occurred'
                                    });
                                }
                                finally {
                                    setLoading(false);
                                }
                            } }), _jsx(Button, { text: "Debug Document", tone: "caution", disabled: isLoadingData, onClick: () => {
                                console.log('=== DEBUG DOCUMENT STATE ===');
                                console.log('Document:', document);
                                console.log('DocumentData:', documentData);
                                console.log('Has Credentials:', hasCredentials);
                                console.log('ASIN Number:', asinNumber);
                                console.log('Is Loading Data:', isLoadingData);
                                console.log('Current URL:', window.location.pathname);
                                console.log('========================');
                                toast.push({
                                    status: 'info',
                                    title: 'Document State Logged',
                                    description: 'Check browser console for detailed document information'
                                });
                            } })] }), _jsx(Text, { size: 1, muted: true, children: isLoadingData
                        ? 'Loading document data...'
                        : !hasCredentials
                            ? 'Fill in API credentials first, then provide a test ASIN to test the connection.'
                            : !asinNumber
                                ? 'Provide a test ASIN number to test the API connection.'
                                : 'Use these buttons to test your API credentials and debug document state.' }), isLoadingData && (_jsx(Text, { size: 1, muted: true, children: "\u23F3 Loading document data from Sanity..." })), !isLoadingData && hasCredentials && asinNumber && (_jsxs(Text, { size: 1, muted: true, children: ["\u2705 Ready to test API connection with ", documentData.region || 'com', " region"] }))] }) }));
}
