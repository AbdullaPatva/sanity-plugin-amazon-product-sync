import { definePlugin } from 'sanity';
import { amazonSettingsSchema } from './schemas/amazonSettings';
import { amazonProductSchema } from './schemas/amazonProduct';
import { amazonAsinType } from './schemas/amazonAsin';
import { amazonProductBlock } from './schemas/amazonProductBlock';
import { AmazonTool } from './tool/AmazonTool';
import { AmazonAsinInput } from './inputs/AmazonAsinInput';
import { AmazonSettingsInput } from './inputs/AmazonSettingsInput';
import { HelpDocumentation } from './components/HelpDocumentation';
export const amazonProductsPlugin = definePlugin((opts) => {
    const toolName = opts?.toolName ?? 'amazon';
    return {
        name: 'sanity-plugin-amazon-products',
        schema: {
            types: [amazonSettingsSchema, amazonProductSchema, amazonAsinType, amazonProductBlock],
        },
        form: {
            renderInput(props, next) {
                if (props.schemaType.name === 'amazon.asin') {
                    return AmazonAsinInput(props);
                }
                if (props.schemaType.name === 'amazon.settings') {
                    return AmazonSettingsInput(props);
                }
                return next(props);
            },
        },
        tools: [
            {
                name: toolName,
                title: 'Amazon Products',
                component: AmazonTool,
                icon: undefined,
            },
            {
                name: `${toolName}-help`,
                title: 'Amazon Products Help',
                component: HelpDocumentation,
                icon: undefined,
            },
        ],
        document: {
            actions: (prev) => {
                const SyncFromAmazonAction = (props) => {
                    const isAmazonDoc = props.type === 'amazon.product';
                    if (!isAmazonDoc)
                        return null;
                    return {
                        label: 'Sync from Amazon',
                        onHandle: () => {
                            // The actual mutation is handled by the input/tool via Functions.
                            // Here we only hint users to use the panel if needed.
                            // We could also open the tool route using window.location if desired.
                            window?.alert('Use the Amazon panel or ASIN input to refresh product data.');
                            props.onComplete();
                        },
                    };
                };
                return [SyncFromAmazonAction, ...prev];
            },
        },
    };
});
export default amazonProductsPlugin;
