'use client';

import { useState } from 'react';
import { Settings, Save, Lock, LogOut } from 'lucide-react';

interface ConfiguracaoViewProps {
  config: { nome_aniversariante: string; data_festa: string };
  onUpdateConfig: (nome: string, data: string) => void;
  onLogout?: () => void;
}

export default function ConfiguracaoView({ config, onUpdateConfig, onLogout }: ConfiguracaoViewProps) {
  const [nome, setNome] = useState(config.nome_aniversariante);
  const [data, setData] = useState(config.data_festa.split('T')[0]);
  const [hora, setHora] = useState(
    new Date(config.data_festa).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // Password reset mockup state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !data) return;

    // Combine data and hora
    const combinedDate = new Date(`${data}T${hora || '18:00'}:00`).toISOString();
    onUpdateConfig(nome, combinedDate);
    alert('Configuração do evento salva com sucesso!');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não conferem!');
      return;
    }
    alert('Senha alterada com sucesso! (Fluxo simulado)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-dash max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Event Details Config */}
        <div className="glass-card rounded-3xl p-5 border border-slate-100 shadow-md">
          <div className="flex items-center justify-between gap-1.5 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-shoes-red" />
              Configurações do Aniversário
            </h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome do Aniversariante</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Data da Festa</label>
                  <input
                    type="date"
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue font-semibold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Horário da Festa</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={e => setHora(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue font-semibold text-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-center text-sm font-bold text-white sonic-gradient-primary rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Configurações
            </button>
          </form>
        </div>

        {/* Security change password mockup */}
        <div className="glass-card rounded-3xl p-5 border border-slate-100 shadow-md">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
            <Lock className="w-4 h-4 text-shoes-red" />
            Segurança (Trocar Senha)
          </h3>

          <form onSubmit={handleResetPassword} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Senha Atual</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nova Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-shoes-red rounded-2xl active:scale-98 transition-transform cursor-pointer"
            >
              Alterar Senha
            </button>
          </form>
        </div>

      </div>

      {/* Logout Section for Mobile */}
      {onLogout && (
        <div className="md:hidden glass-card rounded-3xl p-5 border border-slate-100 shadow-md">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-2xl border border-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta (Logout)
          </button>
        </div>
      )}
    </div>
  );
}
