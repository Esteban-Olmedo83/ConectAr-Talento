import type { UserPlan } from '@/types'

export interface PlanLimits {
  vacancies: number   // max active vacancies
  integrations: number // max connected integrations (total across all channels)
  candidates: number   // max total candidates
}

const UNLIMITED = Infinity

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free:       { vacancies: 3,         integrations: 1,         candidates: 50 },
  starter:    { vacancies: 10,        integrations: 3,         candidates: 200 },
  pro:        { vacancies: UNLIMITED, integrations: UNLIMITED, candidates: UNLIMITED },
  business:   { vacancies: UNLIMITED, integrations: UNLIMITED, candidates: UNLIMITED },
  enterprise: { vacancies: UNLIMITED, integrations: UNLIMITED, candidates: UNLIMITED },
}

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as UserPlan] ?? PLAN_LIMITS.free
}
