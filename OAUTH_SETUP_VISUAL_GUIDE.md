# OAuth Google Setup - Guía Visual

## Problema: Error 403 access_denied

```
┌─────────────────────────────────────────────────────────┐
│  Usuario ve en navegador:                               │
│                                                         │
│  "Error 403: access_denied                             │
│   conectartalento.com no tiene permiso                 │
│   para acceder a tu cuenta Google"                      │
└─────────────────────────────────────────────────────────┘
         ↑
         │ Causa: Google Cloud Console no está configurado
         │
         └─→ No es problema del código
             Es problema de configuración externa
```

---

## Solución: 3 Archivos de Configuración Necesarios

### 1. `.env.local` (en tu máquina local) o Vercel Environment (en producción)

```
┌──────────────────────────────────────────────────────────┐
│  ARCHIVO: .env.local                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  NEXT_PUBLIC_APP_URL=https://www.conectartalento.com   │
│  ↑                                                       │
│  └─ DEBE SER TU DOMINIO EXACTO (con https://)           │
│                                                          │
│  GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com │
│  ↑                                                       │
│  └─ COPIADO DE Google Cloud Console                     │
│                                                          │
│  GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx           │
│  ↑                                                       │
│  └─ COPIADO DE Google Cloud Console                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2. Google Cloud Console - OAuth 2.0 Credentials

```
┌──────────────────────────────────────────────────────────┐
│  LUGAR: console.cloud.google.com                        │
│         → APIs & Services                               │
│         → Credentials                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [OAuth 2.0 Client ID]                                  │
│  ├─ Application type: "Web application" ✅              │
│  ├─ Name: "ConectAr Talento Web App"                   │
│  └─ Authorized redirect URIs:                           │
│     ├─ http://localhost:3000/api/oauth/google/callback │
│     └─ https://www.conectartalento.com/...callback    │
│        ↑                                                 │
│        └─ DEBE COINCIDIR CON NEXT_PUBLIC_APP_URL       │
│                                                          │
│  Resultados:                                            │
│  ├─ Client ID → Copia a GOOGLE_CLIENT_ID               │
│  └─ Client Secret → Copia a GOOGLE_CLIENT_SECRET       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. Google Cloud Console - OAuth Consent Screen

```
┌──────────────────────────────────────────────────────────┐
│  LUGAR: console.cloud.google.com                        │
│         → APIs & Services                               │
│         → OAuth consent screen                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Settings]                                             │
│  ├─ App name: "ConectAr Talento" ✅                     │
│  ├─ User support email: conectar.rrhh.ar@gmail.com ✅  │
│  └─ Developer contact: conectar.rrhh.ar@gmail.com ✅   │
│                                                          │
│  [Scopes]                                               │
│  ├─ email ✅                                            │
│  ├─ profile ✅                                          │
│  ├─ Gmail ✅                                            │
│  ├─ Calendar ✅                                         │
│  ├─ Drive ✅                                            │
│  └─ Sheets ✅                                           │
│                                                          │
│  [Publishing Status]                                    │
│  ├─ Si es "In development":                            │
│  │  └─ Agrega emails de prueba                          │
│  └─ Si es "Production":                                 │
│     └─ Status = "Published" ✅                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Flujo de Sincronización

```
Tu App (ConectAr Talento)
         ↓
    .env.local
    ├─ NEXT_PUBLIC_APP_URL
    ├─ GOOGLE_CLIENT_ID
    └─ GOOGLE_CLIENT_SECRET
         ↓
  Código OAuth genera redirect_uri ← DEBE COINCIDIR
         ↓
  Google Cloud Console
  ├─ Client ID
  ├─ Authorized redirect URIs ← DEBE COINCIDIR CON REDIRECT_URI
  └─ Scopes
         ↓
  Google OAuth Server
  ├─ Valida que redirect_uri está en lista autorizada
  ├─ Valida que client_id es válido
  ├─ Valida que user consiente (consent screen)
  └─ Autoriza o rechaza (Error 403 si algo falla)
```

---

## Checklist de Sincronización (PRE-IMPLEMENTACIÓN)

```
┌─────────────────────────────────────────────────────────┐
│  PASO 1: Variables de Entorno                          │
├─────────────────────────────────────────────────────────┤
│  [ ] .env.local tiene NEXT_PUBLIC_APP_URL              │
│  [ ] .env.local tiene GOOGLE_CLIENT_ID                 │
│  [ ] .env.local tiene GOOGLE_CLIENT_SECRET             │
│  [ ] Si estás en Vercel: Variables copiadas también    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  PASO 2: Google Cloud Console - Credentials            │
├─────────────────────────────────────────────────────────┤
│  [ ] Proyecto creado/seleccionado                      │
│  [ ] OAuth 2.0 Client ID existe (tipo: Web app)        │
│  [ ] Redirect URIs incluyen:                            │
│      - http://localhost:3000/api/oauth/google/callback │
│      - https://www.conectartalento.com/api/oauth/...   │
│  [ ] Client ID copiado a GOOGLE_CLIENT_ID              │
│  [ ] Client Secret copiado a GOOGLE_CLIENT_SECRET      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  PASO 3: Google Cloud Console - OAuth Consent Screen   │
├─────────────────────────────────────────────────────────┤
│  [ ] App name = "ConectAr Talento"                     │
│  [ ] Scopes agregados: email, profile, Gmail, etc.     │
│  [ ] Si es Development: test users agregados           │
│  [ ] Si es Production: status = Published              │
│  [ ] APIs habilitadas: Gmail, Calendar, Drive, Sheets  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  PASO 4: Validación Local                              │
├─────────────────────────────────────────────────────────┤
│  [ ] npm run dev inicia sin errores                     │
│  [ ] Accedes a http://localhost:3000/login             │
│  [ ] Haces clic en "Continuar con Google"              │
│  [ ] NO ves error 403 (ves pantalla de consentimiento) │
│  [ ] Login funciona completo                           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  PASO 5: Validación en Producción                      │
├─────────────────────────────────────────────────────────┤
│  [ ] Cambias NEXT_PUBLIC_APP_URL a dominio real        │
│  [ ] Vercel Environment Variables actualizadas         │
│  [ ] Deploy a Vercel exitoso (npm run build pasa)      │
│  [ ] Accedes a https://www.conectartalento.com/login   │
│  [ ] OAuth funciona sin error 403                      │
│  [ ] Otros usuarios pueden hacer login                 │
└─────────────────────────────────────────────────────────┘
```

---

## Diagrama de Sincronización Correcta vs Incorrecta

### ✅ CORRECTO: Redirect URI sincronizado

```
App (.env.local):
  NEXT_PUBLIC_APP_URL = https://www.conectartalento.com
                        ↓
  redirect_uri generada = https://www.conectartalento.com/api/oauth/google/callback
                        ↓
