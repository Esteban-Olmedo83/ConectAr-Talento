-- Fase 1: Agregar campos para ISO 30414 (time-to-fill, quality-of-hire, early turnover, diversity)

-- 1. Tabla candidates: agregar hire_date, termination_date, diversity fields
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS hire_date timestamptz DEFAULT NULL;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS termination_date timestamptz DEFAULT NULL;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gender_optional text DEFAULT NULL; -- 'Masculino', 'Femenino', 'Otro', NULL para no responder
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS age_range_optional text DEFAULT NULL; -- '18-25', '26-35', '36-45', '46-55', '56+', NULL para no responder

-- 2. Tabla vacancies: agregar costos de reclutamiento
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS posting_cost numeric DEFAULT NULL; -- Costo de publicar la vacante (USD)
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS internal_hours numeric DEFAULT NULL; -- Horas internas invertidas en reclutamiento

-- 3. Agregar índices para performance
CREATE INDEX IF NOT EXISTS idx_candidates_hire_date ON candidates(hire_date) WHERE hire_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_termination_date ON candidates(termination_date) WHERE termination_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_gender_optional ON candidates(gender_optional) WHERE gender_optional IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_tenant_hire_date ON candidates(tenant_id, hire_date) WHERE hire_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vacancies_posting_cost ON vacancies(posting_cost) WHERE posting_cost IS NOT NULL;

-- 4. Comentarios en las columnas para documentación
COMMENT ON COLUMN candidates.hire_date IS 'Fecha de contratación del candidato. Necesario para calcular quality-of-hire y early turnover (ISO 30414)';
COMMENT ON COLUMN candidates.termination_date IS 'Fecha de término del empleado. Necesario para calcular early turnover y ROI de reclutamiento';
COMMENT ON COLUMN candidates.gender_optional IS 'Género del candidato (opcional). Necesario para análisis de diversidad (ISO 30414 D&I)';
COMMENT ON COLUMN candidates.age_range_optional IS 'Rango de edad del candidato (opcional). Necesario para análisis de diversidad (ISO 30414 D&I)';
COMMENT ON COLUMN vacancies.posting_cost IS 'Costo de publicar la vacante (en USD). Usado para calcular cost-per-hire y ROI de reclutamiento';
COMMENT ON COLUMN vacancies.internal_hours IS 'Horas de recursos internos dedicadas al reclutamiento. Usado para calcular cost-per-hire (labor cost)';
