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

/**
 * Genera las claves de localStorage para un usuario específico.
 * Si no se provee userId, usa las claves globales como fallback
 * (solo aplica antes de que el usuario esté autenticado).
 */
export function getThemeKeys(userId?: string | null) {
  const prefix = userId ? `u_${userId}` : 'ct'
  return {
    theme: `${prefix}_theme`,
    palette: `${prefix}_palette`,
  }
}

/**
 * Aplica el tema y paleta al elemento <html>.
 * Puede llamarse desde ThemeProvider (sin userId, fallback global)
 * o desde AppRouteLayout (con userId del usuario autenticado).
 */
export function applyStoredTheme(userId?: string | null) {
  try {
    const keys = getThemeKeys(userId)
    const theme = localStorage.getItem(keys.theme) || 'dark'
    const palette = localStorage.getItem(keys.palette) || ''
    const html = document.documentElement

    html.classList.remove('theme-light', 'theme-auto')
    if (theme !== 'dark') html.classList.add(`theme-${theme}`)

    PALETTE_CLASSES.forEach((p) => html.classList.remove(p))
    if (palette) html.classList.add(palette)
  } catch {
    // localStorage puede no estar disponible en algunos entornos
  }
}

/**
 * ThemeProvider aplica el tema guardado al montar la app.
 * En este punto no conocemos el userId, por lo que usa el fallback global.
 * Una vez que el usuario se autentica, AppRouteLayout llama a
 * applyStoredTheme(userId) para aplicar las preferencias del usuario.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    applyStoredTheme(null)
  }, [])

  return <>{children}</>
}
