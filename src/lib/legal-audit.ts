// Utilidad para registrar eventos legales en legal_audit_log
// Usa supabaseAdmin (service role) para insertar sin restricciones de RLS desde rutas API

import { createAdminClient } from '@/lib/supabase/admin'

export type LegalEventType =
  | 'terms_accepted'
  | 'privacy_accepted'
  | 'dpa_accepted'
  | 'cookies_accepted'
  | 'cookies_rejected'
  | 'login_success'
  | 'data_export'
  | 'candidate_deleted'
  | 'arco_request_received'
  | 'account_deleted'

export async function logLegalEvent(params: {
  eventType: LegalEventType
  userId?: string
  ipAddress?: string
  userAgent?: string
  documentVersion?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from('legal_audit_log').insert({
      event_type: params.eventType,
      user_id: params.userId ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
      document_version: params.documentVersion ?? null,
      document_hash: null,
      metadata: params.metadata ?? {},
    })
  } catch (err) {
    // No bloquear el flujo principal si el log falla
    console.error('[legal-audit] Error al registrar evento:', err)
  }
}
