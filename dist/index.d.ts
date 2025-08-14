import {Plugin as Plugin_2} from 'sanity'

/**
 * Configuration options for the Amazon Products plugin
 * @public
 */
export declare interface AmazonPluginOptions {
  toolName?: string
}

/**
 * Sanity Studio plugin for fetching and managing Amazon products
 * @public
 */
declare const amazonProductsPlugin: Plugin_2<void | AmazonPluginOptions>
export {amazonProductsPlugin}
export default amazonProductsPlugin

export {}
