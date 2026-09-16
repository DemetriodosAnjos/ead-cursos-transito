import { Request, Response } from 'express';
import { getSupabase } from './supabase';

export async function testSupabaseConnection(req: Request, res: Response) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return res.status(400).json({
      success: false,
      message: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidas no arquivo .env.',
      diagnostics: {
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseKey)
      }
    });
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao inicializar o cliente Supabase. Verifique se o pacote @supabase/supabase-js está instalado.'
    });
  }

  try {
    // 1. Testa tabela courses
    const { data: courses, error: errCourses } = await supabase.from('courses').select('id').limit(1);
    
    // 2. Testa tabela students
    const { count: studentsCount, error: errStudents } = await supabase.from('students').select('*', { count: 'exact', head: true });

    // 3. Testa tabela orders
    const { count: ordersCount, error: errOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    if (errCourses || errStudents || errOrders) {
      return res.status(500).json({
        success: false,
        message: 'Conectou ao Supabase, mas encontrou erro ao consultar as tabelas.',
        errors: {
          courses: errCourses ? errCourses.message : 'OK',
          students: errStudents ? errStudents.message : 'OK',
          orders: errOrders ? errOrders.message : 'OK'
        }
      });
    }

    return res.json({
      success: true,
      message: 'Conexão com o Supabase PostgreSQL realizada com sucesso absoluto!',
      tables: {
        courses: 'OK (Acessível)',
        students: `OK (${studentsCount ?? 0} registros)`,
        orders: `OK (${ordersCount ?? 0} registros)`
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Erro na comunicação com o Supabase: ${err.message}`
    });
  }
}
