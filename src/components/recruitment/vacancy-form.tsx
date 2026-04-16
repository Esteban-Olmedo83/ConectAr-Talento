'use client'

import React, { useState, KeyboardEvent } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import {
  Plus,
  X,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, generateId } from '@/lib/utils'
import { skillsLibrary, rubros, getProfilesByRubro } from '@/lib/skills'
import type { Vacancy, VacancyModality, VacancyPriority } from '@/types'

// ─── Zod schema ────────────────────────────────────────────────────────────────

const vacancySchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  department: z.string().min(1, 'Seleccioná un departamento'),
  modality: z.enum(['Presencial', 'Remoto', 'Híbrido']),
  priority: z.enum(['Alta', 'Media', 'Baja']),
  location: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  currency: z.string().optional(),
  rubro: z.string().optional(),
  perfil: z.string().optional(),
  closingDate: z.string().optional(),
  description: z.string().optional(),
})

type VacancyFormValues = z.infer<typeof vacancySchema>

// ─── Props ─────────────────────────────────────────────────────────────────────

interface VacancyFormProps {
  vacancy?: Vacancy
  onSave: (v: Vacancy) => void
  onClose: () => void
}

const DEPARTMENTS = [
  'Tecnología',
  'Marketing',
  'Ventas',
  'Finanzas',
  'RRHH',
  'Operaciones',
  'Legal',
  'Ingeniería',
  'Salud',
  'Otro',
]

const CURRENCIES = ['ARS', 'USD', 'MXN', 'COP']

// ─── Component ─────────────────────────────────────────────────────────────────

