import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for backend operations
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper to get user from JWT token
export async function getUserFromToken(token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return user
  } catch (error) {
    return null
  }
}