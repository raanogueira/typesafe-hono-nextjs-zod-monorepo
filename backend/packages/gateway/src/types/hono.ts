// Extend Hono Context to include our custom properties
import type { UserContext } from '#auth/types'

declare module 'hono' {
  interface ContextVariableMap {
    user: UserContext
    sessionProvider: string
  }
}
