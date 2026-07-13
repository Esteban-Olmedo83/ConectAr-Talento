# Google Drive Integration - Migration Steps

## Status: PR #145 abierto y esperando mergear

El PR #145 contiene todos los cambios de código necesarios. **Después de mergear**, ejecutar estos pasos:

## PASO 1: Mergear PR #145 a main
- [ ] Esperar a que CI pase
- [ ] Mergear PR #145 a main branch
- [ ] Esperar deployment a Vercel (observar estado READY)

## PASO 2: Ejecutar Migración SQL en Supabase

**URL:** https://supabase.com/dashboard/project/xwsgoegiwducmytntdba/sql

**SQL a ejecutar:**
```sql
-- Add Google Drive and Sheets integration fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_drive_folder_id text,
  ADD COLUMN IF NOT EXISTS google_sheets_db_id text;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_google_drive_folder_id ON public.profiles(google_drive_folder_id);
CREATE INDEX IF NOT EXISTS idx_profiles_google_sheets_db_id ON public.profiles(google_sheets_db_id);
```

**Pasos:**
1. Ir a Supabase Dashboard
2. Ir a Project: `xwsgoegiwducmytntdba` (ConectAr Talento)
3. Ir a SQL Editor
4. Copiar y pegar el SQL arriba
5. Clickear "Run"
6. Esperar mensaje "Query successful"

## PASO 3: Verificar en Base de Datos

```sql
-- Verificar que columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name LIKE 'google_%';

-- Verificar perfiles existentes (deben tener NULL en los nuevos campos)
SELECT id, google_drive_folder_id, google_sheets_db_id 
FROM profiles 
LIMIT 5;
```

Resultado esperado:
- 2 columnas: google_drive_folder_id (text), google_sheets_db_id (text)
- Ambas con valores NULL (antes de conectar Gmail)

## PASO 4: Verificar Funcionamiento

1. **Conectar Gmail:**
   - Ir a https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app/integrations
   - Clickear "Conectar Gmail + Google Meet"
   - Completar OAuth
   - Debería ver "Gmail conectado"

2. **Verificar que se creó carpeta Drive:**
   - Ir a https://drive.google.com
   - Buscar carpeta "ConectAr Talento - [Tu Empresa]"
   - Dentro debe haber archivo "Base de Datos - ConectAr Talento"

3. **Verificar base de datos:**
   ```sql
   SELECT google_drive_folder_id, google_sheets_db_id 
   FROM profiles 
   WHERE id = '[TU_USER_ID]';
   ```
   Resultado esperado: 2 IDs de Google (no NULL)

4. **Probar backup:**
   - En /integrations, clickear "Realizar backup ahora"
   - Debería mostrar "Backup completado" con contador de datos
   - NO debería mostrar error "Google Drive no está configurado"

## PASO 5: Confirmar en Logs (Opcional)

En Vercel logs, debería ver mensajes como:
```
[Google Drive] Successfully created folder: 1abc2def3ghi...
[Google Sheets] Successfully created spreadsheet: 2xyz3abc4def...
[OAuth] Profile updated with Google Drive config
```

## Rollback (Si hay problemas)

Si algo falla:
1. Hacer revert del PR #145
2. Ejecutar:
```sql
-- Remover los campos
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS google_drive_folder_id CASCADE,
DROP COLUMN IF EXISTS google_sheets_db_id CASCADE;

-- Remover índices
DROP INDEX IF EXISTS idx_profiles_google_drive_folder_id;
DROP INDEX IF EXISTS idx_profiles_google_sheets_db_id;
```

## Archivos Modificados en PR #145

1. `src/app/api/oauth/google/route.ts`
   - Cambio: `drive.file` → `drive` (scope)

2. `supabase/migrations/20260712_001_add_google_drive_fields.sql`
   - Nueva migración SQL

3. `src/app/api/migrations/google-drive/route.ts`
   - Nuevo endpoint para documentación

4. `scripts/apply-migration.js`
   - Script de utilidad (ejecutar: `node scripts/apply-migration.js`)

## Notas Técnicas

- Los campos son TEXT porque almacenan IDs de Google (strings)
- Los índices aceleran queries en /api/google/sync
- El callback route crea folder + sheet automáticamente en first-time OAuth
- Si folder ya existe (google_drive_folder_id ≠ NULL), no la vuelve a crear
- Tokens Google se guardan encriptados en integrations table

## Timeline

- ✅ PR #145 creado con todos los cambios
- ⏳ Esperar CI pase
- ⏳ Mergear a main
- ⏳ Deploy a Vercel (observar READY)
- **⚠️ MANUAL: Ejecutar SQL en Supabase**
- ⏳ Conectar Gmail de prueba
- ✅ Confirmar google_sheets_db_id se guardó
- ✅ Confirmar backup funciona

---

**Responsable:** Usuario debe ejecutar manualmente el paso 2 (Migración SQL) en Supabase Dashboard
