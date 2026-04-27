// ══════════════════════════════════════════════
// CONFIGURACIÓN SUPABASE
// ══════════════════════════════════════════════
// Reemplaza estos valores con los de tu proyecto Supabase.
// Los encuentras en: Supabase → Settings → API
// ══════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co'       // ← Reemplaza con tu Project URL
const SUPABASE_ANON_KEY = 'TU-ANON-KEY-AQUI'                 // ← Reemplaza con tu anon/public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
