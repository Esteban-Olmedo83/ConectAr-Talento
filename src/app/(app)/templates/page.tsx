'use client'

import * as React from 'react'
import {
  Mail,
  MessageCircle,
  Plus,
  Send,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
  Eye,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react'

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}
import { SupabaseProvider } from '@/lib/supabase/data-provider'
import { useUser } from '@/lib/context/user-context'
import type { MessageTemplate, TemplateChannel, TemplateCategory } from '@/types'
import { generateId } from '@/lib/utils'

/* ─── helpers ────────────────────────────────────────────────── */
function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) ?? []
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))]
}

/* ─── default templates ──────────────────────────────────────── */
const DEFAULT_TEMPLATES: Omit<MessageTemplate, 'id' | 'tenantId' | 'createdAt'>[] = [
  {
    name: 'LinkedIn – Vacante abierta',
    channel: 'linkedin',
    category: 'vacancy_post',
    body: `🚀 ¡Estamos buscando {{vacante}} para {{empresa}}!\n\nSi sos un/a profesional apasionado/a por {{rubro}} y querés sumarte a un equipo en crecimiento, esta oportunidad es para vos.\n\n✅ Modalidad: {{modalidad}}\n💰 Remuneración: {{salario}}\n📍 Ubicación: {{ubicacion}}\n\n¿Te interesa? Postulate en los comentarios o escribinos por privado.\n\n#Empleo #Oportunidad #{{rubro}} #LATAM`,
    variables: ['vacante', 'empresa', 'rubro', 'modalidad', 'salario', 'ubicacion'],
    isDefault: true,
    subject: undefined,
  },
  {
    name: 'LinkedIn – Búsqueda urgente',
    channel: 'linkedin',
    category: 'vacancy_post',
    body: `🔥 URGENTE | Buscamos {{vacante}} para {{empresa}}\n\n¡Necesitamos cubrir esta posición en tiempo récord! Si cumplís con el perfil, escribinos HOY.\n\n🎯 Perfil buscado: {{descripcion_perfil}}\n📅 Inicio: {{fecha_inicio}}\n🌎 Modalidad: {{modalidad}}\n\n💬 Dejá tu CV en comentarios o contactanos directamente.\n\n#Urgente #Trabajo #{{vacante}}`,
    variables: ['vacante', 'empresa', 'descripcion_perfil', 'fecha_inicio', 'modalidad'],
    isDefault: true,
    subject: undefined,
  },
  {
    name: 'LinkedIn – Sourcing pasivo',
    channel: 'linkedin',
    category: 'follow_up',
    body: `Hola {{nombre_candidato}},\n\nVi tu perfil y me pareció muy interesante tu experiencia en {{especialidad}}. Estamos trabajando en una búsqueda para {{empresa}} que creo que podría ser una gran oportunidad para vos.\n\n¿Tenés 15 minutos esta semana para contarte de qué se trata?\n\nSaludos,\n{{reclutador}}`,
    variables: ['nombre_candidato', 'especialidad', 'empresa', 'reclutador'],
    isDefault: true,
    subject: undefined,
  },
  {
    name: 'Email – Invitación a entrevista',
    channel: 'email',
    category: 'interview_invite',
    subject: 'Invitación a entrevista – {{vacante}} en {{empresa}}',
    body: `Estimado/a {{nombre_candidato}},\n\nNos complace invitarte a una entrevista para el puesto de {{vacante}} en {{empresa}}.\n\n📅 Fecha: {{fecha_entrevista}}\n🕐 Hora: {{hora_entrevista}}\n📍 Modalidad: {{modalidad_entrevista}}\n🔗 Link: {{link_reunion}}\n\nPor favor, confirmá tu asistencia respondiendo este email.\n\nSi necesitás reprogramar, no dudes en comunicárnoslo.\n\nQuedamos a disposición ante cualquier consulta.\n\nSaludos cordiales,\n{{reclutador}}\n{{empresa}}`,
    variables: ['nombre_candidato', 'vacante', 'empresa', 'fecha_entrevista', 'hora_entrevista', 'modalidad_entrevista', 'link_reunion', 'reclutador'],
    isDefault: true,
  },
  {
    name: 'Email – Rechazo profesional',
    channel: 'email',
    category: 'rejection',
    subject: 'Resultado de tu postulación – {{vacante}}',
    body: `Estimado/a {{nombre_candidato}},\n\nAgradecemos tu interés en la posición de {{vacante}} en {{empresa}} y el tiempo que dedicaste a nuestro proceso de selección.\n\nLuego de una evaluación exhaustiva, hemos tomado la decisión de continuar con otros perfiles que se ajustan mejor a los requerimientos actuales del puesto.\n\nValoramos mucho tu participación y te alentamos a estar atento/a a futuras oportunidades en nuestra empresa.\n\nTe deseamos éxito en tu búsqueda laboral.\n\nSaludos cordiales,\n{{reclutador}}\n{{empresa}}`,
    variables: ['nombre_candidato', 'vacante', 'empresa', 'reclutador'],
    isDefault: true,
  },
  {
    name: 'Email – Oferta de trabajo',
    channel: 'email',
    category: 'offer',
    subject: '¡Oferta de trabajo! – {{vacante}} en {{empresa}}',
    body: `Estimado/a {{nombre_candidato}},\n\nEs un placer comunicarte que, tras el proceso de selección, hemos decidido extenderte una oferta para el puesto de {{vacante}}.\n\n💼 Cargo: {{vacante}}\n💰 Salario mensual bruto: {{salario}}\n📅 Fecha de inicio: {{fecha_inicio}}\n🏢 Modalidad: {{modalidad}}\n\nPor favor, confirmanos tu aceptación antes del {{fecha_vencimiento_oferta}}.\n\nAdjuntamos el contrato para tu revisión. Ante cualquier duda, estamos disponibles.\n\n¡Esperamos darte la bienvenida al equipo!\n\nSaludos,\n{{reclutador}}\n{{empresa}}`,
    variables: ['nombre_candidato', 'vacante', 'empresa', 'salario', 'fecha_inicio', 'modalidad', 'fecha_vencimiento_oferta', 'reclutador'],
    isDefault: true,
  },
  {
    name: 'Email – Bienvenida al proceso',
    channel: 'email',
    category: 'welcome',
    subject: 'Recibimos tu postulación – {{vacante}}',
    body: `Hola {{nombre_candidato}},\n\nRecibimos tu postulación para el puesto de {{vacante}} en {{empresa}}. 🎉\n\nNuestro equipo revisará tu perfil en los próximos {{dias_revision}} días hábiles. Si tu candidatura avanza, nos pondremos en contacto para coordinar los siguientes pasos.\n\nMientras tanto, si tenés alguna pregunta, podés escribirnos a {{email_contacto}}.\n\n¡Muchas gracias por tu interés!\n\nEquipo de Talento\n{{empresa}}`,
    variables: ['nombre_candidato', 'vacante', 'empresa', 'dias_revision', 'email_contacto'],
    isDefault: true,
  },
  {
    name: 'WhatsApp – Contacto inicial',
    channel: 'whatsapp',
    category: 'welcome',
    body: `Hola {{nombre_candidato}}! 👋\n\nMi nombre es {{reclutador}} y soy del equipo de Talento de {{empresa}}.\n\nVi tu perfil y me gustaría contarte sobre una oportunidad para el puesto de {{vacante}}.\n\n¿Tenés unos minutos para charlar? 😊`,
    variables: ['nombre_candidato', 'reclutador', 'empresa', 'vacante'],
    isDefault: true,
    subject: undefined,
  },
  {
    name: 'WhatsApp – Confirmación de entrevista',
    channel: 'whatsapp',
    category: 'interview_invite',
    body: `Hola {{nombre_candidato}}! ✅\n\nTe confirmamos tu entrevista para {{vacante}} en {{empresa}}:\n\n📅 Fecha: {{fecha_entrevista}}\n🕐 Hora: {{hora_entrevista}}\n📍 Modalidad: {{modalidad_entrevista}}\n🔗 Link: {{link_reunion}}\n\nPor favor, confirmanos con un ✅ si podés asistir.\n\nCualquier consulta, escribinos aquí. ¡Mucho éxito! 🍀`,
    variables: ['nombre_candidato', 'vacante', 'empresa', 'fecha_entrevista', 'hora_entrevista', 'modalidad_entrevista', 'link_reunion'],
    isDefault: true,
    subject: undefined,
  },
  {
    name: 'WhatsApp – Resultado del proceso',
    channel: 'whatsapp',
    category: 'follow_up',
    body: `Hola {{nombre_candidato}}, {{resultado_mensaje}}\n\nGracias por participar del proceso de selección de {{empresa}}. Fue un placer conocerte.\n\n{{mensaje_adicional}}\n\nEquipo de Talento 💙`,
    variables: ['nombre_candidato', 'resultado_mensaje', 'empresa', 'mensaje_adicional'],
    isDefault: true,
    subject: undefined,
  },
]

