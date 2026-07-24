'use client';

import { useState, useEffect } from 'react';
import { Home, Users, DollarSign, Settings as SettingsIcon, Sparkles, LogOut } from 'lucide-react';
import DashboardView from '@/components/DashboardView';
import ConvidadosView from '@/components/ConvidadosView';
import FinanceiroView from '@/components/FinanceiroView';
import ConfiguracaoView from '@/components/ConfiguracaoView';
import LoginView from '@/components/LoginView';
import ForcePasswordChangeView from '@/components/ForcePasswordChangeView';
import { db, Convidado, FinanceiroItem, Usuario } from '@/utils/supabase';

type Tab = 'dashboard' | 'convidados' | 'financeiro' | 'configuracao';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // App States
  const [config, setConfig] = useState({ nome_aniversariante: '', data_festa: '' });
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [financeiro, setFinanceiro] = useState<FinanceiroItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSession = localStorage.getItem('mn_session');
        if (savedSession) {
          setCurrentUser(JSON.parse(savedSession));
        }
        
        const [configData, convidadosData, financeiroData] = await Promise.all([
          db.getConfig(),
          db.getConvidados(),
          db.getFinanceiro()
        ]);
        
        setConfig(configData);
        setConvidados(convidadosData);
        setFinanceiro(financeiroData);
      } catch (err) {
        console.error('Erro ao ler dados:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update actions
  const handleUpdateConfig = async (nome: string, data: string) => {
    const updated = await db.updateConfig(nome, data);
    if (updated) setConfig(updated);
  };

  // Guest actions
  const handleAddConvidado = async (convidado: Omit<Convidado, 'id' | 'criado_em'>) => {
    const added = await db.addConvidado(convidado);
    if (added) setConvidados(prev => [added, ...prev]);
  };

  const handleUpdateConvidado = async (id: string, updates: Partial<Convidado>) => {
    const updated = await db.updateConvidado(id, updates);
    if (updated) {
      setConvidados(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const handleDeleteConvidado = async (id: string) => {
    await db.deleteConvidado(id);
    setConvidados(prev => prev.filter(c => c.id !== id));
  };

  // Finance actions
  const handleAddFinanceiro = async (item: Omit<FinanceiroItem, 'id' | 'valor_pendente' | 'criado_em'>) => {
    const added = await db.addFinanceiro(item);
    if (added) setFinanceiro(prev => [added, ...prev]);
  };

  const handleUpdateFinanceiro = async (id: string, updates: Partial<FinanceiroItem>) => {
    const updated = await db.updateFinanceiro(id, updates);
    if (updated) {
      setFinanceiro(prev => prev.map(f => f.id === id ? updated : f));
    }
  };

  const handleDeleteFinanceiro = async (id: string) => {
    await db.deleteFinanceiro(id);
    setFinanceiro(prev => prev.filter(f => f.id !== id));
  };

  const handleLoginSuccess = (user: Usuario) => {
    if (user.forcar_troca_senha) {
      setCurrentUser(user);
    } else {
      localStorage.setItem('mn_session', JSON.stringify(user));
      setCurrentUser(user);
    }
  };

  const handlePasswordChanged = (updatedUser: Usuario) => {
    localStorage.setItem('mn_session', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('mn_session');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-4 min-h-screen">
        {/* Sonic Spin Mock Loading */}
        <div className="w-16 h-16 border-8 border-sonic-blue border-t-yellow-400 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse text-sm">Carregando Green Hill Zone...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.forcar_troca_senha) {
    return (
      <ForcePasswordChangeView 
        user={currentUser} 
        onPasswordChanged={handlePasswordChanged} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-900 font-sans">
      
      {/* Desktop Sidebar Navigation (Hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-white flex-col justify-between p-6 shrink-0 border-r border-slate-800 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-yellow-400 rounded-full flex items-center justify-center animate-ring-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            </div>
            <span className="font-black text-lg tracking-tight">
              Davi 4.0 <span className="text-sonic-sky font-extrabold text-xs px-2 py-0.5 bg-blue-900 rounded-full">Sonic</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {[
              { id: 'dashboard', label: 'Painel Geral', character: 'Sonic', color: 'border-blue-500 text-blue-400 bg-blue-950/20', activeBg: 'bg-sonic-blue text-white shadow-blue-900/40', icon: Home, disabled: false },
              { id: 'convidados', label: 'Convidados', character: 'Tails', color: 'border-orange-500 text-orange-400 bg-orange-950/20', activeBg: 'bg-orange-600 text-white shadow-orange-900/40', icon: Users, disabled: false },
              ...(currentUser?.login?.toLowerCase() === 'admin' ? [
                { id: 'financeiro', label: 'Financeiro', character: 'Shadow', color: 'border-red-600 text-red-400 bg-red-950/20', activeBg: 'bg-red-700 text-white shadow-red-950/40', icon: DollarSign, disabled: false },
                { id: 'configuracao', label: 'Configurações', character: 'Knuckles', color: 'border-red-500 text-red-500 bg-red-950/10', activeBg: 'bg-shoes-red text-white shadow-red-900/40', icon: SettingsIcon, disabled: false }
              ] : [])
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id as Tab)}
                  title={tab.disabled ? 'Em breve' : undefined}
                  className={`flex flex-col items-stretch p-3 rounded-2xl transition-all border text-left ${
                    tab.disabled
                      ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed opacity-50'
                      : isActive
                        ? `${tab.activeBg} border-transparent cursor-pointer`
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{tab.label}</span>
                    {tab.disabled && <span className="ml-auto text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-full border border-slate-700">Em breve</span>}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout */}
        <div className="space-y-3 shrink-0">
          <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">Logado como</span>
              <span className="text-sm font-black text-white">{currentUser?.nome}</span>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold rounded-2xl border border-red-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 md:overflow-y-auto">
        
        {/* Mobile Top Header (Hidden on desktop) */}
        <header className="md:hidden sticky top-0 z-50 glass-card border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-yellow-400 rounded-full flex items-center justify-center animate-ring-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            </div>
            <span className="font-black text-lg tracking-tight text-slate-800 flex items-center gap-1">
              Davi 4.0 <span className="text-sonic-blue font-extrabold text-xs px-2 py-0.5 bg-blue-150 rounded-full">Sonic</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full animate-ping ${
                activeTab === 'dashboard' ? 'bg-blue-500' :
                activeTab === 'convidados' ? 'bg-orange-500' :
                activeTab === 'financeiro' ? 'bg-slate-800' : 'bg-red-500'
              }`}></span>
              {activeTab === 'dashboard' ? 'Painel' :
               activeTab === 'convidados' ? 'Convidados' :
               activeTab === 'financeiro' ? 'Financeiro' : 'Ajustes'}
            </span>
          </div>
        </header>

        {/* Content Area */}
        {/* On mobile: centered container with bottom margin. On desktop: expands fully */}
        <div className="flex-1 w-full max-w-md mx-auto md:max-w-6xl md:mx-0 md:px-10 md:py-8 px-6 py-6 pb-28 green-hill-pattern">
          {activeTab === 'dashboard' && (
            <DashboardView 
              config={config} 
              convidados={convidados} 
              financeiro={financeiro} 
            />
          )}

          {activeTab === 'convidados' && (
            <ConvidadosView 
              convidados={convidados}
              onAdd={handleAddConvidado}
              onUpdate={handleUpdateConvidado}
              onDelete={handleDeleteConvidado}
            />
          )}

          {activeTab === 'financeiro' && currentUser?.login?.toLowerCase() === 'admin' && (
            <FinanceiroView 
              financeiro={financeiro}
              onAdd={handleAddFinanceiro}
              onUpdate={handleUpdateFinanceiro}
              onDelete={handleDeleteFinanceiro}
            />
          )}

          {activeTab === 'configuracao' && currentUser?.login?.toLowerCase() === 'admin' && (
            <ConfiguracaoView 
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* Mobile Bottom Tab Bar (Hidden on desktop) */}
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-full p-2 flex items-center justify-between">
          {[
            { id: 'dashboard', label: 'Painel', icon: Home, disabled: false },
            { id: 'convidados', label: 'Convidados', icon: Users, disabled: false },
            ...(currentUser?.login?.toLowerCase() === 'admin' ? [
              { id: 'financeiro', label: 'Financeiro', icon: DollarSign, disabled: false },
              { id: 'configuracao', label: 'Config', icon: SettingsIcon, disabled: false }
            ] : [])
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as Tab)}
                title={tab.disabled ? 'Em breve' : undefined}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-full transition-all ${
                  tab.disabled
                    ? 'text-slate-300 cursor-not-allowed opacity-50'
                    : isActive
                      ? 'text-white sonic-gradient-primary shadow-md active:scale-95 scale-105 cursor-pointer'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-bold mt-1 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
