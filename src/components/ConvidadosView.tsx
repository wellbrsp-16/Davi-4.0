'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, UserCheck, Star, X, Check, Filter } from 'lucide-react';
import { Convidado } from '@/utils/supabase';

interface ConvidadosViewProps {
  convidados: Convidado[];
  onAdd: (convidado: Omit<Convidado, 'id' | 'criado_em'>) => void;
  onUpdate: (id: string, updates: Partial<Convidado>) => void;
  onDelete: (id: string) => void;
}

export default function ConvidadosView({ convidados, onAdd, onUpdate, onDelete }: ConvidadosViewProps) {
  const [search, setSearch] = useState('');
  const [filterConfirmado, setFilterConfirmado] = useState<'todos' | 'confirmados' | 'pendentes'>('todos');
  const [filterConvidadoPor, setFilterConvidadoPor] = useState<'todos' | 'Wellington' | 'Raissa'>('todos');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'Adulto' | 'Criança'>('Adulto');
  const [convidadoPor, setConvidadoPor] = useState<'Wellington' | 'Raissa'>('Wellington');
  const [prioridade, setPrioridade] = useState<1 | 2 | 3>(1);
  const [participacoes, setParticipacoes] = useState<string>('Festa');

  // Filtered convidados
  const filtered = convidados.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase());
    
    const matchesConfirmado = 
      filterConfirmado === 'todos' ? true :
      filterConfirmado === 'confirmados' ? c.confirmado : !c.confirmado;

    const matchesConvidadoPor = 
      filterConvidadoPor === 'todos' ? true : c.convidado_por === filterConvidadoPor;

    return matchesSearch && matchesConfirmado && matchesConvidadoPor;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onAdd({
      nome,
      tipo,
      convidado_por: convidadoPor,
      prioridade,
      participacoes: participacoes.split(',').map(p => p.trim()).filter(Boolean),
      confirmado: false
    });

    // Reset Form
    setNome('');
    setTipo('Adulto');
    setConvidadoPor('Wellington');
    setPrioridade(1);
    setParticipacoes('Festa');
    setIsAdding(false);
  };

  const toggleConfirmado = (id: string, current: boolean) => {
    onUpdate(id, { confirmado: !current });
  };

  return (
    <div className="space-y-4 animate-dash">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Lista de Convidados</h2>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full border border-orange-200">
              Guardião: Tails
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {convidados.filter(c => c.confirmado).length} confirmados de {convidados.length} total
          </p>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white sonic-gradient-primary rounded-full shadow-md hover:shadow-lg transition-transform active:scale-95"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Fechar' : 'Novo'}
        </button>
      </div>

      {/* Add Guest Form Panel */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-5 border border-slate-100 shadow-md space-y-4 animate-dash">
          <h3 className="text-sm font-bold text-slate-800">Adicionar Convidado</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: Tio Sonic"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                >
                  <option value="Adulto">Adulto</option>
                  <option value="Criança">Criança (4 anos)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Convidado Por</label>
                <select
                  value={convidadoPor}
                  onChange={e => setConvidadoPor(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                >
                  <option value="Wellington">Wellington</option>
                  <option value="Raissa">Raissa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Prioridade (1 a 3)</label>
                <select
                  value={prioridade}
                  onChange={e => setPrioridade(Number(e.target.value) as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                >
                  <option value="1">Alta (1)</option>
                  <option value="2">Média (2)</option>
                  <option value="3">Baixa (3)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Participações (separar por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Festa, Almoço"
                  value={participacoes}
                  onChange={e => setParticipacoes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-center text-sm font-bold text-white sonic-gradient-primary rounded-2xl shadow-sm active:scale-98 transition-transform"
          >
            Adicionar à Festa
          </button>
        </form>
      )}

      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Buscar convidado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-3xl text-sm focus:outline-none shadow-sm focus:border-sonic-blue"
          />
        </div>

        {/* Filters Row */}
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* Confirmed Filter */}
          <select
            value={filterConfirmado}
            onChange={e => setFilterConfirmado(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none shadow-sm"
          >
            <option value="todos">Todos Status</option>
            <option value="confirmados">Confirmados</option>
            <option value="pendentes">Pendentes</option>
          </select>

          {/* Invited By Filter */}
          <select
            value={filterConvidadoPor}
            onChange={e => setFilterConvidadoPor(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none shadow-sm"
          >
            <option value="todos">Convidado por...</option>
            <option value="Wellington">Wellington</option>
            <option value="Raissa">Raissa</option>
          </select>
        </div>
      </div>

      {/* Guest Card List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400 text-sm bg-white border border-slate-100 rounded-3xl">
            Nenhum convidado encontrado.
          </div>
        ) : (
          filtered.map(c => (
            <div 
              key={c.id} 
              className={`glass-card rounded-2xl p-4 shadow-sm border transition-all flex items-center justify-between ${
                c.confirmado ? 'border-green-200 bg-green-50/20' : 'border-slate-150'
              }`}
            >
              <div className="space-y-1 pr-2 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-800 text-sm truncate">{c.nome}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    c.tipo === 'Criança' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.tipo}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500">Por: {c.convidado_por}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 4 - c.prioridade }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </span>
                  {c.participacoes.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="italic truncate">{c.participacoes.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Confirm Checkbox */}
                <button
                  onClick={() => toggleConfirmado(c.id, c.confirmado)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    c.confirmado 
                      ? 'bg-green-500 border-green-500 text-white shadow-green-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Check className="w-4.5 h-4.5 stroke-[3]" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (confirm(`Excluir convidado ${c.nome}?`)) {
                      onDelete(c.id);
                    }
                  }}
                  className="w-9 h-9 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
