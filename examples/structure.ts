// Example structure.ts for setting up Amazon settings as a singleton
// Add this to your Sanity Studio project

export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Amazon Settings singleton
      S.listItem()
        .title('Amazon Settings')
        .child(
          S.document()
            .schemaType('amazon.settings')
            .documentId('amazon-settings')
        ),
      
      // Your existing content types
      S.divider(),
      S.listItem()
        .title('Amazon Products')
        .child(
          S.documentTypeList('amazon.product')
            .title('Amazon Products')
        ),
      
      // Add other document types as needed
      // S.listItem()
      //   .title('Posts')
      //   .child(S.documentTypeList('post')),
    ]) 