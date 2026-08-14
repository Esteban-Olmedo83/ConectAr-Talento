'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useUser } from '@/lib/context/user-context'
import { useLanguage } from '@/lib/context/language-context'

interface SetupState {
  folder: 'OK' | 'MISSING'
  sheets: 'OK' | 'MISSING'
}

interface CreateResult {
  success: boolean
  folderCreated?: boolean
  sheetsCreated?: boolean
  folderError?: string
  sheetsError?: string
}

export function GoogleSetupWizard({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const { user } = useUser()
  const { t } = useLanguage()
  const [stage, setStage] = React.useState<'checking' | 'result' | 'creating'>('checking')
  const [setupState, setSetupState] = React.useState<SetupState | null>(null)
  const [createResult, setCreateResult] = React.useState<CreateResult | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)

  // Verify current setup state
  React.useEffect(() => {
    async function verify() {
      try {
        const res = await fetch('/api/google/setup/verify', { method: 'POST' })
        const data = await res.json() as SetupState
        setSetupState(data)
        setStage('result')
      } catch (err) {
        console.error('[Setup Wizard] Verify failed:', err)
      }
    }
    verify()
  }, [])

  async function handleCreate() {
    setIsCreating(true)
    setStage('creating')
    try {
      const res = await fetch('/api/google/setup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createFolder: setupState?.folder === 'MISSING',
          createSheets: setupState?.sheets === 'MISSING',
        }),
      })
      const data = await res.json() as CreateResult
      setCreateResult(data)

      if (data.success) {
        setTimeout(() => {
          onComplete()
        }, 1500)
      }
    } catch (err) {
      console.error('[Setup Wizard] Create failed:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const allComplete = setupState?.folder === 'OK' && setupState?.sheets === 'OK'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-nunito)' }}>
              {stage === 'checking' ? 'Verificando configuración...' : 'Configuración de Google Drive'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Preparando tu Google Drive para backups
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {stage === 'checking' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
              <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
                Verificando tu configuración...
              </p>
            </div>
          )}

          {stage === 'result' && setupState && (
            <>
              {/* Folder status */}
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface2)' }}>
                {setupState.folder === 'OK' ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Google Drive folder
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {setupState.folder === 'OK' ? '✓ Creada' : '✗ Falta crear'}
                  </p>
                </div>
              </div>

              {/* Sheets status */}
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface2)' }}>
                {setupState.sheets === 'OK' ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Google Sheets database
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {setupState.sheets === 'OK' ? '✓ Creada' : '✗ Falta crear'}
                  </p>
                </div>
              </div>

              {allComplete && (
                <div
                  className="flex items-start gap-2.5 rounded-lg p-3 text-xs"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                  <p style={{ color: 'var(--text)' }}>¡Tu Google Drive está completamente configurado!</p>
                </div>
              )}
            </>
          )}

          {stage === 'creating' && (
            <div className="space-y-3">
              {/* Creating folder */}
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface2)' }}>
                {createResult?.folderCreated ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                ) : createResult?.folderError ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                ) : (
                  <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" style={{ color: 'var(--accent)' }} />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Google Drive folder
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {createResult?.folderCreated ? 'Creada' : createResult?.folderError || 'Creando...'}
                  </p>
                </div>
              </div>

              {/* Creating sheets */}
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface2)' }}>
                {createResult?.sheetsCreated ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                ) : createResult?.sheetsError ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                ) : (
                  <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" style={{ color: 'var(--accent)' }} />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Google Sheets database
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {createResult?.sheetsCreated ? 'Creada' : createResult?.sheetsError || 'Creando...'}
                  </p>
                </div>
              </div>

              {createResult?.success && (
                <div
                  className="flex items-start gap-2.5 rounded-lg p-3 text-xs"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                  <p style={{ color: 'var(--text)' }}>¡Configuración completada! Redirigiendo...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end p-5" style={{ borderTop: '1px solid var(--border)' }}>
          {stage === 'result' && !allComplete && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm transition-colors rounded-lg"
                style={{ color: 'var(--muted)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Crear ahora
              </button>
            </>
          )}

          {stage === 'result' && allComplete && (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Listo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
