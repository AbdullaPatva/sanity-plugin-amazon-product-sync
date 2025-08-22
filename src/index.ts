import {definePlugin} from 'sanity'
import {amazonSettingsSchema} from './schemas/amazonSettings'
import {amazonProductSchema} from './schemas/amazonProduct'
import {amazonProductBlock} from './schemas/amazonProductBlock'
import {amazonFetchButtonSchema} from './schemas/amazonFetchButton'

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
    name: 'sanity-plugin-amazon-product-sync',
    schema: {
      types: [amazonSettingsSchema, amazonProductSchema, amazonProductBlock, amazonFetchButtonSchema],
    },
  }
})

export default amazonProductsPlugin

