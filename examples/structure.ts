import type {StructureResolver} from 'sanity/structure'

// Modern Studio structure: two singletons, then all other types automatically
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

      // Amazon Product singleton (opens form directly)
      S.listItem()
        .id('amazonProduct')
        .title('Amazon Product')
        .child(
          S.document()
            .schemaType('amazon.product')
            .documentId('amazon-product')
        ),

      S.divider(),

      // Show all remaining document types except the amazon singletons
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return id && !['amazon.settings', 'amazon.product'].includes(id)
      }),
    ]) 