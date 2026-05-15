'use client'

import * as React from 'react'
import { BrandLogo } from '@/components/brand'

export interface AuthLeftPanelProps {
  headline: string
  subtitle: string
  features: { title: string; desc: string }[]
}

export function AuthLeftPanel({ headline, subtitle, features }: AuthLeftPanelProps) {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
      style={{ background: '#0B0B14' }}
    >
      {/* Radial orbs */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '-120px', left: '-120px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93,80,214,0.28) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: '-100px', right: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,191,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '40%', left: '60%',
          width: '220px', height: '220px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,126,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div className="relative">
        <BrandLogo onDark href="/" size="md" iconSize={32} />
      </div>

      {/* Center content */}
      <div className="relative space-y-8">
        <div className="space-y-4">
          <h2
            className="text-3xl xl:text-4xl font-bold leading-tight"
            style={{ color: '#ffffff' }}
            dangerouslySetInnerHTML={{
              __html: headline.replace(
                /<em>(.*?)<\/em>/g,
                '<em style="font-style:normal;background:linear-gradient(135deg,#9B90FF,#60BFFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$1</em>'
              ),
            }}
          />
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {subtitle}
          </p>
        </div>

        <ul className="space-y-4">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-3">
              <span
                className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(93,80,214,0.25)', border: '1px solid rgba(93,80,214,0.5)' }}
              >
                <span
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{ background: '#8B7EFF' }}
                />
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{f.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="relative">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Confiado por reclutadores en Argentina, México, Colombia y Chile
        </p>
      </div>
    </div>
  )
}
