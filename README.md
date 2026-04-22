# ConectAr Talento 🚀

**"El talento que buscás, conectado en un solo lugar."**

ATS (Applicant Tracking System) con IA para reclutadores latinoamericanos. Plataforma SaaS standalone, web + mobile (PWA), con Gemini AI gratis.

---

## ✨ Features

| Módulo | Descripción |
|--------|-------------|
| 🏗️ **Pipeline Kanban** | Drag & drop con scoring ATS por IA. 5 etapas de reclutamiento |
| 👥 **Candidatos** | Upload de CV → análisis automático → score ATS en segundos |
| 📋 **Vacantes** | Descripción generada por IA, gestión de skills, filtros avanzados |
| 📅 **Entrevistas** | Agenda, scorecard con sliders, informe ejecutivo por IA, PDF export |
| 💬 **Templates** | 10 templates default (LinkedIn/Email/WhatsApp), editor con IA |
| 🔌 **Integraciones** | LinkedIn, Gmail, Outlook, WhatsApp Business, Zoom, Job boards LATAM |
| 📊 **Informes** | Dashboard Recharts: funnel, fuentes, ATS score, timeline |
| 🌐 **Landing Page** | Hero, features, pricing, testimonials — lista para producción |
| 📚 **Skills Library** | 100 perfiles × 10 rubros LATAM (IT, Marketing, Finanzas, RRHH...) |

---

## 🛠️ Stack

- **Next.js 16** App Router + TypeScript strict
- **Tailwind v4** + Radix UI headless components
- **Google Gemini 2.5 Flash** — IA gratis (500 req/día)
- **@dnd-kit** — drag & drop para el Pipeline Kanban
- **Recharts** — gráficos del dashboard
- **jsPDF** — exportación de informes a PDF
- **LocalStorageProvider** — BD local (sin servidor), con abstracción para Google Sheets / Supabase
- **react-hook-form + zod** — validación de formularios

---

## 🚀 Deploy rápido

### Opción 1 — Un comando (recomendado)

```bash
cd "E:\ConectAr HR\conectar-talento"
bash deploy.sh
```

### Opción 2 — Manual con Vercel CLI

```bash
cd "E:\ConectAr HR\conectar-talento"

# Build de verificación
npm run build

# Deploy a producción
npx vercel --prod --scope esteban-olmedo83s-projects --yes --name conectar-talento
```

### Opción 3 — Vercel Dashboard (sin CLI)

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar desde GitHub (crear repo primero)
3. Framework preset: **Next.js**
4. Agregar env vars (ver abajo)
5. Deploy

---

## 🔑 Variables de entorno

Crear `.env.local` en la raíz del proyecto (copiar desde `.env.example`):

```bash
cp .env.example .env.local
```

| Variable | Descripción | Obligatorio |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | Google AI Studio → [obtener gratis](https://aistudio.google.com/app/apikey) | ✅ Sí |
| `GOOGLE_CLIENT_ID` | OAuth para Google Drive como BD | Opcional |
| `NEXT_PUBLIC_SUPABASE_URL` | Para plan Business/Enterprise | Opcional |
| `WHATSAPP_VERIFY_TOKEN` | Webhook de WhatsApp Business | Opcional |

---

## 💻 Desarrollo local

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Editar .env.local con tu GEMINI_API_KEY

# Servidor de desarrollo
npm run dev
# → http://localhost:3000

# Build de producción
npm run build
npm run start
```

### Flujo fijo de publicacion

Trabajar siempre desde esta carpeta:

```bash
E:\ConectAr Talento\conectar-talento
```

Opcion manual:

```bash
git add .
git commit -m "feat: tu cambio"
git push origin main
```

Opcion rapida con script:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-main.ps1 "feat: tu cambio"
```

Despues del `git push`, GitHub recibe el commit y Vercel dispara el deploy automatico desde `main`.

---

## 📱 Credenciales de prueba

Al arrancar la app, ir a `/signup` y crear una cuenta. O usar:
- **Email:** `demo@conectartalento.com`
- **Contraseña:** `demo1234`

El pipeline se pre-carga con datos de demostración automáticamente.

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

- [x] Pipeline Kanban + Candidatos + Vacantes + Entrevistas
- [x] Templates de comunicación (LinkedIn/Email/WhatsApp)
- [x] Integraciones (LinkedIn, Email, WhatsApp Business, Zoom, Job Boards)
- [x] Dashboard de informes (Recharts + PDF export)
- [x] Landing page de producción
- [x] Skills library: 100 perfiles × 10 rubros LATAM
- [ ] OAuth real: LinkedIn, Gmail, Microsoft 365
- [ ] WhatsApp Business webhook en producción
- [ ] Google Sheets como base de datos (plan Free)
- [ ] Supabase multi-tenant (plan Business)
- [ ] App nativa iOS/Android (Capacitor)
- [ ] Publicación en job boards LATAM (Computrabajo, ZonaJobs, Bumeran)

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── (app)/               # Rutas protegidas (requieren login)
│   │   ├── pipeline/        # Kanban principal
│   │   ├── candidates/      # Base de datos de candidatos
│   │   ├── vacancies/       # Gestión de vacantes
│   │   ├── interviews/      # Agenda de entrevistas
│   │   ├── templates/       # Templates de comunicación
│   │   ├── integrations/    # Cuentas conectadas
│   │   └── reports/         # Analytics
│   ├── (auth)/              # Login + Signup
│   ├── api/ai/              # API routes Gemini (analyze-cv, generate-jd, generate-report)
│   └── page.tsx             # Landing page pública
├── components/
│   ├── layout/              # AppLayout + Sidebar
│   ├── recruitment/         # Componentes ATS
│   └── ui/                  # Design system (Radix UI)
├── lib/
│   ├── providers/           # DataProvider (localStorage / Google Sheets / Supabase)
│   └── skills/              # 100 perfiles LATAM
└── types/                   # TypeScript types
```

---

## 🤖 Integraciones de IA

Todos los endpoints usan **Gemini 2.5 Flash** via fetch directo (sin SDK):

```
POST /api/ai/analyze-cv      → Analiza CV, extrae skills, calcula ATS score
POST /api/ai/generate-jd     → Genera descripción de puesto + LinkedIn post
POST /api/ai/generate-report → Genera informe ejecutivo post-entrevista
```

**Costo: $0** dentro del free tier (500 requests/día).

---

*© 2026 ConectAr Talento — Hecho con ❤️ en Latinoamérica*
