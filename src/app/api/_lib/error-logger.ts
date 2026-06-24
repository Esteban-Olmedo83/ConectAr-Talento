import { createAdminClient } from '@/lib/supabase/admin'

interface LogErrorParams {
  endpoint: string
  error: unknown
  tenantId?: string
  userId?: string
  requestBody?: unknown
}

/**
 * Persists errors to the error_logs table (written via service role, no RLS restriction).
 * Never throws — logging must not break the request handler.
 */
export async function logError(params: LogErrorParams): Promise<void> {
  try {
    const message = params.error instanceof Error ? params.error.message : String(params.error)
    const stack = params.error instanceof Error ? params.error.stack : undefined

    const supabase = createAdminClient()
    await supabase.from('error_logs').insert({
      endpoint: params.endpoint,
      error_message: message,
      error_stack: stack ?? null,
      tenant_id: params.tenantId ?? null,
      user_id: params.userId ?? null,
      request_body: params.requestBody ? JSON.parse(JSON.stringify(params.requestBody)) : null,
    })
  } catch {
    // Intentionally silent — logging failure must never surface to the user
    console.error('[error-logger] Failed to persist error:', params.endpoint, params.error)
  }
}