Google Cloud Console:
  Authorized redirect URIs = [
    https://www.conectartalento.com/api/oauth/google/callback ✅ COINCIDE
  ]
                        ↓
Google OAuth Server:
  ✅ Valida que redirect_uri está autorizado
  ✅ Permitir acceso
```

### ❌ INCORRECTO: Redirect URI NO sincronizado

```
App (.env.local):
  NEXT_PUBLIC_APP_URL = https://www.conectartalento.com
                        ↓
  redirect_uri generada = https://www.conectartalento.com/api/oauth/google/callback
                        ↓
Google Cloud Console:
  Authorized redirect URIs = [
    https://conectartalento.com/api/oauth/google/callback  ❌ SIN www
  ]
                        ↓
Google OAuth Server:
  ❌ Valida que redirect_uri está autorizado
  ❌ NO COINCIDE
  ❌ Rechaza acceso
  ❌ Usuario ve: "Error 403: access_denied"
```

---

## Resumen Visual de Archivos Necesarios

```
Tu Proyecto
│
├─ .env.local (o Vercel Env Vars)
│  ├─ NEXT_PUBLIC_APP_URL ← SINCRONIZAR
│  ├─ GOOGLE_CLIENT_ID ← DE GOOGLE CLOUD
│  └─ GOOGLE_CLIENT_SECRET ← DE GOOGLE CLOUD
│
├─ src/app/api/oauth/google/
│  ├─ route.ts (CÓDIGO CORRECTO ✅)
│  └─ callback/route.ts (CÓDIGO CORRECTO ✅)
│
└─ Google Cloud Console
   ├─ OAuth 2.0 Client ID (Web app)
   │  ├─ Client ID ← COPIA A .env.local
   │  ├─ Client Secret ← COPIA A .env.local
   │  └─ Authorized redirect URIs ← SINCRONIZAR CON .env.local
   │
   └─ OAuth Consent Screen
      ├─ App name
      ├─ Scopes
      └─ Publishing status
```

---

## Tabla Rápida de Valores

| Valor | Dónde va | Dónde viene | Formato |
|-------|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | `.env.local` | Tu dominio real | `https://www.conectartalento.com` |
| `GOOGLE_CLIENT_ID` | `.env.local` | Google Cloud Console > Credentials | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `.env.local` | Google Cloud Console > Credentials | `GOCSPX-xxxxxxxxxxxxxxxx` |
| `redirect_uri` | Google Cloud Console > Authorized redirect URIs | Generado por el código | `https://www.conectartalento.com/api/oauth/google/callback` |

---

## Si Falla: Matriz de Diagnóstico

```
Error 403: access_denied
│
├─ ¿Estás en "In development"?
│  └─ Sí → ¿Tu email está en "Test users"?
│          ├─ Sí → Problema en otro lugar (ver abajo)
│          └─ No → AGRÉGALO en OAuth Consent Screen
│
├─ ¿Estás en Producción?
│  └─ Sí → ¿El status es "Published"?
│          ├─ Sí → Problema en otro lugar (ver abajo)
│          └─ No → PUBLICA el consent screen
│
├─ ¿El redirect_uri es exacto?
│  ├─ App genera: https://www.conectartalento.com/api/oauth/google/callback
│  └─ Google autoriza: https://www.conectartalento.com/api/oauth/google/callback
│     ├─ Sí → Problema en otro lugar (ver abajo)
│     └─ No → SINCRONIZA en Google Cloud Console
│
└─ Otros problemas:
   ├─ ¿GOOGLE_CLIENT_ID está vacío?
   ├─ ¿GOOGLE_CLIENT_SECRET está vacío?
   ├─ ¿Copiaste valores incorrectamente?
   └─ → Revisa GOOGLE_CLOUD_SETUP.md para más detalles
```

---

## Documentos de Referencia

1. **GOOGLE_CLOUD_SETUP.md** - Guía completa paso-a-paso
2. **OAUTH_QUICK_CHECKLIST.md** - Checklist de 5 minutos
3. **OAUTH_CODE_VALIDATION.md** - Validación técnica del código
4. **OAUTH_SETUP_VISUAL_GUIDE.md** - Este documento

---

**Fecha**: 2026-07-13  
**Conclusión**: El código está correcto. Sigue los pasos en GOOGLE_CLOUD_SETUP.md para resolver el error 403.
