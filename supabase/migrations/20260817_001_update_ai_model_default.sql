-- Actualiza el valor DEFAULT de la columna model en ai_usage_logs
-- tras la migración de llama-3.3-70b-versatile (decomisionado 16/08/2026)
-- al modelo de reemplazo oficial de Groq: qwen/qwen3.6-27b
alter table public.ai_usage_logs
  alter column model set default 'qwen/qwen3.6-27b';
