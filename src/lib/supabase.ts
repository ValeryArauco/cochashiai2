import { createBrowserClient } from '@supabase/ssr'
import { navigatorLock, processLock } from '@supabase/auth-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

const lockImpl = process.env.NODE_ENV === 'development' ? processLock : navigatorLock

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { lock: lockImpl },
      }
    )
  }
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      getClient().auth.startAutoRefresh()
    } else {
      getClient().auth.stopAutoRefresh()
    }
  })
}
