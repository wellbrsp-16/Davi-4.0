'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Edit2, Check, X, Star } from 'lucide-react';
import { Convidado } from '@/utils/supabase';

interface ConvidadosViewProps {
  convidados: Convidado[];
  onAdd: (convidado: Omit<Convidado, 'id' | 'criado_em'>) => Promise<void> | void;
  onUpdate: (id: string, updates: Partial<Convidado>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

interface NewGuestRow {
  tempId: string;
  nome: string;
  tipo: 'Adulto' | 'Criança';
  convidado_por: 'Wellington' | 'Raissa';
  prioridade: 1 | 2 | 3;
  participacoes: string;
  confirmado: boolean;
}

export default function ConvidadosView({ convidados, onAdd, onUpdate, onDelete }: ConvidadosViewProps) {
  const [search, setSearch] = useState('');
  const [filterConfirmado, setFilterConfirmado] = useState<'todos' | 'confirmados' | 'pendentes'>('todos');
  const [filterConvidadoPor, setFilterConvidadoPor] = useState<'todos' | 'Wellington' | 'Raissa'>('todos');

  // Excel-style state for brand new rows
  const [newRows, setNewRows] = useState<NewGuestRow[]>([]);
  
  // Excel-style state for editing existing rows
  const [editingRows, setEditingRows] = useState<Record<string, Convidado>>({});

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

  // Action: Add empty Excel row at the top
  const handleAddNewRow = () => {
    const newRow: NewGuestRow = {
      tempId: Math.random().toString(36).substring(2, 9),
      nome: '',
      tipo: 'Adulto',
      convidado_por: 'Wellington',
      prioridade: 1,
      participacoes: 'Festa',
      confirmado: false
    };
    setNewRows(prev => [newRow, ...prev]);
  };

  // Action: Save a brand new row to DB
  const handleSaveNewRow = async (tempId: string) => {
    const row = newRows.find(r => r.tempId === tempId);
    if (!row) return;
    if (!row.nome.trim()) {
      alert('Por favor, informe o nome do convidado.');
      return;
    }

    const item = {
      nome: row.nome.trim(),
      tipo: row.tipo,
      convidado_por: row.convidado_por,
      prioridade: row.prioridade,
      participacoes: row.participacoes.split(',').map(p => p.trim()).filter(Boolean),
      confirmado: row.confirmado
    };

    await onAdd(item);
    
    // Remove from temporary list
    setNewRows(prev => prev.filter(r => r.tempId !== tempId));
  };

  // Action: Cancel a new row creation
  const handleCancelNewRow = (tempId: string) => {
    setNewRows(prev => prev.filter(r => r.tempId !== tempId));
  };

  // Update temp fields for new rows
  const handleUpdateNewRowField = (tempId: string, field: keyof NewGuestRow, value: any) => {
    setNewRows(prev => prev.map(r => r.tempId === tempId ? { ...r, [field]: value } : r));
  };

  // Action: Enter edit mode for existing row
  const handleStartEdit = (convidado: Convidado) => {
    setEditingRows(prev => ({
      ...prev,
      [convidado.id]: { ...convidado }
    }));
  };

  // Action: Save edited row
  const handleSaveEdit = async (id: string) => {
    const edited = editingRows[id];
    if (!edited) return;
    if (!edited.nome.trim()) {
      alert('O nome do convidado não pode ficar vazio.');
      return;
    }

    // If participacoes was parsed as string or remains array
    let participacoesArray = edited.participacoes;
    if (typeof edited.participacoes === 'string') {
      participacoesArray = (edited.participacoes as string).split(',').map(p => p.trim()).filter(Boolean);
    }

    await onUpdate(id, {
      nome: edited.nome.trim(),
      tipo: edited.tipo,
      convidado_por: edited.convidado_por,
      prioridade: edited.prioridade,
      participacoes: participacoesArray,
      confirmado: edited.confirmado
    });

    setEditingRows(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Action: Cancel editing existing row
  const handleCancelEdit = (id: string) => {
    setEditingRows(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Update editing fields
  const handleUpdateEditField = (id: string, field: keyof Convidado, value: any) => {
    setEditingRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-5 animate-dash">
      
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
          onClick={handleAddNewRow}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white sonic-gradient-primary rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Convidado
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Buscar convidado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none shadow-sm focus:border-sonic-blue"
          />
        </div>

        <div className="flex gap-2">
          {/* Confirmed Filter */}
          <select
            value={filterConfirmado}
            onChange={e => setFilterConfirmado(e.target.value as any)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="todos">Todos Status</option>
            <option value="confirmados">Confirmados</option>
            <option value="pendentes">Pendentes</option>
          </select>

          {/* Invited By Filter */}
          <select
            value={filterConvidadoPor}
            onChange={e => setFilterConvidadoPor(e.target.value as any)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="todos">Convidado por...</option>
            <option value="Wellington">Wellington</option>
            <option value="Raissa">Raissa</option>
          </select>
        </div>
      </div>

      {/* Grid Excel-Style Table Wrapper */}
      <div className="glass-card rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                <th className="px-5 py-4 w-1/3">Nome do Convidado</th>
                <th className="px-4 py-4 w-32">Tipo</th>
                <th className="px-4 py-4 w-36">Convidado Por</th>
                <th className="px-4 py-4 w-28">Prioridade</th>
                <th className="px-4 py-4 w-40">Participações</th>
                <th className="px-4 py-4 w-28 text-center">Confirmado</th>
                <th className="px-5 py-4 w-32 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              
              {/* Render TEMPORARY Excel new rows */}
              {newRows.map(row => (
                <tr key={row.tempId} className="bg-yellow-50/40 hover:bg-yellow-50/70 transition-colors animate-pulse">
                  {/* Name Input */}
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      placeholder="Nome do convidado..."
                      value={row.nome}
                      onChange={e => handleUpdateNewRowField(row.tempId, 'nome', e.target.value)}
                      className="w-full bg-white border border-yellow-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-sonic-blue font-bold text-slate-800"
                      autoFocus
                    />
                  </td>
                  {/* Type Select */}
                  <td className="px-4 py-3">
                    <select
                      value={row.tipo}
                      onChange={e => handleUpdateNewRowField(row.tempId, 'tipo', e.target.value)}
                      className="w-full bg-white border border-yellow-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="Adulto">Adulto</option>
                      <option value="Criança">Criança</option>
                    </select>
                  </td>
                  {/* Invited By Select */}
                  <td className="px-4 py-3">
                    <select
                      value={row.convidado_por}
                      onChange={e => handleUpdateNewRowField(row.tempId, 'convidado_por', e.target.value)}
                      className="w-full bg-white border border-yellow-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="Wellington">Wellington</option>
                      <option value="Raissa">Raissa</option>
                    </select>
                  </td>
                  {/* Priority Select */}
                  <td className="px-4 py-3">
                    <select
                      value={row.prioridade}
                      onChange={e => handleUpdateNewRowField(row.tempId, 'prioridade', Number(e.target.value))}
                      className="w-full bg-white border border-yellow-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="1">Alta (1)</option>
                      <option value="2">Média (2)</option>
                      <option value="3">Baixa (3)</option>
                    </select>
                  </td>
                  {/* Participacoes Input */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Festa, Almoço"
                      value={row.participacoes}
                      onChange={e => handleUpdateNewRowField(row.tempId, 'participacoes', e.target.value)}
                      className="w-full bg-white border border-yellow-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-sonic-blue font-semibold"
                    />
                  </td>
                  {/* Confirm Checkbox */}
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.confirmado}
                      onChange={e => handleUpdateNewRowField(row.tempId, 'confirmado', e.target.checked)}
                      className="w-4 h-4 rounded text-sonic-blue focus:ring-sonic-blue border-yellow-300 cursor-pointer"
                    />
                  </td>
                  {/* Row Actions */}
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSaveNewRow(row.tempId)}
                        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                        title="Salvar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancelNewRow(row.tempId)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors cursor-pointer"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Render EXISTING Convidados */}
              {filtered.length === 0 && newRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold bg-white">
                    Nenhum convidado encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const isEditing = editingRows[c.id] !== undefined;
                  const editingRow = editingRows[c.id];

                  if (isEditing && editingRow) {
                    // EDITABLE ROW STYLE
                    return (
                      <tr key={c.id} className="bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                        {/* Name Edit */}
                        <td className="px-5 py-3">
                          <input
                            type="text"
                            value={editingRow.nome}
                            onChange={e => handleUpdateEditField(c.id, 'nome', e.target.value)}
                            className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-sonic-blue font-bold text-slate-800"
                          />
                        </td>
                        {/* Type Edit */}
                        <td className="px-4 py-3">
                          <select
                            value={editingRow.tipo}
                            onChange={e => handleUpdateEditField(c.id, 'tipo', e.target.value)}
                            className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value="Adulto">Adulto</option>
                            <option value="Criança">Criança</option>
                          </select>
                        </td>
                        {/* Invited By Edit */}
                        <td className="px-4 py-3">
                          <select
                            value={editingRow.convidado_por}
                            onChange={e => handleUpdateEditField(c.id, 'convidado_por', e.target.value)}
                            className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value="Wellington">Wellington</option>
                            <option value="Raissa">Raissa</option>
                          </select>
                        </td>
                        {/* Priority Edit */}
                        <td className="px-4 py-3">
                          <select
                            value={editingRow.prioridade}
                            onChange={e => handleUpdateEditField(c.id, 'prioridade', Number(e.target.value))}
                            className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value="1">Alta (1)</option>
                            <option value="2">Média (2)</option>
                            <option value="3">Baixa (3)</option>
                          </select>
                        </td>
                        {/* Participations Edit */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={
                              typeof editingRow.participacoes === 'string'
                                ? editingRow.participacoes
                                : editingRow.participacoes.join(', ')
                            }
                            onChange={e => handleUpdateEditField(c.id, 'participacoes', e.target.value)}
                            className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-sonic-blue font-semibold"
                          />
                        </td>
                        {/* Confirm Edit */}
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={editingRow.confirmado}
                            onChange={e => handleUpdateEditField(c.id, 'confirmado', e.target.checked)}
                            className="w-4 h-4 rounded text-sonic-blue focus:ring-sonic-blue border-blue-300 cursor-pointer"
                          />
                        </td>
                        {/* Save/Cancel Edit */}
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(c.id)}
                              className="p-1.5 bg-sonic-blue hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                              title="Salvar Alterações"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelEdit(c.id)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer"
                              title="Descartar Alterações"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // STATIC NORMAL ROW STYLE
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {c.nome}
                      </td>
                      {/* Type */}
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          c.tipo === 'Criança' ? 'bg-orange-100 text-orange-700' : 'bg-slate-150 text-slate-600'
                        }`}>
                          {c.tipo}
                        </span>
                      </td>
                      {/* Invited By */}
                      <td className="px-4 py-4 font-semibold text-slate-600 text-xs">
                        {c.convidado_por}
                      </td>
                      {/* Priority */}
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 4 - c.prioridade }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </span>
                      </td>
                      {/* Participations */}
                      <td className="px-4 py-4 text-xs font-medium text-slate-500">
                        {c.participacoes.join(', ')}
                      </td>
                      {/* Confirm status */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => onUpdate(c.id, { confirmado: !c.confirmado })}
                          className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase rounded-full border cursor-pointer select-none transition-all active:scale-95 ${
                            c.confirmado
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                          }`}
                        >
                          {c.confirmado ? 'Confirmado' : 'Pendente'}
                        </button>
                      </td>
                      {/* Action buttons */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                            title="Editar Linha"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir convidado ${c.nome}?`)) {
                                onDelete(c.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all cursor-pointer"
                            title="Excluir Convidado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
