'use client';

import { useState } from 'react';
import { Settings, Save, Lock, LogOut, Clock, Plus, Trash2, CheckCircle, Hourglass } from 'lucide-react';
import { RoteiroItem } from '@/utils/supabase';

interface ConfiguracaoViewProps {
  config: { nome_aniversariante: string; data_festa: string };
  onUpdateConfig: (nome: string, data: string) => void;
  onLogout?: () => void;
  roteiro?: RoteiroItem[];
  onAddRoteiro?: (item: Partial<RoteiroItem>) => void;
  onUpdateRoteiro?: (id: string, updates: Partial<RoteiroItem>) => void;
  onDeleteRoteiro?: (id: string) => void;
}

export default function ConfiguracaoView({
  config,
  onUpdateConfig,
  onLogout,
  roteiro = [],
  onAddRoteiro,
  onUpdateRoteiro,
  onDeleteRoteiro
}: ConfiguracaoViewProps) {
  const [nome, setNome] = useState(config.nome_aniversariante);
  const [data, setData] = useState(config.data_festa.split('T')[0]);
  const [hora, setHora] = useState(
    new Date(config.data_festa).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // Password reset mockup state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Roteiro item form state
  const [novoEvento, setNovoEvento] = useState('');
  const [novaHoraInicio, setNovaHoraInicio] = useState('');
  const [novaHoraFim, setNovaHoraFim] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !data) return;

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

  const handleAddRoteiro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEvento.trim() || !novaHoraInicio.trim()) return;

    if (onAddRoteiro) {
      onAddRoteiro({
        evento: novoEvento.trim(),
        hora_inicio: novaHoraInicio,
        hora_fim: novaHoraFim || undefined,
        status: 'Pendente'
      });
    }

    setNovoEvento('');
    setNovaHoraInicio('');
    setNovaHoraFim('');
  };

  // Sort roteiro by hora_inicio
  const sortedRoteiro = [...roteiro].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

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

      {/* Cadastro de Roteiro da Festa */}
      <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-200/60 bg-white/90 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sonic-blue flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">
                Cadastro de Roteiro da Festa
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Gerencie os momentos e horários do evento
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {sortedRoteiro.length} Eventos
          </span>
        </div>

        {/* Add Roteiro Form */}
        <form onSubmit={handleAddRoteiro} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Nome do Evento</label>
              <input
                type="text"
                placeholder="Ex: Início churrasco, Parabéns..."
                value={novoEvento}
                onChange={e => setNovoEvento(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sonic-blue shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Hora Início</label>
              <input
                type="time"
                value={novaHoraInicio}
                onChange={e => setNovaHoraInicio(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sonic-blue shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Hora Fim (Opcional)</label>
              <input
                type="time"
                value={novaHoraFim}
                onChange={e => setNovaHoraFim(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sonic-blue shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 sonic-gradient-primary text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar ao Roteiro
          </button>
        </form>

        {/* List of Roteiro Items */}
        <div className="space-y-2.5">
          {sortedRoteiro.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-500">Nenhum evento cadastrado no roteiro ainda.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Use o formulário acima para criar a programação da festa.</p>
            </div>
          ) : (
            sortedRoteiro.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:shadow-sm ${
                  item.status === 'OK'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 border-l-4 border-l-emerald-500'
                    : 'bg-white border-slate-200/90 text-slate-800 border-l-4 border-l-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono font-black text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    ⏰ {item.hora_inicio}{item.hora_fim ? ` - ${item.hora_fim}` : ''}
                  </span>
                  <span className="font-extrabold text-xs text-slate-900 truncate">
                    {item.evento}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateRoteiro) {
                        onUpdateRoteiro(item.id, { status: item.status === 'OK' ? 'Pendente' : 'OK' });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border flex items-center gap-1 cursor-pointer active:scale-95 ${
                      item.status === 'OK'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.status === 'OK' ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Concluído
                      </>
                    ) : (
                      <>
                        <Hourglass className="w-3 h-3" /> Pendente
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteRoteiro && confirm(`Excluir "${item.evento}" do roteiro?`)) {
                        onDeleteRoteiro(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
                    title="Excluir item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
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
