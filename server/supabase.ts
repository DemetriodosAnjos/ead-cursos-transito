import dotenv from 'dotenv';
dotenv.config();

let supabaseInstance: any = null;

export async function getSupabase(): Promise<any | null> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('seu-projeto')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('[SUPABASE] Cliente conectado com sucesso a:', supabaseUrl);
    } catch (err) {
      console.warn('[AVISO] Pacote @supabase/supabase-js não encontrado ou erro na inicialização:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  return Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto'));
};