export function VacancyForm({ vacancy, onSave, onClose }: VacancyFormProps) {
  const [skills, setSkills] = useState<string[]>(vacancy?.requirements ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [isGeneratingJd, setIsGeneratingJd] = useState(false)
  const [jdError, setJdError] = useState<string | null>(null)
  const [showGeneratedContent, setShowGeneratedContent] = useState(false)
  const [generatedLinkedIn, setGeneratedLinkedIn] = useState('')
  const [generatedWhatsApp, setGeneratedWhatsApp] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: vacancy?.title ?? '',
      department: vacancy?.department ?? '',
      modality: vacancy?.modality ?? 'Híbrido',
      priority: vacancy?.priority ?? 'Media',
      location: vacancy?.location ?? '',
      salaryMin: vacancy?.salaryMin?.toString() ?? '',
      salaryMax: vacancy?.salaryMax?.toString() ?? '',
      currency: vacancy?.currency ?? 'ARS',
      rubro: '',
      perfil: '',
      closingDate: vacancy?.closingDate
        ? new Date(vacancy.closingDate).toISOString().split('T')[0]
        : '',
      description: vacancy?.description ?? '',
    },
  })

  const watchedRubro = watch('rubro')
  const watchedPerfil = watch('perfil')
  const watchedModality = watch('modality')

  // When profile changes, auto-populate skills
  const handlePerfilChange = (perfilId: string) => {
    setValue('perfil', perfilId)
    const profile = skillsLibrary.find((s) => s.id === perfilId)
    if (profile) {
      const profileSkills = [
        ...profile.skills.tecnicas,
        ...profile.skills.blandas.slice(0, 3),
        ...profile.skills.herramientas.slice(0, 3),
      ]
      const merged = [...new Set([...skills, ...profileSkills])]
      setSkills(merged)
      if (profile.descripcionTipica && !watch('description')) {
        setValue('description', profile.descripcionTipica)
      }
    }
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const handleGenerateJd = async () => {
    const values = watch()
    if (!values.title || !values.department || skills.length === 0) {
      setJdError('Completá título, departamento y al menos un skill antes de generar.')
      return
    }

    setIsGeneratingJd(true)
    setJdError(null)

    try {
      const res = await fetch('/api/ai/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          department: values.department,
          modality: values.modality,
          requirements: skills,
          salaryRange:
            values.salaryMin && values.salaryMax
              ? `${values.currency} ${values.salaryMin} - ${values.salaryMax}`
              : undefined,
          level: watchedPerfil
            ? skillsLibrary.find((s) => s.id === watchedPerfil)?.nivel
            : undefined,
          location: values.location,
        }),
      })

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string }
        throw new Error(errData.error ?? `Error ${res.status}`)
      }

      const data = (await res.json()) as {
        jobDescription: string
        linkedinPost: string
        whatsappMessage: string
      }
      setValue('description', data.jobDescription)
      setGeneratedLinkedIn(data.linkedinPost)
      setGeneratedWhatsApp(data.whatsappMessage)
      setShowGeneratedContent(true)
    } catch (err) {
      setJdError(err instanceof Error ? err.message : 'Error al generar descripción')
    } finally {
      setIsGeneratingJd(false)
    }
  }

  const onSubmit = (values: VacancyFormValues) => {
    const now = new Date().toISOString()
    const savedVacancy: Vacancy = {
      id: vacancy?.id ?? generateId(),
      tenantId: vacancy?.tenantId ?? 'demo-tenant',
      title: values.title,
      department: values.department,
      status: vacancy?.status ?? 'Nuevas Vacantes',
      description: values.description,
      requirements: skills,
      salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
      salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
      currency: values.currency,
      location: values.location,
      modality: values.modality as VacancyModality,
      priority: values.priority as VacancyPriority,
      closingDate: values.closingDate ? new Date(values.closingDate).toISOString() : undefined,
      createdAt: vacancy?.createdAt ?? now,
      applications: vacancy?.applications ?? [],
    }
    onSave(savedVacancy)
  }

  const profilesForRubro = watchedRubro ? getProfilesByRubro(watchedRubro) : []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Título del puesto <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="ej. Frontend Developer Senior"
          {...register('title')}
          className={cn(errors.title && 'border-destructive')}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Department + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>
            Departamento <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={cn(errors.department && 'border-destructive')}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.department && (
            <p className="text-xs text-destructive">{errors.department.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Prioridad</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Modality */}
      <div className="space-y-1.5">
        <Label>Modalidad</Label>
        <Controller
          name="modality"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2">
              {(['Presencial', 'Remoto', 'Híbrido'] as VacancyModality[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => field.onChange(m)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    field.value === m
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-muted'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Location */}
      {watchedModality !== 'Remoto' && (
        <div className="space-y-1.5">
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" placeholder="ej. Buenos Aires, Argentina" {...register('location')} />
        </div>
      )}

      {/* Salary */}
      <div className="space-y-1.5">
        <Label>Rango salarial (opcional)</Label>
        <div className="flex gap-2">
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-24 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Input
            type="number"
            placeholder="Mínimo"
            {...register('salaryMin')}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Máximo"
            {...register('salaryMax')}
            className="flex-1"
          />
        </div>
      </div>

      {/* Rubro + Perfil */}
      <div className="space-y-1.5 rounded-lg border border-dashed p-3 bg-muted/20">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Autocompletar desde biblioteca de perfiles
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Controller
            name="rubro"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(v) => {
                  field.onChange(v)
                  setValue('perfil', '')
                }}
                value={field.value ?? ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rubro..." />
                </SelectTrigger>
                <SelectContent>
                  {rubros.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name="perfil"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={handlePerfilChange}
                value={field.value ?? ''}
                disabled={!watchedRubro || profilesForRubro.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Perfil..." />
                </SelectTrigger>
                <SelectContent>
                  {profilesForRubro.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.perfil} ({p.nivel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Skills tag input */}
      <div className="space-y-1.5">
        <Label>
          Skills requeridos <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Escribí un skill y presioná Enter..."
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" onClick={addSkill}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {skills.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Agregá al menos un skill requerido para el puesto.
          </p>
        )}
      </div>

      {/* Closing date */}
      <div className="space-y-1.5">
        <Label htmlFor="closingDate">Fecha de cierre (opcional)</Label>
        <Input id="closingDate" type="date" {...register('closingDate')} className="w-48" />
      </div>

      {/* Description + Generate JD button */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Descripción del puesto</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateJd}
            disabled={isGeneratingJd}
            className="gap-1.5 text-xs"
          >
            {isGeneratingJd ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Generar con IA
          </Button>
        </div>
        {jdError && <p className="text-xs text-destructive">{jdError}</p>}
        <Textarea
          id="description"
          placeholder="Descripción detallada del puesto, responsabilidades, requisitos..."
          rows={6}
          {...register('description')}
          className="resize-y"
        />
      </div>

      {/* Generated LinkedIn / WhatsApp content */}
      {showGeneratedContent && (generatedLinkedIn || generatedWhatsApp) && (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between text-sm font-medium text-primary"
            onClick={() => setShowGeneratedContent((v) => !v)}
          >
            <span>Contenido generado para publicacion</span>
            {showGeneratedContent ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showGeneratedContent && (
            <div className="space-y-3 pt-1">
              {generatedLinkedIn && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">LinkedIn</p>
                  <pre className="whitespace-pre-wrap rounded-md bg-background p-2 text-xs border max-h-40 overflow-y-auto">
                    {generatedLinkedIn}
                  </pre>
                </div>
              )}
              {generatedWhatsApp && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">WhatsApp</p>
                  <pre className="whitespace-pre-wrap rounded-md bg-background p-2 text-xs border">
                    {generatedWhatsApp}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t sticky bottom-0 bg-background pb-1">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {vacancy ? 'Guardar cambios' : 'Crear vacante'}
        </Button>
      </div>
    </form>
  )
}
