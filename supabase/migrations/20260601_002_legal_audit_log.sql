-- Tabla de auditoría legal para compliance (ARCO, GDPR-like, Ley 25.326 Argentina)
-- TEXTO PENDIENTE DE REVISIÓN LEGAL

CREATE TABLE IF NOT EXISTS public.legal_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  document_version TEXT,
  document_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_legal_audit_user_id ON public.legal_audit_log(user_id);
CREATE INDEX idx_legal_audit_event_type ON public.legal_audit_log(event_type);
CREATE INDEX idx_legal_audit_created_at ON public.legal_audit_log(created_at DESC);

-- RLS: solo el admin puede leer todos, usuarios solo sus propios registros
ALTER TABLE public.legal_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit log" ON public.legal_audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert" ON public.legal_audit_log
  FOR INSERT WITH CHECK (true);
