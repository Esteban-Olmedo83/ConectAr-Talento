# Google OAuth 2.0 - Guía de Configuración Completa

## Problema: Error 403 "access_denied - conectartalento.com no tiene permiso"

Este error ocurre cuando Google Cloud Console no está configurado correctamente para OAuth 2.0. **La solución es de configuración externa, NO de código.**

El código en ConectAr Talento está correcto:
- ✅ Redirect URI: `${appUrl}/api/oauth/google/callback`
- ✅ Scopes: email, profile, Gmail, Calendar, Drive, Sheets
- ✅ State parameter: validado para seguridad CSRF

---

## 1. Verificación de Variables de Entorno

Primero, verifica que tu `.env.local` tiene las variables correctas:

```env
# URL pública de tu app (OBLIGATORIO)
# Desarrollo: http://localhost:3000
# Producción: https://www.conectartalento.com (o tu dominio)
NEXT_PUBLIC_APP_URL=https://www.conectartalento.com

# Credenciales de Google Cloud Console
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx...
```

### ⚠️ Validaciones críticas:

1. **`NEXT_PUBLIC_APP_URL` debe coincidir exactamente con tu dominio**
   - ✅ Correcto: `https://www.conectartalento.com`
   - ❌ Incorrecto: `https://conectartalento.com` (sin `www`)
   - ❌ Incorrecto: `http://www.conectartalento.com` (sin `https`)

2. **`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` deben ser válidos**
   - Deben venir de Google Cloud Console (no estar vacíos)

---

## 2. Checklist de Google Cloud Console

