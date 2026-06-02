'use client'

import * as React from 'react'
import { Search, User, Briefcase, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/user-context'

interface SearchResult {
  id: string
  type: 'candidate' | 'vacancy'
  title: string
  subtitle: string
  href: string
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { user } = useUser()
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedIdx, setSelectedIdx] = React.useState(0)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  React.useEffect(() => {
    const q = query.trim()
    if (!q || !user?.tenantId) {
      setResults([])
      setLoading(false)
      return
    }
    clearTimeout(debounceRef.current)
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const supabase = createClient()
        const pattern = `%${q}%`

        const [candRes, vacRes] = await Promise.all([
          supabase
            .from('candidates')
            .select('id, full_name, email, ats_score')
            .eq('tenant_id', user.tenantId)
            .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
            .order('full_name')
            .limit(6),
          supabase
            .from('vacancies')
            .select('id, title, department, status')
            .eq('tenant_id', user.tenantId)
            .or(`title.ilike.${pattern},department.ilike.${pattern}`)
            .order('created_at', { ascending: false })
            .limit(6),
        ])

        const candResults: SearchResult[] = (candRes.data ?? []).map(c => ({
          id: `c-${c.id}`,
          type: 'candidate',
          title: (c.full_name as string | null) ?? '(Sin nombre)',
          subtitle: (c.email as string | null) ?? '',
          href: `/candidates`,
        }))

        const vacResults: SearchResult[] = (vacRes.data ?? []).map(v => ({
          id: `v-${v.id}`,
          type: 'vacancy',
          title: (v.title as string | null) ?? '(Sin título)',
          subtitle: [v.department, v.status].filter(Boolean).join(' · '),
          href: `/vacancies`,
        }))

        setResults([...candResults, ...vacResults])
        setSelectedIdx(0)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, user?.tenantId])

  function navigate(href: string) {
    router.push(href)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[selectedIdx]
      if (r) navigate(r.href)
    }
  }

  if (!open) return null

  const candidates = results.filter(r => r.type === 'candidate')
  const vacancies = results.filter(r => r.type === 'vacancy')
  const hasResults = results.length > 0
  const hasQuery = query.trim().length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Input row */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin shrink-0" style={{ color: 'var(--muted)' }} />
            : <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--muted)' }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar candidatos, vacantes…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="shrink-0 p-0.5 rounded transition-colors hover:bg-[var(--surface2)]"
              style={{ color: 'var(--muted)' }}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd
            className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-xs font-mono shrink-0"
            style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        {hasQuery && (
          <div className="max-h-80 overflow-y-auto">
            {!hasResults && !loading ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Sin resultados para &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              <>
                {candidates.length > 0 && (
                  <section>
                    <p
                      className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--muted)' }}
                    >
                      Candidatos
                    </p>
                    {candidates.map(r => {
                      const idx = results.indexOf(r)
                      return (
                        <button
                          key={r.id}
                          onClick={() => navigate(r.href)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors"
                          style={{
                            background: selectedIdx === idx ? 'var(--surface2)' : 'transparent',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div
                            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full"
                            style={{ background: 'var(--accent-soft)' }}
                          >
                            <User className="h-3.5 w-3.5" style={{ color: 'var(--accent-2)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{r.title}</p>
                            {r.subtitle && (
                              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{r.subtitle}</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </section>
                )}

                {vacancies.length > 0 && (
                  <section>
                    <p
                      className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--muted)' }}
                    >
                      Vacantes
                    </p>
                    {vacancies.map(r => {
                      const idx = results.indexOf(r)
                      return (
                        <button
                          key={r.id}
                          onClick={() => navigate(r.href)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors"
                          style={{
                            background: selectedIdx === idx ? 'var(--surface2)' : 'transparent',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div
                            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full"
                            style={{ background: 'rgba(52,211,153,0.15)' }}
                          >
                            <Briefcase className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{r.title}</p>
                            {r.subtitle && (
                              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{r.subtitle}</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* Empty state when no query */}
        {!hasQuery && (
          <div className="py-6 px-4 text-center">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Escribí para buscar en tus candidatos y vacantes
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
