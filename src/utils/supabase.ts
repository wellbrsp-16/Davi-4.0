import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export type Usuario = {
  id: string;
  nome: string;
  login: string;
  senha_hash: string;
  ultimo_acesso: string | null;
  forcar_troca_senha: boolean;
};

export type Convidado = {
  id: string;
  nome: string;
  tipo: 'Adulto' | 'Criança';
  convidado_por: 'Wellington' | 'Raissa';
  participacoes: string[];
  prioridade: 1 | 2 | 3;
  confirmado: boolean;
  criado_em: string;
};

export type FinanceiroItem = {
  id: string;
  data: string;
  item: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  pagante: 'Wellington' | 'Raissa';
  observacao?: string;
  comprovante_url?: string;
  criado_em: string;
};

// Smart mock store for local development when Supabase is not connected
class MockSupabaseService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Initial Seed Data
  private initialConfig = {
    id: 'config-1',
    nome_aniversariante: 'Benício',
    data_festa: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    criado_em: new Date().toISOString()
  };

  private initialConvidados: Convidado[] = [
    { id: '1', nome: 'Tio Tailz', tipo: 'Adulto', convidado_por: 'Wellington', participacoes: ['Festa', 'Almoço'], prioridade: 1, confirmado: true, criado_em: new Date().toISOString() },
    { id: '2', nome: 'Arthur (Amiguinho)', tipo: 'Criança', convidado_por: 'Raissa', participacoes: ['Festa'], prioridade: 1, confirmado: true, criado_em: new Date().toISOString() },
    { id: '3', nome: 'Sofia (Prima)', tipo: 'Criança', convidado_por: 'Raissa', participacoes: ['Festa'], prioridade: 2, confirmado: false, criado_em: new Date().toISOString() },
    { id: '4', nome: 'Marcos Silva', tipo: 'Adulto', convidado_por: 'Wellington', participacoes: ['Festa'], prioridade: 3, confirmado: false, criado_em: new Date().toISOString() },
    { id: '5', nome: 'Maria Souza', tipo: 'Adulto', convidado_por: 'Raissa', participacoes: ['Festa'], prioridade: 2, confirmado: true, criado_em: new Date().toISOString() },
    { id: '6', nome: 'Lucas Rodrigues', tipo: 'Criança', convidado_por: 'Wellington', participacoes: ['Festa'], prioridade: 1, confirmado: false, criado_em: new Date().toISOString() }
  ];

  private initialFinanceiro: FinanceiroItem[] = [
    { id: 'f1', data: '2026-07-15', item: 'Reserva do Espaço Green Hill', valor_total: 1500.00, valor_pago: 500.00, valor_pendente: 1000.00, pagante: 'Wellington', observacao: 'Sinal pago, restante na semana do evento', criado_em: new Date().toISOString() },
    { id: 'f2', data: '2026-07-20', item: 'Decoração Temática Sonic & Amigos', valor_total: 2200.00, valor_pago: 2200.00, valor_pendente: 0.00, pagante: 'Raissa', observacao: 'Decoração premium inclusa mesa de bolo 3D', criado_em: new Date().toISOString() },
    { id: 'f3', data: '2026-07-22', item: 'Bolo Cenográfico e Doces Personalizados', valor_total: 650.00, valor_pago: 300.00, valor_pendente: 350.00, pagante: 'Raissa', observacao: 'Doces com formato de argolas e esmeraldas do caos', criado_em: new Date().toISOString() },
    { id: 'f4', data: '2026-07-23', item: 'Salgados Finos (1000 unidades)', valor_total: 800.00, valor_pago: 0.00, valor_pendente: 800.00, pagante: 'Wellington', observacao: 'Pagamento na entrega', criado_em: new Date().toISOString() }
  ];

  private getUsuariosList(): Usuario[] {
    const defaultUsuarios: Usuario[] = [
      {
        id: 'admin-id',
        nome: 'Administrador',
        login: 'admin',
        senha_hash: bcrypt.hashSync('admin', 10),
        ultimo_acesso: null,
        forcar_troca_senha: true
      },
      {
        id: 'wellington-id',
        nome: 'Wellington',
        login: 'wellington',
        senha_hash: bcrypt.hashSync('niver2026', 10),
        ultimo_acesso: null,
        forcar_troca_senha: false
      },
      {
        id: 'raissa-id',
        nome: 'Raissa',
        login: 'raissa',
        senha_hash: bcrypt.hashSync('niver2026', 10),
        ultimo_acesso: null,
        forcar_troca_senha: false
      }
    ];
    return this.getStorageItem<Usuario[]>('mn_usuarios', defaultUsuarios);
  }

  loginUser(loginInput: string, passwordInput: string): Usuario | null {
    const usuarios = this.getUsuariosList();
    const user = usuarios.find(u => u.login.toLowerCase() === loginInput.toLowerCase());
    
    if (user && bcrypt.compareSync(passwordInput, user.senha_hash)) {
      if (!user.forcar_troca_senha) {
        user.ultimo_acesso = new Date().toISOString();
        this.setStorageItem('mn_usuarios', usuarios);
      }
      return user;
    }
    return null;
  }

  updateUserPassword(userId: string, newPasswordInput: string): boolean {
    const usuarios = this.getUsuariosList();
    const index = usuarios.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      usuarios[index].senha_hash = bcrypt.hashSync(newPasswordInput, 10);
      usuarios[index].forcar_troca_senha = false;
      usuarios[index].ultimo_acesso = new Date().toISOString();
      this.setStorageItem('mn_usuarios', usuarios);
      return true;
    }
    return false;
  }

  getConfig() {
    return this.getStorageItem('mn_config', this.initialConfig);
  }

  updateConfig(nome: string, data: string) {
    const config = { ...this.getConfig(), nome_aniversariante: nome, data_festa: data };
    this.setStorageItem('mn_config', config);
    return config;
  }

  getConvidados() {
    return this.getStorageItem('mn_convidados', this.initialConvidados);
  }

  addConvidado(convidado: any) {
    const list = this.getConvidados();
    const newItem = {
      ...convidado,
      id: Math.random().toString(36).substring(2, 9),
      criado_em: new Date().toISOString()
    };
    list.unshift(newItem);
    this.setStorageItem('mn_convidados', list);
    return newItem;
  }

  updateConvidado(id: string, updates: any) {
    const list = this.getConvidados();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.setStorageItem('mn_convidados', list);
      return list[index];
    }
    return null;
  }

  deleteConvidado(id: string) {
    let list = this.getConvidados();
    list = list.filter(c => c.id !== id);
    this.setStorageItem('mn_convidados', list);
  }

  getFinanceiro() {
    return this.getStorageItem('mn_financeiro', this.initialFinanceiro);
  }

  addFinanceiro(item: any) {
    const list = this.getFinanceiro();
    const valor_total = Number(item.valor_total);
    const valor_pago = Number(item.valor_pago);
    const newItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      valor_total,
      valor_pago,
      valor_pendente: valor_total - valor_pago,
      criado_em: new Date().toISOString()
    };
    list.unshift(newItem);
    this.setStorageItem('mn_financeiro', list);
    return newItem;
  }

  updateFinanceiro(id: string, updates: any) {
    const list = this.getFinanceiro();
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      const merged = { ...list[index], ...updates };
      merged.valor_total = Number(merged.valor_total);
      merged.valor_pago = Number(merged.valor_pago);
      merged.valor_pendente = merged.valor_total - merged.valor_pago;
      list[index] = merged;
      this.setStorageItem('mn_financeiro', list);
      return list[index];
    }
    return null;
  }

  deleteFinanceiro(id: string) {
    let list = this.getFinanceiro();
    list = list.filter(f => f.id !== id);
    this.setStorageItem('mn_financeiro', list);
  }
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

