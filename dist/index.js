import { definePlugin } from 'sanity';
import { amazonSettingsSchema } from './schemas/amazonSettings';
import { amazonProductSchema } from './schemas/amazonProduct';
import { amazonAsinType } from './schemas/amazonAsin';
import { amazonProductBlock } from './schemas/amazonProductBlock';
import { amazonFetchButtonSchema } from './schemas/amazonFetchButton';
import { AmazonTool } from './tool/AmazonTool';
import { AmazonAsinInput } from './inputs/AmazonAsinInput';
export const amazonProductsPlugin = definePlugin((opts) => {
    const toolName = opts?.toolName ?? 'amazon';
    return {
        name: 'sanity-plugin-amazon-products',
        schema: {
            types: [amazonSettingsSchema, amazonProductSchema, amazonAsinType, amazonProductBlock, amazonFetchButtonSchema],
        },
        form: {
            renderInput(props, next) {
                if (props.schemaType.name === 'amazon.asin') {
                    return AmazonAsinInput(props);
                }
                // amazonFetchButton is handled by components.input in its schema
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
        ],
    };
});
export default amazonProductsPlugin;
