import { createAdminClient } from '@/lib/supabase/admin'

export interface LogAiUsageParams {
  userId: string
  tenantId?: string | null
  route: 'analyze-cv' | 'generate-jd' | 'generate-message' | 'generate-report'
  model?: string
  promptTokens?: number | null
  completionTokens?: number | null
  latencyMs?: number | null
  success: boolean
  errorCode?: string | null
  plan: string
}

export function logAiUsage(params: LogAiUsageParams): void {
  const supabase = createAdminClient()
  supabase
    .from('ai_usage_logs')
    .insert({
      user_id: params.userId,
      tenant_id: params.tenantId ?? null,
      route: params.route,
      model: params.model ?? 'llama-3.3-70b-versatile',
      prompt_tokens: params.promptTokens ?? null,
      completion_tokens: params.completionTokens ?? null,
      latency_ms: params.latencyMs ?? null,
      success: params.success,
      error_code: params.errorCode ?? null,
      plan: params.plan,
    })
    .then(({ error }) => {
      if (error) console.error('[ai-usage-log]', error.message)
    })
}
