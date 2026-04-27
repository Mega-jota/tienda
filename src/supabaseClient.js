// ══════════════════════════════════════════════
// CONFIGURACIÓN SUPABASE
// ══════════════════════════════════════════════
// Reemplaza estos valores con los de tu proyecto Supabase.
// Los encuentras en: Supabase → Settings → API
// ══════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mkkwbytjateachszpebp.supabase.co'       // ← Reemplaza con tu Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra3dieXRqYXRlYWNoc3pwZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTA2NjksImV4cCI6MjA5MjcyNjY2OX0.bWefkGHXLK8pHJA23T4Es5ngkVlrQGuY-PfJ1rzCHbg'                 // ← Reemplaza con tu anon/public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
