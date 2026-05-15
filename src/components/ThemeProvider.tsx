'use client'

import * as React from 'react'

const PALETTE_CLASSES = [
  'palette-violet',
  'palette-sky',
  'palette-emerald',
  'palette-rose',
  'palette-amber',
  'palette-fuchsia',
  'palette-cyan',
  'palette-slate',
]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    try {
      const theme = localStorage.getItem('ct_theme') || 'dark'
      const palette = localStorage.getItem('ct_palette') || ''
      const html = document.documentElement

      // Apply theme
      html.classList.remove('theme-light', 'theme-auto')
      if (theme !== 'dark') html.classList.add(`theme-${theme}`)

      // Apply palette
      PALETTE_CLASSES.forEach((p) => html.classList.remove(p))
      if (palette) html.classList.add(palette)
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, [])

  return <>{children}</>
}