/* ─── channel config ─────────────────────────────────────────── */
const CHANNEL_CONFIG: Record<TemplateChannel, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  linkedin: {
    label: 'LinkedIn',
    icon: <LinkedInIcon className="h-3.5 w-3.5" />,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  email: {
    label: 'Email',
    icon: <Mail className="h-3.5 w-3.5" />,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  vacancy_post: 'Publicación',
  interview_invite: 'Invitación',
  rejection: 'Rechazo',
  offer: 'Oferta',
  welcome: 'Bienvenida',
  follow_up: 'Seguimiento',
}

/* ─── SendModal ──────────────────────────────────────────────── */
function SendModal({
  template,
  onClose,
}: {
  template: MessageTemplate
  onClose: () => void
}) {
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(template.variables.map((v) => [v, '']))
  )

  const preview = React.useMemo(() => {
    let text = template.body
    for (const [k, v] of Object.entries(values)) {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`)
    }
    return text
  }, [template.body, values])

  const [tab, setTab] = React.useState<'fill' | 'preview'>('fill')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Usar template</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{template.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-border px-5">
          {(['fill', 'preview'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'fill' ? 'Completar variables' : 'Vista previa'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'fill' ? (
            template.variables.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este template no tiene variables. Pasá a Vista previa.</p>
            ) : (
              <div className="space-y-4">
                {template.subject && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                      Asunto
                    </label>
                    <p className="text-sm bg-muted rounded-lg px-3 py-2">{template.subject}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {template.variables.map((v) => (
                    <div key={v}>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        {`{{${v}}}`}
                      </label>
                      <input
                        value={values[v] ?? ''}
                        onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                        placeholder={v.replace(/_/g, ' ')}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Mensaje final</p>
              <div className="bg-muted rounded-xl p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {preview}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end p-5 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <button
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={onClose}
          >
            <Send className="h-3.5 w-3.5" />
            Enviar por {CHANNEL_CONFIG[template.channel].label}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── EditorModal ────────────────────────────────────────────── */
function EditorModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<MessageTemplate> | null
  onSave: (t: MessageTemplate) => void
  onClose: () => void
}) {
  const user = useUser()
  const tenantId = user.tenantId
  const [name, setName] = React.useState(initial?.name ?? '')
  const [channel, setChannel] = React.useState<TemplateChannel>(initial?.channel ?? 'email')
  const [category, setCategory] = React.useState<TemplateCategory>(initial?.category ?? 'welcome')
  const [subject, setSubject] = React.useState(initial?.subject ?? '')
  const [body, setBody] = React.useState(initial?.body ?? '')
  const [tab, setTab] = React.useState<'edit' | 'preview'>('edit')
  const [improving, setImproving] = React.useState(false)

  const detectedVars = extractVariables(body)

  async function handleImprove() {
    setImproving(true)
    try {
      const res = await fetch('/api/ai/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          department: channel,
          modality: category,
          skills: [],
          additionalInfo: `Mejora este mensaje de ${channel} manteniendo el tono profesional y las variables {{variable}}:\n\n${body}`,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.linkedinPost && channel === 'linkedin') setBody(data.linkedinPost)
        else if (data.whatsappMessage && channel === 'whatsapp') setBody(data.whatsappMessage)
        else if (data.jobDescription) setBody(data.jobDescription)
      }
    } catch {
      // silent
    } finally {
      setImproving(false)
    }
  }

  function handleSave() {
    if (!name.trim() || !body.trim()) return
    const t: MessageTemplate = {
      id: initial?.id ?? generateId(),
      tenantId,
      name,
      channel,
      category,
      subject: channel === 'email' ? subject : undefined,
      body,
      variables: detectedVars,
      isDefault: false,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    }
    onSave(t)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">{initial?.id ? 'Editar template' : 'Nuevo template'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: LinkedIn – Vacante urgente"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* channel + category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Canal</label>
              <div className="relative">
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as TemplateChannel)}
                  className="w-full appearance-none bg-muted border border-border rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Categoría</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full appearance-none bg-muted border border-border rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {(Object.entries(CATEGORY_LABELS) as [TemplateCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* subject (email only) */}
          {channel === 'email' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Asunto</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Invitación a entrevista – {{vacante}}"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {/* body tabs */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mensaje</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTab(tab === 'edit' ? 'preview' : 'edit')}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  {tab === 'edit' ? 'Vista previa' : 'Editar'}
                </button>
                <button
                  onClick={handleImprove}
                  disabled={improving || !body.trim()}
                  className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                >
                  {improving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Mejorar con IA
                </button>
              </div>
            </div>
            {tab === 'edit' ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Escribí tu mensaje. Usá {{variable}} para insertar valores dinámicos."
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            ) : (
              <div className="bg-muted rounded-xl p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed min-h-[200px]">
                {body || <span className="text-muted-foreground italic">Sin contenido</span>}
              </div>
            )}
          </div>

          {/* detected variables */}
          {detectedVars.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Variables detectadas</p>
              <div className="flex flex-wrap gap-1.5">
                {detectedVars.map((v) => (
                  <span key={v} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end p-5 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !body.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Guardar template
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── main page ──────────────────────────────────────────────── */
export default function TemplatesPage() {
  const user = useUser()
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([])
  const [filterChannel, setFilterChannel] = React.useState<TemplateChannel | 'all'>('all')
  const [sendTarget, setSendTarget] = React.useState<MessageTemplate | null>(null)
  const [editTarget, setEditTarget] = React.useState<Partial<MessageTemplate> | null | 'new'>(null)
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  /* load + seed */
  React.useEffect(() => {
    async function load() {
      const result = await provider.getTemplates(user.tenantId)
      const existing = result.data ?? []

      if (existing.length === 0) {
        const seeded: MessageTemplate[] = []
        for (const t of DEFAULT_TEMPLATES) {
          const res = await provider.createTemplate({ ...t, tenantId: user.tenantId })
          if (res.data) seeded.push(res.data)
        }
        setTemplates(seeded)
      } else {
        setTemplates(existing)
      }
    }
    load()
  }, [provider, user.tenantId])

  const filtered = filterChannel === 'all' ? templates : templates.filter((t) => t.channel === filterChannel)

  async function handleSave(t: MessageTemplate) {
    if (templates.find((x) => x.id === t.id)) {
      const res = await provider.updateTemplate(t.id, {
        name: t.name, channel: t.channel, category: t.category,
        subject: t.subject, body: t.body, variables: t.variables, isDefault: t.isDefault,
      })
      if (res.data) setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data! : x)))
    } else {
      const res = await provider.createTemplate({
        tenantId: user.tenantId, name: t.name, channel: t.channel, category: t.category,
        subject: t.subject, body: t.body, variables: t.variables, isDefault: t.isDefault,
      })
      if (res.data) setTemplates((prev) => [...prev, res.data!])
    }
    setEditTarget(null)
  }

  async function handleDuplicate(t: MessageTemplate) {
    const res = await provider.createTemplate({
      tenantId: user.tenantId, name: `${t.name} (copia)`, channel: t.channel,
      category: t.category, subject: t.subject, body: t.body,
      variables: t.variables, isDefault: false,
    })
    if (res.data) setTemplates((prev) => [...prev, res.data!])
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminás este template?')) return
    await provider.deleteTemplate(id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const counts: Record<string, number> = { all: templates.length }
  for (const ch of ['linkedin', 'email', 'whatsapp'] as TemplateChannel[]) {
    counts[ch] = templates.filter((t) => t.channel === ch).length
  }

  return (
    <div className="flex flex-col h-full">
      {/* page header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Templates de Comunicación</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Publicaciones, emails y mensajes de WhatsApp listos para usar
          </p>
        </div>
        <button
          onClick={() => setEditTarget('new')}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Template
        </button>
      </div>

      {/* filter tabs */}
      <div className="flex gap-1 px-6 pt-4 pb-2">
        {([['all', 'Todos'], ['linkedin', 'LinkedIn'], ['email', 'Email'], ['whatsapp', 'WhatsApp']] as const).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterChannel(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterChannel === key
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {key !== 'all' && CHANNEL_CONFIG[key as TemplateChannel].icon}
              {label}
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{counts[key]}</span>
            </button>
          )
        )}
      </div>

      {/* grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="font-medium text-foreground">No hay templates</p>
            <p className="text-sm text-muted-foreground mt-1">Creá tu primer template de comunicación</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const ch = CHANNEL_CONFIG[t.channel]
              return (
                <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                  {/* header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${ch.bg} ${ch.color}`}>
                        {ch.icon}
                        {ch.label}
                      </span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[t.category]}
                      </span>
                    </div>
                    {t.isDefault && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Default
                      </span>
                    )}
                  </div>

                  {/* name */}
                  <h3 className="font-semibold text-foreground text-sm leading-tight">{t.name}</h3>

                  {/* preview */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {t.body.slice(0, 150)}{t.body.length > 150 ? '…' : ''}
                  </p>

                  {/* variables */}
                  {t.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.variables.slice(0, 4).map((v) => (
                        <span key={v} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                          {`{{${v}}}`}
                        </span>
                      ))}
                      {t.variables.length > 4 && (
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5">
                          +{t.variables.length - 4} más
                        </span>
                      )}
                    </div>
                  )}

                  {/* actions */}
                  <div className="flex items-center gap-1 pt-1 border-t border-border mt-auto">
                    <button
                      onClick={() => setSendTarget(t)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors flex-1 justify-center"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Usar
                    </button>
                    <button
                      onClick={() => setEditTarget(t)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(t)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* modals */}
      {sendTarget && <SendModal template={sendTarget} onClose={() => setSendTarget(null)} />}
      {editTarget !== null && (
        <EditorModal
          initial={editTarget === 'new' ? null : editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
