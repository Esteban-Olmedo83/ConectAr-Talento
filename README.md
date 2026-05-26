# ConectAr Talento 🚀

**"El talento que buscás, conectado en un solo lugar."**

ATS (Applicant Tracking System) con IA para reclutadores latinoamericanos. Plataforma SaaS standalone, web + mobile (PWA), con soporte de IA vía Groq (Llama) y Google Gemini.

---

## ✨ Funcionalidades del sistema

### 🏗️ Pipeline de Reclutamiento
- Vista agrupada por cliente con pestañas de etapa (Nuevas Vacantes → Contratado)
- Drag & drop de candidatos entre etapas
- Botones de decisión **Avanzar / Rechazar** en cada tarjeta
- Sub-estados de descarte: *A considerar*, *Descartar CV*
- **Razones de rechazo** configurables (no apto perfil, fuera rango salarial, candidato declinó, decisión empresa, otro)
- Resumen del proceso al cerrar una vacante
- Acciones bloqueadas en etapa *Contratado* para evitar movimientos accidentales
- Sugerencia de etapa siguiente post-comunicación
- Filtro de clientes activos (vacantes de clientes inactivos no aparecen)

### 👥 Candidatos
- Carga de CV con extracción automática por IA: nombre, email, teléfono, skills, foto
- Score ATS calculado por IA al subir el CV
- Edición completa del perfil (foto, datos, skills, educación, notas)
- Filtros: cliente, fuente (LinkedIn, Indeed, Portal, Referido…), score ATS, búsqueda libre
- KPIs dinámicos que respetan los filtros activos
- Solo muestra candidatos de clientes activos

### 📋 Vacantes
- Formulario completo: rubro, perfil, modalidad, prioridad, salario, fecha de cierre
- Generación de descripción de puesto por IA
- Asignación directa de candidatos desde la ficha de la vacante
- Estado cerrado con resumen del proceso
- Filtro de clientes activos

### 🏢 Clientes (Multi-cliente)
- Gestión completa de empresas clientes con logo, contacto, dirección
- **Sistema Activo / Inactivo**: desactivar preserva historial, eliminar borra definitivamente
- **Historial de Clientes**: pestaña con línea de tiempo de eventos (creación, desactivación, reactivación), duración del servicio en días, botón de reactivación
- Eventos de auditoría registrados automáticamente en cada acción
- Dirección de entrevista y detalles de llegada para candidatos
- Email de reclutamiento por cliente
- Ficha de cliente con pestañas: Vacantes activas, Candidatos directos
- Al eliminar un cliente: sus vacantes se cierran y sus candidatos se archivan (preservando el historial de postulaciones)
- Eventos propagados a todo el sistema mediante event bus (`client:updated`)

### 📅 Entrevistas
- Agenda en dos vistas: **Agenda** (listado temporal) y **Por Vacante** (agrupado por proceso)
- Scorecard con sliders (habilidades técnicas, comunicación, fit cultural)
- Recomendación: Avanzar / Considerar / Rechazar
- Informe ejecutivo generado por IA (resumen + puntos fuertes/débiles)
- Exportación de informe a **PDF** (2 páginas, layout moderno)
- Plataformas: Zoom, Google Meet, Teams, Presencial
- Filtro por cliente

### 📊 Dashboard
- KPIs en tiempo real: candidatos activos, vacantes abiertas, entrevistas programadas, tasa de conversión
- **Indicador de clientes inactivos** con banner de alerta
- Funnel de reclutamiento (Recharts)
- Actividad reciente del pipeline
- Fuentes de candidatos (gráfico de torta)
- Filtro global por cliente
- Recarga automática en foco de pestaña y eventos del sistema

### 💼 Banco de Talentos
- Vista de todos los candidatos históricos (incluyendo archivados)
- Reactivación de candidatos archivados
- Filtros: rubro, experiencia, skills
- Edición de perfil desde el banco
- Alineación visual con el resto del sistema

### 💬 Templates de Comunicación
- 10 templates por defecto (LinkedIn / Email / WhatsApp)
- Editor con generación de texto por IA
- Variables dinámicas: nombre candidato, vacante, empresa, fecha entrevista, etc.
- Autocomplete de variables con selector visual
- Autocompletado de datos de entrevista al seleccionar candidato/vacante

### 🔔 Notificaciones
- Sistema de alertas configurables por tipo de evento
- Notificaciones en tiempo real de cambios en el pipeline
- Todas las notificaciones activas por defecto

### 🤖 Integraciones de IA

| Proveedor | Uso | Costo |
|-----------|-----|-------|
| **Groq (Llama 3.3)** | Análisis de CV, generación de JD, informe de entrevista | $0 (gratis) |
| **Google Gemini 2.5 Flash** | Fallback / generación de mensajes | $0 (free tier) |

```
POST /api/ai/analyze-cv      → Analiza CV, extrae skills, calcula ATS score
POST /api/ai/generate-jd     → Genera descripción de puesto + LinkedIn post
POST /api/ai/generate-report → Genera informe ejecutivo post-entrevista
```

La API key de Groq se configura por usuario en Ajustes y se persiste en Supabase.

### 🔌 Integraciones externas (configuradas)
- LinkedIn, Gmail, Outlook, SMTP
- WhatsApp Business (wa.me + webhook)
- Zoom, Google Meet, Microsoft Teams
- Job boards LATAM: Computrabajo, ZonaJobs, Bumeran, OCC, InfoJobs, Indeed, LinkedIn Jobs, GetOnBoard

### 👤 Perfiles de Puestos
- Biblioteca de 100+ perfiles × 10 rubros LATAM (IT, Marketing, Finanzas, RRHH, Ventas…)
- Gestión de perfiles personalizados por tenant
- Asociación de rubro y perfil en cada vacante para scoring preciso

