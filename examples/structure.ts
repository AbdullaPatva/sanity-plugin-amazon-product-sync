import type { StructureResolver } from 'sanity/structure'

// Modern Studio structure: Amazon Settings singleton, then Amazon Products as regular documents
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Amazon Settings singleton (opens form directly)
      S.listItem()
        .id('amazonSettings')
        .title('Amazon Settings')
        .child(
          S.document()
            .schemaType('amazon.settings')
            .documentId('amazon-settings')
        ),

      // Amazon Products as regular documents (can create multiple)
      S.listItem()
        .id('amazonProducts')
        .title('Amazon Products')
        .child(
          S.documentTypeList('amazon.product')
            .title('Amazon Products')
        ),

      S.divider(),

      // Show all remaining document types except amazon.settings singleton
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id && !['amazon.settings'].includes(id)
      }),
    ])

// Alternative structure: If you prefer to group Amazon items together
export const alternativeStructure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Amazon section
      S.listItem()
        .title('Amazon Integration')
        .child(
          S.list()
            .title('Amazon Integration')
            .items([
              S.listItem()
                .id('amazonSettings')
                .title('Amazon Settings')
                .child(
                  S.document()
                    .schemaType('amazon.settings')
                    .documentId('amazon-settings')
                ),
            ])
        ),

      S.divider(),

      // Your other content types
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id && !['amazon.settings'].includes(id)
      }),
    ]) 