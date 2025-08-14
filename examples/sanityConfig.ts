import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { amazonProductsPlugin } from 'sanity-plugin-amazon-products'
import { structure } from './structure' // Import the structure

export default defineConfig({
  name: 'default',
  title: 'Your Studio',
  
  projectId: 'your-project-id',
  dataset: 'production',
  
  plugins: [
    structureTool({
      structure: structure, // Use the imported structure
    }),
    visionTool(),
    amazonProductsPlugin(),
  ],
  
  schema: {
    types: [
      // Your existing schemas
      // The plugin automatically registers amazon.settings and amazon.product
      // ... other schemas
    ],
  },
  
  // Document configuration for singletons and actions
  document: {
    // Hide singleton types from the global "New document" menu
    newDocumentOptions: (prev: any, { creationContext }: any) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem: any) =>
            !['amazon.settings'].includes(templateItem.templateId)
        )
      }
      return prev
    },
    // Prevent duplicate/delete on singleton documents
    actions: (prev: any, { schemaType }: any) => {
      if (['amazon.settings'].includes(schemaType)) {
        return prev.filter(({ action }: any) => action !== 'duplicate' && action !== 'delete')
      }
      return prev
    },
  },
})