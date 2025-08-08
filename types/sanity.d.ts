// Minimal ambient types to satisfy local typecheck when Sanity isn't installed in this workspace
declare module 'sanity' {
  export type StringInputProps = any
  export type DocumentActionComponent = any
  export type WorkspaceOptions = any
  export type FormInputProps = any
  export type FormRenderInputCallback = any
  export type DocumentActionsContext = any
  
  export function definePlugin<T>(impl: any): any
  export function defineType(config: any): any
  export function defineField(config: any): any
  export function defineArrayMember(config: any): any
  export function set<T>(val: T): any
  export function useClient(opts?: any): any
  export function useToast(): {toast: {push: (toast: any) => void}}
  export function useWorkspace(): any
}

