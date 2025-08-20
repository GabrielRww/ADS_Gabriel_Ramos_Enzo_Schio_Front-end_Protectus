import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (window as any).__SUPABASE_URL__ || ''
const supabaseAnonKey = (window as any).__SUPABASE_ANON_KEY__ || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : (null as any)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'cliente' | 'funcionario'
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'cliente' | 'funcionario'
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'cliente' | 'funcionario'
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}