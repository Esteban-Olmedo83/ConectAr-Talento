#!/usr/bin/env node

/**
 * Script para aplicar la migración de Google Drive a Supabase
 * Uso: node scripts/apply-migration.js
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const migrationSQL = `
-- Add Google Drive and Sheets integration fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_drive_folder_id text,
  ADD COLUMN IF NOT EXISTS google_sheets_db_id text;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_google_drive_folder_id ON public.profiles(google_drive_folder_id);
CREATE INDEX IF NOT EXISTS idx_profiles_google_sheets_db_id ON public.profiles(google_sheets_db_id);
`

async function applyMigration() {
  try {
    console.log('Aplicando migración de Google Drive...')

    const { error } = await supabase.rpc('execute_sql', { query: migrationSQL })

    if (error) {
      console.error('Error al aplicar migración:', error)
      process.exit(1)
    }

    console.log('✅ Migración aplicada exitosamente')
    console.log('\nProximos pasos:')
    console.log('1. npm run build')
    console.log('2. git add . && git commit -m "Fix: agregar campos de Google Drive a profiles"')
    console.log('3. git push -u origin claude/youthful-noether-uihFY')
    console.log('4. Crear PR a main')

  } catch (err) {
    console.error('Error inesperado:', err)
    process.exit(1)
  }
}

applyMigration()
