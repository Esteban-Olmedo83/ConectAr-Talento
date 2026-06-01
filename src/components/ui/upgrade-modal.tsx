'use client'

import * as React from 'react'
import { X, Sparkles, CheckCircle2, ArrowRight, Zap } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureTitle: string
  featureDescription: string
  requiredPlan: string
}

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  Starter: [
    'Informes y analítica de reclutamiento',
    'Plantillas personalizadas (LinkedIn, Email, WhatsApp)',
    'Perfiles de puesto propios',
    'Hasta 20 vacantes activas',
    'Hasta 300 candidatos',
  ],
  Pro: [
    'Todo lo de Starter, más...',
    'IA para mejorar tus mensajes',
    'Vacantes y candidatos ilimitados',
    'Integraciones ilimitadas',
    'Informes avanzados con exportación PDF',
  ],
}

export function UpgradeModal({ isOpen, onClose, featureTitle, featureDescription, requiredPlan }: UpgradeModalProps) {
  if (!isOpen) return null

  const highlights = PLAN_HIGHLIGHTS[requiredPlan] ?? PLAN_HIGHLIGHTS['Starter']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#5D50D6]/30 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #13132A 0%, #0B0B14 100%)' }}
      >
        {/* Header gradient bar */}
        <div className="h-1 w-full rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #5D50D6, #8B7EFF)' }} />

        <div className="p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>

          {/* Icon + badge */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)' }}>
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: '#5D50D6/20', color: '#8B7EFF', border: '1px solid #5D50D6' }}>
                Plan {requiredPlan} requerido
              </span>
              <h2 className="mt-1 text-lg font-bold text-white">{featureTitle}</h2>
            </div>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-gray-400">{featureDescription}</p>

          {/* Highlights */}
          <div className="mb-6 rounded-xl p-4" style={{ background: 'rgba(93, 80, 214, 0.08)', border: '1px solid rgba(93, 80, 214, 0.2)' }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8B7EFF]">
              Incluido en {requiredPlan}
            </p>
            <ul className="space-y-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#5D50D6]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2">
            <a
              href="/configuracion?tab=plan"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)' }}
            >
              <Sparkles size={15} />
              Actualizar a {requiredPlan}
              <ArrowRight size={15} />
            </a>
            <button
              onClick={onClose}
              className="w-full rounded-xl py-2.5 text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Seguir con el plan gratuito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
