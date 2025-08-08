import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {amazonProductsPlugin} from 'sanity-plugin-amazon-products'

export default defineConfig({
  name: 'default',
  title: 'Your Studio',
  
  projectId: 'your-project-id',
  dataset: 'production',
  
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
              
            S.listItem()
              .title('Pages')
              .child(S.documentTypeList('page')),
          ]),
    }),
    amazonProductsPlugin(),
  ],
  
  schema: {
    types: [
      // Your existing schemas
      // ... other schemas
    ],
  },
}) 