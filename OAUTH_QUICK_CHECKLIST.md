# OAuth Google - Checklist Rápido

## ⚡ 5 Minutos para Resolver el Error 403

### Paso 1: Verificar Variables de Entorno (30 segundos)

```bash
# En .env.local o en Vercel Environment Variables, verifica:
echo "NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:20}..."
```

**Debe verse así:**
```
NEXT_PUBLIC_APP_URL: https://www.conectartalento.com
GOOGLE_CLIENT_ID: 123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET: GOCSPX-xxxxxxxxxxxxx
```

---

### Paso 2: Ir a Google Cloud Console (1 minuto)

1. Abre [console.cloud.google.com](https://console.cloud.google.com/)
2. Selecciona tu proyecto "ConectAr Talento"
3. Ve a **APIs & Services > Credentials**

---

### Paso 3: Verificar Redirect URI (1 minuto)

1. Haz clic en tu **OAuth 2.0 Client ID**
2. En "Authorized redirect URIs", verifica que aparezca:
   - ✅ Si estás en local: `http://localhost:3000/api/oauth/google/callback`
   - ✅ Si estás en producción: `https://www.conectartalento.com/api/oauth/google/callback`

**Si NO aparece**: Haz clic en "Edit" y agrégalo (paso 4)

---

### Paso 4: Agregar Redirect URI Correcto (1 minuto)

Si no aparece en Paso 3:

1. Haz clic en "Edit"
2. En "Authorized redirect URIs", haz clic en "+ Add URI"
3. Copia-pega el URI correcto:
   - Desarrollo: `http://localhost:3000/api/oauth/google/callback`
   - Producción: `https://www.conectartalento.com/api/oauth/google/callback`
4. Haz clic en "Save"

---

### Paso 5: Verificar OAuth Consent Screen (1 minuto)

1. Ve a **APIs & Services > OAuth consent screen**
2. **Si dice "In development"**:
   - Agrega tu email en "Test users"
   - Solo tú podrás hacer login con Google
3. **Si necesitas que otros hagan login**:
   - Haz clic en "Publish App"
   - El status debe cambiar a "Published" o "Verification requested"

---

## 🐛 Tabla de Errores Comunes

| Error | Solución |
|-------|----------|
| **403: access_denied** | Estás en "In development"? Agrega tu email como test user |
| **Redirect URI mismatch** | El URI en Google Cloud Console no coincide con tu `NEXT_PUBLIC_APP_URL` |
| **Blank screen después de login** | Limpia cookies: DevTools > Application > Storage > Delete all |
| **"state mismatch" error** | Recarga la página y vuelve a intentar |

---

## ✅ Validación Final

- [ ] Verifica que `NEXT_PUBLIC_APP_URL` es correcto en `.env.local` o Vercel
- [ ] Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` están en `.env.local` o Vercel
- [ ] Verifica que el Redirect URI en Google Cloud Console coincide con tu URL
- [ ] Si estás en "In development", verifica que tu email está en "Test users"
- [ ] Intenta hacer login nuevamente

---

## 📊 Diagrama de Flujo

```
Usuario hace clic en "Continuar con Google"
    ↓
app → /api/oauth/google/route.ts
    ↓
Genera URL con Client ID, Redirect URI, y Scopes
    ↓
Redirige a Google OAuth (accounts.google.com)
    ↓
Usuario ve pantalla de consentimiento ← [ERROR 403 aquí = problema en Google Cloud Console]
    ↓
Usuario acepta → Google redirige a Redirect URI
    ↓
app → /api/oauth/google/callback/route.ts
    ↓
Intercambia código por tokens de Google
    ↓
Guarda tokens en BD (tabla `integrations`)
    ↓
Redirige a /integrations?connected=gmail
    ↓
Login completado ✅
```

---

## 🔍 Cómo Debuggear

### En Desarrollo Local

1. Abre DevTools (F12)
2. Ve a "Network" tab
3. Haz clic en "Continuar con Google"
4. Busca la primera solicitud a `accounts.google.com`
5. Haz clic en ella y revisa los Query Parameters:
   ```
   redirect_uri: http://localhost:3000/api/oauth/google/callback
   client_id: 123456789.apps.googleusercontent.com
   scope: email profile https://www.googleapis.com/auth/gmail.send ...
   ```
6. Verifica que estos valores coincidan con Google Cloud Console

### En Producción

1. Ve a Vercel Dashboard > tu proyecto > Deployments > [último deployment]
2. Haz clic en "View Logs"
3. Busca líneas que digan `[OAuth Google] State mismatch` o `Error`
4. Si ves errores, significa que el código capturó un problema

---

## 📞 Si Nada Funciona

Revisa `/home/user/ConectAr-Talento/GOOGLE_CLOUD_SETUP.md` para una guía completa con más detalles y capturas de pantalla.

---

**Última actualización**: 2026-07-13
