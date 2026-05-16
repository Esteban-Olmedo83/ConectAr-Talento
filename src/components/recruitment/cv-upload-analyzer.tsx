'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AtsScoreBadge } from './ats-score-badge'

interface AnalysisResult {
  fullName: string
  email: string
  phone?: string
  atsScore: number
  skills: string[]
  experienceYears?: number
  education?: string
}

interface CvUploadAnalyzerProps {
  vacancyRequirements?: string[]
  onAnalysisComplete: (data: AnalysisResult) => void
  className?: string
}

type UploadState = 'idle' | 'file-selected' | 'extracting' | 'analyzing' | 'success' | 'error'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/plain',
]

function getProgressLabel(state: UploadState): string {
  switch (state) {
    case 'extracting':
      return 'Extrayendo texto del PDF...'
    case 'analyzing':
      return 'Analizando CV con IA...'
    default:
      return ''
  }
}

function getProgressValue(state: UploadState): number {
  switch (state) {
    case 'extracting':
      return 30
    case 'analyzing':
      return 70
    case 'success':
      return 100
    default:
      return 0
  }
}

export function CvUploadAnalyzer({
  vacancyRequirements,
  onAnalysisComplete,
  className,
}: CvUploadAnalyzerProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((selectedFile: File) => {
    if (!ACCEPTED_TYPES.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|doc|docx|txt|rtf|md)$/i)) {
      setError('Formato no válido. Acepta: PDF, DOC, DOCX, TXT, RTF, MD')
      setState('error')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo supera el límite de 10MB.')
      setState('error')
      return
    }
    setFile(selectedFile)
    setState('file-selected')
    setError(null)
    setResult(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleFile(dropped)
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setError(null)

    try {
      setState('analyzing')
      const formData = new FormData()
      formData.append('file', file)
      if (vacancyRequirements?.length) {
        formData.append('vacancyRequirements', JSON.stringify(vacancyRequirements))
      }

      const res = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string }
        throw new Error(errData.error ?? `Error ${res.status}`)
      }

      const data = (await res.json()) as AnalysisResult
      setResult(data)
      setState('success')
      onAnalysisComplete(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setFile(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isProcessing = state === 'extracting' || state === 'analyzing'

  // Success state
  if (state === 'success' && result) {
    return (
      <div className={cn('rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20', className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
            <span className="text-sm font-semibold text-green-800 dark:text-green-300">
              CV analizado con IA
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AtsScoreBadge score={result.atsScore} size="sm" showLabel />
            <Button variant="ghost" size="icon" onClick={handleReset} className="h-7 w-7">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Nombre" value={result.fullName} />
          <Field label="Email" value={result.email || '—'} />
          {result.phone && <Field label="Teléfono" value={result.phone} />}
          {result.experienceYears !== undefined && (
            <Field label="Experiencia" value={`${result.experienceYears} año${result.experienceYears !== 1 ? 's' : ''}`} />
          )}
          {result.education && <Field label="Educación" value={result.education} />}
        </div>
        {result.skills.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Skills detectados</p>
            <div className="flex flex-wrap gap-1">
              {result.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/40 dark:text-green-300"
                >
                  {skill}
                </span>
              ))}
              {result.skills.length > 8 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-400">
                  +{result.skills.length - 8} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      {state === 'idle' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <Upload className={cn('h-8 w-8', isDragOver ? 'text-primary' : 'text-muted-foreground')} />
          <div className="text-center">
            <p className="text-sm font-medium">Arrastrá el CV aquí o hacé clic para elegir</p>
            <p className="mt-0.5 text-xs text-muted-foreground">PDF, DOC, DOCX, RTF, TXT hasta 10MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.rtf,.txt,.md"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* File selected, ready to analyze */}
      {(state === 'file-selected' || isProcessing) && file && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {!isProcessing && (
              <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{getProgressLabel(state)}</p>
              <Progress value={getProgressValue(state)} className="h-1.5" />
            </div>
          )}

          {state === 'file-selected' && (
            <Button onClick={handleAnalyze} className="w-full gap-2" size="sm">
              <Sparkles className="h-4 w-4" />
              Analizar con IA
            </Button>
          )}
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-destructive">Error al analizar el CV</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="w-full gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Intentar nuevamente
          </Button>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600 mt-0.5" />
      <div className="min-w-0">
        <span className="text-xs text-green-700 dark:text-green-400 font-medium">{label}: </span>
        <span className="text-xs text-green-900 dark:text-green-200 truncate">{value}</span>
      </div>
    </div>
  )
}
