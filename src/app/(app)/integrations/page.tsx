'use client'

import * as React from 'react'
import {
  Mail,
  MessageCircle,
  Video,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Lock,
  Globe,
} from 'lucide-react'

/* LinkedIn pseudo-icon since lucide-react doesn't export Linkedin */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type { Integration, IntegrationPlatform, IntegrationStatus } from '@/types'
import { generateId } from '@/lib/utils'

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  starter: 1,
  pro: 3,
  business: 5,
  enterprise: 999,
}

/* ─── status config ──────────────────────────────────────────── */
const STATUS_CONFIG: Record<IntegrationStatus, { label: string; icon: React.ReactNode; color: string }> = {
  connected: { label: 'Conectado', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-green-600 bg-green-100' },
  expired: { label: 'Expirado', icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'text-amber-600 bg-amber-100' },
  error: { label: 'Error', icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-red-600 bg-red-100' },
  pending: { label: 'Pendiente', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, color: 'text-blue-600 bg-blue-100' },
}

/* ─── ConnectedAccountRow ────────────────────────────────────── */
function ConnectedAccountRow({
  integration,
  onRemove,
  onReconnect,
}: {
  integration: Integration
  onRemove: (id: string) => void | Promise<void>
  onReconnect: (id: string) => void | Promise<void>
}) {
  const sc = STATUS_CONFIG[integration.status]
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground uppercase flex-shrink-0">
          {integration.accountName.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{integration.accountName}</p>
          {integration.accountEmail && (
            <p className="text-xs text-muted-foreground truncate">{integration.accountEmail}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
          {sc.icon}
          {sc.label}
        </span>
        {integration.status === 'expired' && (
          <button
            onClick={() => onReconnect(integration.id)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onRemove(integration.id)}
          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ─── OAuthConnectModal ──────────────────────────────────────── */
function OAuthConnectModal({
  platform,
  title,
  description,
  fields,
  onConnect,
  onClose,
}: {
  platform: IntegrationPlatform
  title: string
  description: string
  fields: { key: string; label: string; type?: string; placeholder?: string }[]
  onConnect: (data: Record<string, string>) => void
  onClose: () => void
}) {
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    onConnect(values)
    setLoading(false)
  }

  const isValid = fields.every((f) => (values[f.key] ?? '').trim() !== '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                {f.label}
              </label>
              <input
                type={f.type ?? 'text'}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-3">
            <Lock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Tus credenciales se guardan encriptadas y nunca se comparten.</span>
          </div>
        </div>
        <div className="flex gap-2 justify-end p-5 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Conectar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── section config ─────────────────────────────────────────── */
type ModalConfig = {
  platform: IntegrationPlatform
  title: string
  description: string
  fields: { key: string; label: string; type?: string; placeholder?: string }[]
}

const OAUTH_CONFIGS: Record<string, ModalConfig> = {
  linkedin: {
    platform: 'linkedin',
    title: 'Conectar LinkedIn',
    description: 'Autoriza a ConectAr Talento para publicar vacantes y enviar mensajes desde tu cuenta de LinkedIn.',
    fields: [
      { key: 'accountName', label: 'Nombre de la cuenta', placeholder: 'Ej: Juan Pérez (Perfil personal)' },
      { key: 'clientId', label: 'LinkedIn Client ID', placeholder: '86abc123...' },
      { key: 'clientSecret', label: 'LinkedIn Client Secret', type: 'password', placeholder: '••••••••' },
    ],
  },
  gmail: {
    platform: 'gmail',
    title: 'Conectar Gmail',
    description: 'Conecta tu cuenta de Gmail para enviar emails a candidatos directamente desde la app.',
    fields: [
      { key: 'accountEmail', label: 'Email de Gmail', placeholder: 'nombre@gmail.com' },
      { key: 'accountName', label: 'Nombre del remitente', placeholder: 'Equipo de RRHH' },
    ],
  },
  outlook: {
    platform: 'outlook',
    title: 'Conectar Outlook / Microsoft 365',
    description: 'Conecta tu cuenta corporativa de Microsoft para enviar emails profesionales.',
    fields: [
      { key: 'accountEmail', label: 'Email corporativo', placeholder: 'nombre@empresa.com' },
      { key: 'accountName', label: 'Nombre del remitente', placeholder: 'RRHH Empresa' },
      { key: 'tenantId', label: 'Tenant ID (Azure)', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
    ],
  },
  smtp: {
    platform: 'smtp',
    title: 'Configurar SMTP personalizado',
    description: 'Conecta cualquier servidor de email corporativo via SMTP.',
    fields: [
      { key: 'host', label: 'Servidor SMTP', placeholder: 'smtp.tuempresa.com' },
      { key: 'port', label: 'Puerto', placeholder: '587' },
      { key: 'username', label: 'Usuario', placeholder: 'rrhh@tuempresa.com' },
      { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
      { key: 'accountName', label: 'Nombre del remitente', placeholder: 'RRHH' },
    ],
  },
  whatsapp: {
    platform: 'whatsapp',
    title: 'Conectar WhatsApp Business',
    description: 'Conecta tu número de WhatsApp Business via Meta Cloud API.',
    fields: [
      { key: 'accountName', label: 'Nombre del negocio', placeholder: 'RRHH Empresa' },
      { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '1234567890' },
      { key: 'accessToken', label: 'Access Token de Meta', type: 'password', placeholder: 'EAAxxxxxxxx' },
      { key: 'verifyToken', label: 'Verify Token (webhook)', placeholder: 'mi_verify_token_secreto' },
    ],
  },
  zoom: {
    platform: 'zoom',
    title: 'Conectar Zoom',
    description: 'Autoriza a ConectAr Talento para crear reuniones de Zoom desde la agenda de entrevistas.',
    fields: [
      { key: 'accountEmail', label: 'Email de la cuenta Zoom', placeholder: 'nombre@empresa.com' },
      { key: 'accountName', label: 'Nombre de la cuenta', placeholder: 'Mi cuenta Zoom' },
      { key: 'clientId', label: 'Zoom OAuth Client ID', placeholder: 'AbCdEfGhIj' },
      { key: 'clientSecret', label: 'Zoom OAuth Client Secret', type: 'password', placeholder: '••••••••' },
    ],
  },
}

const JOB_BOARDS: { platform: IntegrationPlatform; name: string; countries: string; color: string; available: boolean }[] = [
  { platform: 'computrabajo', name: 'Computrabajo', countries: 'AR/MX/CO/PE/CL', color: '#E8003D', available: true },
  { platform: 'zonajobs', name: 'ZonaJobs', countries: 'AR', color: '#FF6B00', available: true },
  { platform: 'bumeran', name: 'Bumeran', countries: 'AR/MX/PE', color: '#0066CC', available: true },
  { platform: 'occ', name: 'OCC Mundial', countries: 'MX', color: '#ED1C24', available: true },
  { platform: 'indeed', name: 'Indeed', countries: 'Global', color: '#2164F3', available: true },
  { platform: 'linkedin_jobs', name: 'LinkedIn Jobs', countries: 'Global', color: '#0A66C2', available: true },
  { platform: 'getonboard', name: 'GetOnBoard', countries: 'CL/CO/AR', color: '#00B4A2', available: false },
  { platform: 'infojobs', name: 'InfoJobs', countries: 'AR/ES', color: '#36B37E', available: false },
]

/* ─── main page ──────────────────────────────────────────────── */
export default function IntegrationsPage() {
  const { user } = useUser()
  const [integrations, setIntegrations] = React.useState<Integration[]>([])
  const [activeModal, setActiveModal] = React.useState<string | null>(null)
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  React.useEffect(() => {
    const tenantId = user?.tenantId ?? ''
    if (!tenantId) return
    provider.getIntegrations(tenantId).then((res) => {
      setIntegrations(res.data ?? [])
    })
  }, [provider, user])

  function getByPlatform(platform: IntegrationPlatform) {
    return integrations.filter((i) => i.platform === platform)
  }

  async function handleConnect(platform: IntegrationPlatform, data: Record<string, string>) {
    const tenantId = user?.tenantId ?? ''
    const res = await provider.saveIntegration({
      tenantId,
      platform,
      accountName: data.accountName ?? data.accountEmail ?? platform,
      accountEmail: data.accountEmail ?? data.username,
      status: 'connected',
      metadata: data,
    })
    if (res.data) setIntegrations((prev) => [...prev, res.data!])
    setActiveModal(null)
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Desconectar esta integración?')) return
    await provider.deleteIntegration(id)
    setIntegrations((prev) => prev.filter((i) => i.id !== id))
  }

  function handleReconnect(id: string) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'connected' as IntegrationStatus } : i))
    )
  }

  const plan = user?.plan ?? 'free'
  const limit = PLAN_LIMITS[plan] ?? 1

  function canConnect(platform: IntegrationPlatform) {
    const existing = getByPlatform(platform)
    return existing.length < limit
  }

  /* ── section component ── */
  function Section({
    icon,
    title,
    subtitle,
    children,
  }: {
    icon: React.ReactNode
    title: string
    subtitle?: string
    children: React.ReactNode
  }) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground">
            {icon}
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    )
  }

  function ConnectButton({
    label,
    platformKey,
    disabled,
  }: {
    label: string
    platformKey: string
    disabled?: boolean
  }) {
    return (
      <button
        onClick={() => !disabled && setActiveModal(platformKey)}
        disabled={disabled}
        className="flex items-center gap-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="h-3.5 w-3.5" />
        {label}
      </button>
    )
  }

  const activeConfig = activeModal ? OAUTH_CONFIGS[activeModal] : null

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Integraciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Conectá tus herramientas y publicá desde un solo lugar
          </p>
        </div>
        <div className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
          Plan: <span className="font-semibold capitalize text-foreground">{plan}</span> · Hasta {limit} cuenta{limit > 1 ? 's' : ''} por canal
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* 1. Redes Profesionales */}
        <Section icon={<LinkedInIcon className="h-5 w-5 text-blue-600" />} title="Redes Profesionales" subtitle={`LinkedIn · hasta ${limit} cuenta${limit > 1 ? 's' : ''}`}>
          <div className="space-y-2">
            {getByPlatform('linkedin').map((i) => (
              <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
            ))}
            <ConnectButton
              label="Conectar LinkedIn"
              platformKey="linkedin"
              disabled={!canConnect('linkedin')}
            />
            {!canConnect('linkedin') && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Límite alcanzado. Subí de plan para agregar más cuentas.
              </p>
            )}
          </div>
        </Section>

        {/* 2. Email Corporativo */}
        <Section icon={<Mail className="h-5 w-5 text-gray-500" />} title="Email Corporativo" subtitle={`Gmail, Outlook, SMTP · hasta ${limit} cuenta${limit > 1 ? 's' : ''}`}>
          <div className="space-y-3">
            {(['gmail', 'outlook', 'smtp'] as IntegrationPlatform[]).map((p) => {
              const accounts = getByPlatform(p)
              const labels: Record<string, string> = { gmail: 'Gmail', outlook: 'Outlook / M365', smtp: 'SMTP personalizado' }
              return (
                <div key={p}>
                  {accounts.map((i) => (
                    <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
                  ))}
                  <ConnectButton
                    label={`Conectar ${labels[p]}`}
                    platformKey={p}
                    disabled={!canConnect(p)}
                  />
                </div>
              )
            })}
          </div>
        </Section>

        {/* 3. WhatsApp Business */}
        <Section icon={<MessageCircle className="h-5 w-5 text-green-600" />} title="WhatsApp Business" subtitle={`Meta Cloud API · hasta ${limit} número${limit > 1 ? 's' : ''}`}>
          <div className="space-y-2">
            {getByPlatform('whatsapp').map((i) => (
              <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
            ))}
            <ConnectButton
              label="Conectar WhatsApp Business"
              platformKey="whatsapp"
              disabled={!canConnect('whatsapp')}
            />
            <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 space-y-1">
              <p className="font-medium text-foreground">¿Cómo obtener el Phone Number ID?</p>
              <p>1. Creá una app en <span className="text-primary">developers.facebook.com</span></p>
              <p>2. Agregá el producto "WhatsApp Business"</p>
              <p>3. Copiá el Phone Number ID y el Access Token</p>
            </div>
          </div>
        </Section>

        {/* 4. Videollamadas */}
        <Section icon={<Video className="h-5 w-5 text-purple-600" />} title="Plataformas de Videollamadas" subtitle="Crear reuniones automáticamente al agendar entrevistas">
          <div className="space-y-3">
            {/* Zoom */}
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Zoom</p>
              {getByPlatform('zoom').map((i) => (
                <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
              ))}
              <ConnectButton label="Conectar Zoom" platformKey="zoom" disabled={!canConnect('zoom')} />
            </div>

            {/* Google Meet */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Google Meet</p>
                <p className="text-xs text-muted-foreground">Se activa automáticamente con tu cuenta de Gmail</p>
              </div>
              {getByPlatform('gmail').length > 0 ? (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Activo
                </span>
              ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Conectar Gmail primero
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Microsoft Teams</p>
                <p className="text-xs text-muted-foreground">Se activa automáticamente con tu cuenta de Outlook</p>
              </div>
              {getByPlatform('outlook').length > 0 ? (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Activo
                </span>
              ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Conectar Outlook primero
                </span>
              )}
            </div>
          </div>
        </Section>

        {/* 5. Job Boards LATAM */}
        <Section icon={<Briefcase className="h-5 w-5 text-indigo-600" />} title="Job Boards LATAM" subtitle="Publicá vacantes en múltiples portales con un click">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {JOB_BOARDS.map((jb) => {
              const connected = getByPlatform(jb.platform)
              const isConnected = connected.length > 0
              return (
                <div key={jb.platform} className="border border-border rounded-xl p-3 flex flex-col items-center gap-2 text-center hover:shadow-sm transition-shadow">
                  {/* logo placeholder */}
                  <div
                    className="h-10 w-full rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: jb.color }}
                  >
                    {jb.name.slice(0, 6)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{jb.name}</p>
                    <p className="text-xs text-muted-foreground">{jb.countries}</p>
                  </div>
                  {isConnected ? (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Conectado
                    </span>
                  ) : jb.available ? (
                    <button
                      onClick={() =>
                        setActiveModal(`jobboard_${jb.platform}`)
                      }
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                    >
                      Conectar
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Próximamente
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* upgrade banner for free */}
        {plan === 'free' && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">Desbloqueá más integraciones</p>
                <p className="text-sm text-white/80 mt-0.5">
                  Con el plan Pro conectás hasta 3 cuentas por canal: LinkedIn, Email y WhatsApp simultáneamente.
                </p>
              </div>
              <button className="bg-white text-indigo-600 hover:bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0">
                Ver planes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* modals */}
      {activeModal && activeConfig && (
        <OAuthConnectModal
          {...activeConfig}
          onConnect={(data) => handleConnect(activeConfig.platform, data)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* job board connect modal */}
      {activeModal?.startsWith('jobboard_') && !activeConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Conectar Job Board</h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">API Key</label>
                <input
                  placeholder="Ingresá tu API key"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-3">
                <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Necesitás una cuenta de empleador activa en el portal para obtener tu API key.</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm text-muted-foreground">Cancelar</button>
              <button
                onClick={() => {
                  const platform = activeModal.replace('jobboard_', '') as IntegrationPlatform
                  const jb = JOB_BOARDS.find((j) => j.platform === platform)
                  handleConnect(platform, { accountName: jb?.name ?? platform })
                }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
