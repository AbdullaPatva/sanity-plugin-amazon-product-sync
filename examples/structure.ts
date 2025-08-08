import {defineStructure} from 'sanity'

// Modern approach for singleton-like behavior
// This should be added to your sanity.config.ts structure configuration

export const structure = defineStructure({
  name: 'amazon-settings-structure',
  title: 'Amazon Settings Structure',
  structure: [
    {
      name: 'amazon-settings',
      title: 'Amazon Settings',
      type: 'document',
      documentId: 'amazon-settings',
      schemaType: 'amazon.settings',
    },
    {
      name: 'amazon-products',
      title: 'Amazon Products',
      type: 'list',
      schemaType: 'amazon.product',
    },
  ],
})

// Alternative approach using structure builder with structureTool
import {defineStructure, S} from 'sanity'

export const structureBuilder = defineStructure({
  name: 'amazon-structure',
  title: 'Amazon Structure',
  structure: S.list()
    .title('Amazon')
    .items([
      S.listItem()
        .title('Settings')
        .child(
          S.document()
            .schemaType('amazon.settings')
            .documentId('amazon-settings')
        ),
      S.listItem()
        .title('Products')
        .child(
          S.documentList()
            .title('Amazon Products')
            .filter('_type == "amazon.product"')
        ),
    ]),
})

// Complete sanity.config.ts example
import {structureTool} from 'sanity'

export const sanityConfigExample = {
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Amazon Settings as a singleton (direct form access)
            S.listItem()
              .title('Amazon Settings')
              .child(
                S.document()
                  .schemaType('amazon.settings')
                  .documentId('amazon-settings')
              ),
            
            // Amazon Products as a list
            S.listItem()
              .title('Amazon Products')
              .child(
                S.documentTypeList('amazon.product')
                  .title('Amazon Products')
              ),
            
            // Your other content types
            S.divider(),
            S.listItem()
              .title('Posts')
              .child(S.documentTypeList('post')),
          ]),
    }),
  ],
} 