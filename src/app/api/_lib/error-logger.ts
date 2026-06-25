import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'

interface LogErrorParams {
  endpoint: string
  error: unknown
  tenantId?: string
  userId?: string
  requestBody?: unknown
}

/**
 * Sends errors to Sentry and persists them to error_logs table.
 * Never throws — logging must not break the request handler.
 */
export async function logError(params: LogErrorParams): Promise<void> {
  const message = params.error instanceof Error ? params.error.message : String(params.error)
  const stack = params.error instanceof Error ? params.error.stack : undefined

  // Report to Sentry
  Sentry.withScope((scope) => {
    scope.setTag('endpoint', params.endpoint)
    if (params.tenantId) scope.setTag('tenant_id', params.tenantId)
    if (params.userId) scope.setUser({ id: params.userId })
    Sentry.captureException(params.error instanceof Error ? params.error : new Error(message))
  })

  // Persist to Supabase for in-app visibility
  try {
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
    console.error('[error-logger] Failed to persist error to DB:', params.endpoint)
  }
}