export const mockDb = new MockSupabaseService();
export type MockDb = MockSupabaseService;

class DatabaseService {
  async getConfig() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('config_evento').select('*').limit(1).maybeSingle();
        if (error || !data) {
          // If config doesn't exist, create a default one
          const defaultConfig = {
            nome_aniversariante: 'Benício',
            data_festa: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          };
          const { data: inserted } = await supabase.from('config_evento').insert(defaultConfig).select().single();
          return inserted || { ...defaultConfig, id: 'config-default' };
        }
        return data;
      } catch (err) {
        console.error('Supabase config error, falling back to mock:', err);
      }
    }
    return mockDb.getConfig();
  }

  async updateConfig(nome: string, dataStr: string) {
    if (isSupabaseConfigured) {
      try {
        const current = await this.getConfig();
        const { data, error } = await supabase
          .from('config_evento')
          .update({ nome_aniversariante: nome, data_festa: dataStr })
          .eq('id', current.id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase updateConfig error:', err);
      }
    }
    return mockDb.updateConfig(nome, dataStr);
  }

  async getConvidados() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('convidados')
          .select('*')
          .order('criado_em', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase getConvidados error:', err);
      }
    }
    return mockDb.getConvidados();
  }

  async addConvidado(convidado: any) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('convidados')
          .insert(convidado)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase addConvidado error:', err);
      }
    }
    return mockDb.addConvidado(convidado);
  }

  async updateConvidado(id: string, updates: any) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('convidados')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase updateConvidado error:', err);
      }
    }
    return mockDb.updateConvidado(id, updates);
  }

  async deleteConvidado(id: string) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('convidados').delete().eq('id', id);
        return;
      } catch (err) {
        console.error('Supabase deleteConvidado error:', err);
      }
    }
    mockDb.deleteConvidado(id);
  }

  async getFinanceiro() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('financeiro')
          .select('*')
          .order('criado_em', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase getFinanceiro error:', err);
      }
    }
    return mockDb.getFinanceiro();
  }

  async addFinanceiro(item: any) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('financeiro')
          .insert(item)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase addFinanceiro error:', err);
      }
    }
    return mockDb.addFinanceiro(item);
  }

  async updateFinanceiro(id: string, updates: any) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('financeiro')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase updateFinanceiro error:', err);
      }
    }
    return mockDb.updateFinanceiro(id, updates);
  }

  async deleteFinanceiro(id: string) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('financeiro').delete().eq('id', id);
        return;
      } catch (err) {
        console.error('Supabase deleteFinanceiro error:', err);
      }
    }
    mockDb.deleteFinanceiro(id);
  }

  async loginUser(loginInput: string, passwordInput: string): Promise<Usuario | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: user, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('login', loginInput.toLowerCase())
          .maybeSingle();

        if (error || !user) {
          return null;
        }

        if (bcrypt.compareSync(passwordInput, user.senha_hash)) {
          if (!user.forcar_troca_senha) {
            await supabase
              .from('usuarios')
              .update({ ultimo_acesso: new Date().toISOString() })
              .eq('id', user.id);
          }
          return user;
        }
        return null;
      } catch (err) {
        console.error('Supabase loginUser error:', err);
      }
    }
    return mockDb.loginUser(loginInput, passwordInput);
  }

  async updateUserPassword(userId: string, newPasswordInput: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const senha_hash = bcrypt.hashSync(newPasswordInput, 10);
        const { error } = await supabase
          .from('usuarios')
          .update({
            senha_hash,
            forcar_troca_senha: false,
            ultimo_acesso: new Date().toISOString()
          })
          .eq('id', userId);
        return !error;
      } catch (err) {
        console.error('Supabase updateUserPassword error:', err);
      }
    }
    return mockDb.updateUserPassword(userId, newPasswordInput);
  }
}

export const db = new DatabaseService();