### ⚙️ Panel de Administración
- Gestión de tenants (multi-empresa)
- Registro de cambios (changelog)
- Migraciones de base de datos
- Configuración de planes y límites

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16** App Router + TypeScript strict |
| Estilos | **Tailwind v4** + Radix UI headless |
| Base de datos | **Supabase** (PostgreSQL + RLS multi-tenant) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (CVs, logos, avatares) |
| IA | Groq API (Llama 3.3) + Google Gemini 2.5 Flash |
| Drag & Drop | @dnd-kit |
| Gráficos | Recharts |
| PDF | jsPDF |
| Formularios | react-hook-form + zod |
| Abstracción de datos | `DataProvider` interface (LocalStorage / Google Sheets / Supabase) |

---

## 🗄️ Base de datos (Supabase)

Tablas principales con RLS multi-tenant por `tenant_id`:

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios y configuración (plan, API keys) |
| `clients` | Clientes con estado activo/inactivo |
| `client_events` | Auditoría de eventos de cliente |
| `vacancies` | Vacantes por cliente |
| `candidates` | Candidatos con CV y score ATS |
| `applications` | Postulaciones (candidato × vacante × etapa) |
| `interviews` | Entrevistas programadas |
| `scorecards` | Evaluaciones post-entrevista |
| `message_templates` | Templates de comunicación |
| `integrations` | Cuentas conectadas |
| `job_rubros` | Rubros personalizados |
| `custom_job_profiles` | Perfiles de puesto personalizados |

---

## 🚀 Deploy

### Variables de entorno

Crear `.env.local` (copiar desde `.env.example`):

```bash
cp .env.example .env.local
```

| Variable | Descripción | Obligatorio |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | ✅ Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | ✅ Sí |
| `GROQ_API_KEY` | Groq AI (análisis CV, informes) | ✅ Sí |
| `GEMINI_API_KEY` | Google AI Studio (fallback) | Opcional |
| `GOOGLE_CLIENT_ID` | OAuth Google Drive | Opcional |
| `WHATSAPP_VERIFY_TOKEN` | Webhook WhatsApp Business | Opcional |

### Desarrollo local

```bash
npm install
cp .env.example .env.local
# Completar variables en .env.local
npm run dev
# → http://localhost:3000
```

### Producción (Vercel)

```bash
npm run build   # verificación
# Push a main → Vercel auto-deploy
```

---

## 📱 Credenciales de prueba

Ir a `/signup` y crear una cuenta nueva. O usar:
- **Email:** `demo@conectartalento.com`
- **Contraseña:** `demo1234`

---

## 💰 Modelo de negocio

| Plan | Precio | Target |
|------|--------|--------|
| **Free** | $0/mes | Freelancers, prueba |
| **Starter** | $29 USD/mes | Startups |
| **Pro** | $79 USD/mes | PYMEs, agencias |
| **Business** | $149 USD/mes | Empresas medianas |

**Early Adopters (primeros 6 meses): 50% OFF en todos los planes.**

---

## 🗺️ Roadmap

- [x] Pipeline de reclutamiento con drag & drop y etapas
- [x] Candidatos con análisis de CV por IA y score ATS
- [x] Vacantes con generación de JD por IA
- [x] Entrevistas con scorecard e informe PDF por IA
- [x] Templates de comunicación (LinkedIn / Email / WhatsApp)
- [x] Dashboard con KPIs en tiempo real y funnel de conversión
- [x] Sistema multi-cliente con historial y auditoría
- [x] Clientes activos/inactivos con filtrado global
- [x] Banco de Talentos (candidatos históricos + reactivación)
- [x] Integraciones (LinkedIn, Email, WhatsApp, Zoom, Job Boards)
- [x] Perfiles de puestos: 100+ perfiles × 10 rubros LATAM
- [x] Supabase multi-tenant con RLS
- [x] Panel de administración de tenants
- [ ] OAuth real: LinkedIn, Gmail, Microsoft 365
- [ ] WhatsApp Business webhook en producción
- [ ] Publicación automática en job boards LATAM
- [ ] App nativa iOS/Android (Capacitor)
- [ ] Google Sheets como base de datos (plan Free)

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── (app)/               # Rutas protegidas (requieren login)
│   │   ├── pipeline/        # Pipeline de reclutamiento
│   │   ├── candidates/      # Base de candidatos con filtros
│   │   ├── vacancies/       # Gestión de vacantes
│   │   ├── interviews/      # Agenda de entrevistas
│   │   ├── clients/         # Clientes + historial de auditoría
│   │   ├── talent-pool/     # Banco de Talentos
│   │   ├── templates/       # Templates de comunicación
│   │   ├── integrations/    # Cuentas conectadas
│   │   ├── reports/         # Analytics y gráficos
│   │   ├── settings/        # Configuración de usuario y API keys
│   │   ├── job-profiles/    # Perfiles de puestos LATAM
│   │   └── admin/           # Panel de administración
│   ├── (auth)/              # Login + Signup
│   ├── api/ai/              # API routes IA (analyze-cv, generate-jd, generate-report)
│   └── page.tsx             # Landing page pública
├── components/
│   ├── layout/              # AppLayout + Sidebar
│   ├── recruitment/         # Componentes ATS
│   └── ui/                  # Design system (Radix UI + modales arrastrables)
├── lib/
│   ├── providers/           # DataProvider (LocalStorage / Supabase / Google Sheets)
│   └── skills/              # Biblioteca de 100+ perfiles LATAM
└── types/                   # TypeScript types centralizados
```

---

*© 2026 ConectAr Talento — Hecho con ❤️ en Latinoamérica*
