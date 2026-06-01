import type { UserPlan } from '@/types'

export interface PlanFeatures {
  reports: boolean
  customTemplates: boolean
  useTemplates: boolean
  aiTemplates: boolean
  customJobProfiles: boolean
  customRubros: boolean
}

const PLAN_FEATURES: Record<UserPlan, PlanFeatures> = {
  free: {
    reports: false,
    customTemplates: false,
    useTemplates: false,
    aiTemplates: false,
    customJobProfiles: false,
    customRubros: false,
  },
  starter: {
    reports: true,
    customTemplates: true,
    useTemplates: true,
    aiTemplates: false,
    customJobProfiles: true,
    customRubros: true,
  },
  pro: {
    reports: true,
    customTemplates: true,
    useTemplates: true,
    aiTemplates: true,
    customJobProfiles: true,
    customRubros: true,
  },
  business: {
    reports: true,
    customTemplates: true,
    useTemplates: true,
    aiTemplates: true,
    customJobProfiles: true,
    customRubros: true,
  },
  enterprise: {
    reports: true,
    customTemplates: true,
    useTemplates: true,
    aiTemplates: true,
    customJobProfiles: true,
    customRubros: true,
  },
}

export function getPlanFeatures(plan: string): PlanFeatures {
  return PLAN_FEATURES[plan as UserPlan] ?? PLAN_FEATURES.free
}

export const UPGRADE_MESSAGES: Record<keyof PlanFeatures, { title: string; description: string; requiredPlan: string }> = {
  reports: {
    title: 'Informes y Analítica Avanzada',
    description: 'Visualizá el rendimiento de tu reclutamiento con gráficos interactivos, KPIs en tiempo real y reportes exportables en PDF.',
    requiredPlan: 'Starter',
  },
  customTemplates: {
    title: 'Plantillas Personalizadas',
    description: 'Creá y editá tus propias plantillas de comunicación para LinkedIn, Email y WhatsApp adaptadas a tu marca.',
    requiredPlan: 'Starter',
  },
  useTemplates: {
    title: 'Enviar Mensajes con Plantillas',
    description: 'Usá las plantillas para enviar mensajes personalizados a candidatos directamente desde el sistema.',
    requiredPlan: 'Starter',
  },
  aiTemplates: {
    title: 'Mejora de Plantillas con IA',
    description: 'Dejá que la inteligencia artificial optimice tus mensajes para aumentar la tasa de respuesta de los candidatos.',
    requiredPlan: 'Pro',
  },
  customJobProfiles: {
    title: 'Perfiles de Puesto Personalizados',
    description: 'Creá perfiles de puesto propios con habilidades técnicas, blandas y certificaciones específicas de tu industria.',
    requiredPlan: 'Starter',
  },
  customRubros: {
    title: 'Rubros Personalizados',
    description: 'Organizá tus perfiles de puesto en rubros propios adaptados a los sectores en que trabajás.',
    requiredPlan: 'Starter',
  },
}