Accede a [Google Cloud Console](https://console.cloud.google.com/) y sigue este checklist:

### 2.1 Crear o Seleccionar un Proyecto
- [ ] Accede a Google Cloud Console
- [ ] En el selector de proyecto (arriba a la izquierda), crea un nuevo proyecto o selecciona uno existente
- [ ] Nombre sugerido: "ConectAr Talento"

### 2.2 Habilitar APIs Requeridas
Dirígete a **APIs & Services > Library** y habilita estas APIs:

- [ ] **Gmail API** (`https://console.cloud.google.com/marketplace/product/google/gmail.googleapis.com`)
- [ ] **Google Calendar API** (`https://console.cloud.google.com/marketplace/product/google/calendar-json.googleapis.com`)
- [ ] **Google Drive API** (`https://console.cloud.google.com/marketplace/product/google/drive.googleapis.com`)
- [ ] **Google Sheets API** (`https://console.cloud.google.com/marketplace/product/google/sheets.googleapis.com`)

**Pasos para cada API:**
1. Busca el nombre de la API en la Library
2. Haz clic en "Enable"
3. Espera a que se habilite

### 2.3 Configurar OAuth 2.0 Consent Screen

Dirígete a **APIs & Services > OAuth consent screen**

#### Tipo de usuario:
- [ ] Selecciona "External" (para que usuarios de Google puedan conectar)

#### Información del consentimiento:
- [ ] **App name**: "ConectAr Talento"
- [ ] **User support email**: `conectar.rrhh.ar@gmail.com`
- [ ] **Developer contact**: `conectar.rrhh.ar@gmail.com`

#### Scopes (solicitudes de permiso):
1. Haz clic en "Add or Remove Scopes"
2. Busca y selecciona **TODOS** estos scopes (IMPORTANTE):
   - [ ] `email` (userinfo.email)
   - [ ] `profile` (userinfo.profile)
   - [ ] `https://www.googleapis.com/auth/gmail.send` (Gmail)
   - [ ] `https://www.googleapis.com/auth/calendar.events` (Calendar)
   - [ ] `https://www.googleapis.com/auth/drive` (Drive)
   - [ ] `https://www.googleapis.com/auth/spreadsheets` (Sheets)
3. Guarda los cambios

#### Usuarios de prueba (IMPORTANTE):
- [ ] Si estás en modo **Development**, agrega emails de prueba:
  - [ ] `conectar.rrhh.ar@gmail.com`
  - [ ] Tu email personal
  - [ ] Emails de los usuarios que quieran probar

#### Cambiar a "Production" (REQUERIDO PARA PRODUCCIÓN):
- [ ] Cuando vayas a producción, edita el OAuth consent screen
- [ ] En la sección **Publishing status**, haz clic en "PUBLISH APP"
- [ ] Confirma que el estado cambia de "In development" a "Verification requested" o "Published"

**NOTA**: Si el estado es "In development", solo usuarios de prueba agregados pueden usar OAuth.

### 2.4 Crear Credenciales OAuth 2.0

Dirígete a **APIs & Services > Credentials**

#### Crear un nuevo OAuth 2.0 Client ID:
1. Haz clic en **"+ Create Credentials"** > **"OAuth client ID"**
2. **Application type**: Selecciona **"Web application"**
3. **Name**: "ConectAr Talento Web App"

#### Authorized redirect URIs (CRÍTICO):
Este es donde debe ir el URI de redirección. Agrega TODOS estos URIs:

```
http://localhost:3000/api/oauth/google/callback
https://www.conectartalento.com/api/oauth/google/callback
https://conectartalento.com/api/oauth/google/callback
```

**Explicación**:
- Primero es para desarrollo local
- Los otros dos son para producción (con y sin `www`)
- Asegúrate de usar EXACTAMENTE los URIs que coincidan con tu `NEXT_PUBLIC_APP_URL`

Guarda y te mostrará:
- [ ] **Client ID**: Copia esto a `GOOGLE_CLIENT_ID` en `.env.local`
- [ ] **Client Secret**: Copia esto a `GOOGLE_CLIENT_SECRET` en `.env.local`

---

## 3. Flujo de Validación

Después de configurar Google Cloud, verifica que todo funciona:

### 3.1 En Desarrollo Local (localhost:3000)

```bash
# 1. Asegúrate de que .env.local tiene estos valores:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx...

# 2. Ejecuta el servidor
npm run dev

# 3. Ve a http://localhost:3000/login
# 4. Intenta hacer clic en "Continuar con Google"
# 5. Deberías ver la pantalla de consentimiento de Google
```

### 3.2 En Producción (www.conectartalento.com)

```bash
# 1. Asegúrate de que .env.local en Vercel tiene:
# NEXT_PUBLIC_APP_URL=https://www.conectartalento.com
# GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx...

# 2. Haz un git push a la rama de deploy
git push -u origin claude/youthful-noether-uihFY

# 3. Vercel automáticamente despliega
# 4. Ve a https://www.conectartalento.com/login
# 5. Intenta hacer clic en "Continuar con Google"
```

---

## 4. Tabla de Diagnóstico de Errores

Si aún ves el error 403, usa esta tabla para diagnosticar:

| Error | Causa Probable | Solución |
|-------|-----------------|----------|
| **403: access_denied** | OAuth consent screen no está en "Published" O usuario no está en lista de prueba | ¿Estás en modo Development? Agrega tu email como usuario de prueba. ¿Estás en Producción? Publica el consent screen |
| **Redirect URI mismatch** | El `NEXT_PUBLIC_APP_URL` no coincide con los URIs en Google Cloud Console | Verifica que coincidan exactamente (incluyendo https:// y www) |
| **Client ID or Secret invalid** | Las variables de entorno son incorrectas o están vacías | Copia nuevamente desde Google Cloud Console |
| **Blank screen after Google login** | Estado CSRF inválido (error de cookie) | Limpia cookies del navegador: DevTools > Storage > Cookies |
| **"state mismatch" error** | Cookie de estado se perdió entre redirects | Verifica que `sameSite: 'none'` esté en el código (ya está configurado) |

---

## 5. Verificación de Código (Por Referencia)

El código en ConectAr Talento está correctamente configurado:

### `/src/app/api/oauth/google/route.ts` (Inicio de OAuth)
```typescript
// ✅ Correcto: redirect_uri se construye dinámicamente
const redirectUri = `${appUrl}/api/oauth/google/callback`

// ✅ Correcto: scopes incluyen email, profile, y permisos de workspace
const params = new URLSearchParams({
  response_type: 'code',
  client_id: clientId,
  redirect_uri: redirectUri,  // DEBE coincidir con Google Cloud Console
  scope: [
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ].join(' '),
  access_type: 'offline',
  prompt: 'consent',
})
```

### `/src/app/api/oauth/google/callback/route.ts` (Callback)
```typescript
// ✅ Correcto: redirect_uri coincide exactamente
const redirectUri = `${appUrl}/api/oauth/google/callback`

// ✅ Correcto: state se valida contra cookie
const storedState = request.cookies.get('oauth_state_google')?.value
if (!state || !storedState || state !== storedState) {
  // Falla si no coincide
}
```

---

## 6. Checklist Final de Implementación

Antes de decir que OAuth funciona, completa este checklist:

### Configuración de Google Cloud Console
- [ ] Proyecto creado en Google Cloud Console
- [ ] APIs habilitadas: Gmail, Calendar, Drive, Sheets
- [ ] OAuth consent screen configurado con app name y scopes correctos
- [ ] Si es Development: usuarios de prueba agregados
- [ ] Si es Production: consent screen publicado (status = "Published")
- [ ] OAuth 2.0 Client ID creado (tipo: Web application)
- [ ] Redirect URIs agregados (http://localhost:3000/api/oauth/google/callback + tu dominio)

### Configuración de Variables de Entorno
- [ ] `.env.local` o Vercel tiene `NEXT_PUBLIC_APP_URL` correcto
- [ ] `.env.local` o Vercel tiene `GOOGLE_CLIENT_ID` copiado de Google Cloud Console
- [ ] `.env.local` o Vercel tiene `GOOGLE_CLIENT_SECRET` copiado de Google Cloud Console
- [ ] Sin errores de sintaxis en `.env.local`

### Validación Local
- [ ] `npm run dev` inicia sin errores
- [ ] Accedes a `http://localhost:3000/login`
- [ ] Haces clic en "Continuar con Google"
- [ ] Ves la pantalla de consentimiento de Google (no error 403)
- [ ] Autenticación completa y regresas a la app

### Validación en Producción
- [ ] Cambias `NEXT_PUBLIC_APP_URL` a `https://www.conectartalento.com`
- [ ] Haces `git push` a la rama de deploy
- [ ] Vercel despliega exitosamente (sin errores de TypeScript)
- [ ] Accedes a `https://www.conectartalento.com/login`
- [ ] OAuth funciona sin error 403

---

## 7. Pasos Rápidos (TL;DR)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea proyecto: "ConectAr Talento"
3. Habilita APIs: Gmail, Calendar, Drive, Sheets
4. Configura OAuth consent screen con app name y scopes
5. Crea OAuth 2.0 Client ID (Web application)
6. Agrega Redirect URIs:
   - `http://localhost:3000/api/oauth/google/callback`
   - `https://www.conectartalento.com/api/oauth/google/callback`
   - `https://conectartalento.com/api/oauth/google/callback`
7. Copia `Client ID` → `GOOGLE_CLIENT_ID` en `.env.local`
8. Copia `Client Secret` → `GOOGLE_CLIENT_SECRET` en `.env.local`
9. Prueba en local (`npm run dev`)
10. Despliega a Vercel

---

## 8. Contacto y Soporte

Si aún tienes errores después de seguir esta guía:

1. **Verifica los logs de la app**:
   - Desarrollo: Consola de DevTools (F12) + terminal de `npm run dev`
   - Producción: Vercel Dashboard > Deployments > Logs

2. **Verifica Google Cloud Console**:
   - Dirígete a **APIs & Services > Credentials**
   - Haz clic en tu Client ID
   - Verifica que los Redirect URIs exactamente coincidan con tu error

3. **Contacta al admin**:
   - Email: `conectar.rrhh.ar@gmail.com`
   - Incluye screenshot del error y el `NEXT_PUBLIC_APP_URL` que usas

---

**Última actualización**: 2026-07-13  
**Versión de ConectAr Talento**: 1.0  
**Status del código**: ✅ Código está correcto, el problema es de configuración externa.
