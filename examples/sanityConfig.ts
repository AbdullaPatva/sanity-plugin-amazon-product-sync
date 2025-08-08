import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {amazonProductsPlugin} from 'sanity-plugin-amazon-products'

export default defineConfig({
  name: 'default',
  title: 'Your Studio',
  
  projectId: 'your-project-id',
  dataset: 'production',
  
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Amazon Settings as a singleton
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
            
            // Divider
            S.divider(),
            
            // Your other content types
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