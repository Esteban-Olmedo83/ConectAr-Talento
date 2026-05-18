import type { UserPlan } from '@/types'

export interface PlanLimits {
  vacancies: number
  integrations: number
  candidates: number
  clients: number
}

const UNLIMITED = Infinity

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free:       { vacancies: 3,         integrations: 1,         candidates: 50,        clients: 1 },
  starter:    { vacancies: 20,        integrations: 3,         candidates: 300,       clients: 5 },
  pro:        { vacancies: UNLIMITED, integrations: UNLIMITED, candidates: UNLIMITED, clients: 20 },
  business:   { vacancies: UNLIMITED, integrations: UNLIMITED, candidates: UNLIMITED, clients: UNLIMITED },
  enterprise: { vacancies: UNLIMITED, integrations: UNLIMITED, candidates: UNLIMITED, clients: UNLIMITED },
}

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as UserPlan] ?? PLAN_LIMITS.free
}
