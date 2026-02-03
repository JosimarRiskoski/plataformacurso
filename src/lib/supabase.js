import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttrkhbqopakutiougprb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cmtoYnFvcGFrdXRpb3VncHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDUxOTEsImV4cCI6MjA4NTYyMTE5MX0.oabihcv8Goe7Yu53ewT-S7zPoeXv1Hc_plXtxTrJ_Yk'

export const supabase = createClient(supabaseUrl, supabaseKey)
