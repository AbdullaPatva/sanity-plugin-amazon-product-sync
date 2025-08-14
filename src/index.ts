import {definePlugin} from 'sanity'
import {amazonSettingsSchema} from './schemas/amazonSettings'
import {amazonProductSchema} from './schemas/amazonProduct'
import {amazonAsinType} from './schemas/amazonAsin'
import {amazonProductBlock} from './schemas/amazonProductBlock'
import {amazonFetchButtonSchema} from './schemas/amazonFetchButton'
import {AmazonAsinInput} from './inputs/AmazonAsinInput'


/**
 * Configuration options for the Amazon Products plugin
 * @public
 */
export interface AmazonPluginOptions {
  // Optional: override tool name or route
  toolName?: string
}

/**
 * Sanity Studio plugin for fetching and managing Amazon products
 * @public
 */
export const amazonProductsPlugin = definePlugin<AmazonPluginOptions | void>((opts: AmazonPluginOptions | void) => {
  const toolName = opts?.toolName ?? 'amazon'
  return {
    name: 'sanity-plugin-amazon-products',
    schema: {
      types: [amazonSettingsSchema, amazonProductSchema, amazonAsinType, amazonProductBlock, amazonFetchButtonSchema],
    },
    form: {
      renderInput(props: any, next: any) {
        if (props.schemaType.name === 'amazon.asin') {
          return AmazonAsinInput(props)
        }
        // amazonFetchButton is handled by components.input in its schema
        return next(props)
      },
    },
  }
})

export default amazonProductsPlugin

