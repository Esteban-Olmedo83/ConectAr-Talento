'use client'

import * as React from 'react'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { UpgradeModal } from './upgrade-modal'
import type { PlanFeatures } from '@/lib/plan-features'
import { UPGRADE_MESSAGES } from '@/lib/plan-features'

interface FeatureGateProps {
  feature: keyof PlanFeatures
  hasAccess: boolean
  children: React.ReactNode
  /** blur: shows children blurred with overlay. block: replaces children with locked state. */
  variant?: 'blur' | 'block'
}

export function FeatureGate({ feature, hasAccess, children, variant = 'blur' }: FeatureGateProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const info = UPGRADE_MESSAGES[feature]

  if (hasAccess) return <>{children}</>

  if (variant === 'block') {
    return (
      <>
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl p-8 text-center transition-all hover:border-[#5D50D6]/50"
          style={{ border: '1.5px dashed rgba(93,80,214,0.3)', background: 'rgba(93,80,214,0.04)' }}
          onClick={() => setModalOpen(true)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(93,80,214,0.15)' }}>
            <Lock size={20} className="text-[#8B7EFF]" />
          </div>
          <div>
            <p className="font-semibold text-white">{info.title}</p>
            <p className="mt-1 text-sm text-gray-500">Disponible en el plan {info.requiredPlan}</p>
          </div>
          <button
            className="mt-1 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)' }}
          >
            <Sparkles size={13} />
            Desbloquear
            <ArrowRight size={13} />
          </button>
        </div>
        <UpgradeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          featureTitle={info.title}
          featureDescription={info.description}
          requiredPlan={info.requiredPlan}
        />
      </>
    )
  }

  // blur variant
  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none" style={{ filter: 'blur(4px)', opacity: 0.4 }}>
          {children}
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl px-8 py-6 text-center shadow-2xl backdrop-blur-sm transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(11,11,20,0.85)', border: '1px solid rgba(93,80,214,0.4)' }}
            onClick={() => setModalOpen(true)}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)' }}>
              <Lock size={24} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white">{info.title}</p>
              <p className="mt-1 text-sm text-gray-400">Disponible desde el plan {info.requiredPlan}</p>
            </div>
            <button
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)' }}
            >
              <Sparkles size={14} />
              Ver planes y precios
            </button>
          </div>
        </div>
      </div>
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureTitle={info.title}
        featureDescription={info.description}
        requiredPlan={info.requiredPlan}
      />
    </>
  )
}

/** Inline lock badge for buttons — shows a lock icon and opens upgrade modal on click */
interface LockedButtonProps {
  feature: keyof PlanFeatures
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function LockedButton({ feature, children, className = '', style }: LockedButtonProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const info = UPGRADE_MESSAGES[feature]

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`relative flex items-center gap-2 opacity-60 ${className}`}
        style={style}
        title={`Disponible en plan ${info.requiredPlan}`}
      >
        {children}
        <Lock size={12} className="text-[#8B7EFF]" />
      </button>
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureTitle={info.title}
        featureDescription={info.description}
        requiredPlan={info.requiredPlan}
      />
    </>
  )
}
