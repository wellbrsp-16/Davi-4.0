'use client';

import { useState } from 'react';
import { Plus, Trash2, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, X, Upload } from 'lucide-react';
import { FinanceiroItem } from '@/utils/supabase';

interface FinanceiroViewProps {
  financeiro: FinanceiroItem[];
  onAdd: (item: Omit<FinanceiroItem, 'id' | 'valor_pendente' | 'criado_em'>) => void;
  onUpdate: (id: string, updates: Partial<FinanceiroItem>) => void;
  onDelete: (id: string) => void;
}

export default function FinanceiroView({ financeiro, onAdd, onUpdate, onDelete }: FinanceiroViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [filterPagante, setFilterPagante] = useState<'todos' | 'Wellington' | 'Raissa'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');

  // Form State
  const [itemText, setItemText] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [valorTotal, setValorTotal] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [pagante, setPagante] = useState<'Wellington' | 'Raissa'>('Wellington');
  const [observacao, setObservacao] = useState('');
  const [comprovanteUrl, setComprovanteUrl] = useState('');

  // Calculations
  const totalOrcado = financeiro.reduce((acc, curr) => acc + Number(curr.valor_total), 0);
  const totalPago = financeiro.reduce((acc, curr) => acc + Number(curr.valor_pago), 0);
  const totalPendente = totalOrcado - totalPago;

  const filtered = financeiro.filter(f => {
    const matchesPagante = filterPagante === 'todos' ? true : f.pagante === filterPagante;
    const matchesStatus = 
      filterStatus === 'todos' ? true :
      filterStatus === 'pago' ? f.valor_total === f.valor_pago : f.valor_pago < f.valor_total;
    return matchesPagante && matchesStatus;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemText.trim() || !valorTotal) return;

    onAdd({
      item: itemText,
      data,
      valor_total: Number(valorTotal),
      valor_pago: Number(valorPago || 0),
      pagante,
      observacao: observacao.trim() || undefined,
      comprovante_url: comprovanteUrl || undefined
    });

    // Reset Form
    setItemText('');
    setValorTotal('');
    setValorPago('');
    setObservacao('');
    setComprovanteUrl('');
    setIsAdding(false);
  };

  const handleSimulateUpload = () => {
    // Generate a mock URL
    const rand = Math.floor(Math.random() * 100000);
    setComprovanteUrl(`/comprovantes/comprovante_${rand}.pdf`);
    alert('Comprovante enviado com sucesso (Simulado)!');
  };

  const toggleFullPayment = (id: string, currentItem: FinanceiroItem) => {
    const isPaid = currentItem.valor_pago === currentItem.valor_total;
    onUpdate(id, {
      valor_pago: isPaid ? 0 : currentItem.valor_total
    });
  };

  return (
    <div className="space-y-4 animate-dash">
      {/* Header and New Expense */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Financeiro da Festa</h2>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-900 text-red-450 rounded-full border border-red-900/40">
              Guardião: Shadow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Pago: {formatCurrency(totalPago)} de {formatCurrency(totalOrcado)}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white sonic-gradient-gold rounded-full shadow-md hover:shadow-lg transition-transform active:scale-95"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Fechar' : 'Adicionar'}
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-center">
          <div className="text-[10px] font-bold text-blue-600 uppercase">Orçado</div>
          <div className="text-sm font-black text-blue-900 mt-1">{formatCurrency(totalOrcado)}</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
          <div className="text-[10px] font-bold text-green-600 uppercase">Pago</div>
          <div className="text-sm font-black text-green-900 mt-1">{formatCurrency(totalPago)}</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
          <div className="text-[10px] font-bold text-red-600 uppercase">Pendente</div>
          <div className="text-sm font-black text-red-900 mt-1">{formatCurrency(totalPendente)}</div>
        </div>
      </div>

      {/* Expense Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-5 border border-slate-100 shadow-md space-y-4 animate-dash">
          <h3 className="text-sm font-bold text-slate-800">Nova Despesa / Item</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Item / Descrição</label>
              <input
                type="text"
                placeholder="Ex: Bolo Temático Sonic 2 Andares"
                value={itemText}
                onChange={e => setItemText(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={valorTotal}
                  onChange={e => setValorTotal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Valor Pago (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={valorPago}
                  onChange={e => setValorPago(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Data Vencimento/Pagamento</label>
                <input
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Responsável Pagamento</label>
                <select
                  value={pagante}
                  onChange={e => setPagante(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue"
                >
                  <option value="Wellington">Wellington</option>
                  <option value="Raissa">Raissa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Observações</label>
              <textarea
                placeholder="Ex: Pagar no cartão de crédito"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue h-16 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSimulateUpload}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                {comprovanteUrl ? 'Reenviar Comprovante' : 'Anexar Comprovante'}
              </button>
              {comprovanteUrl && (
                <span className="text-[10px] text-green-600 font-semibold truncate max-w-[150px]">
                  ✓ Comprovante anexado
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-center text-sm font-bold text-white sonic-gradient-gold rounded-2xl shadow-sm active:scale-98 transition-transform"
          >
            Lançar Despesa
          </button>
        </form>
      )}

      {/* Filter Options */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <select
          value={filterPagante}
          onChange={e => setFilterPagante(e.target.value as any)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none shadow-sm"
        >
          <option value="todos">Todos Pagantes</option>
          <option value="Wellington">Wellington</option>
          <option value="Raissa">Raissa</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none shadow-sm"
        >
          <option value="todos">Todos Pagamentos</option>
          <option value="pago">Quitados</option>
          <option value="pendente">Pendentes</option>
        </select>
      </div>

      {/* Expenses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400 text-sm bg-white border border-slate-100 rounded-3xl">
            Nenhuma despesa lançada nesta categoria.
          </div>
        ) : (
          filtered.map(f => {
            const isFullyPaid = f.valor_pago === f.valor_total;
            return (
              <div 
                key={f.id} 
                className={`glass-card rounded-2xl p-4 border shadow-sm transition-all flex flex-col gap-2.5 ${
                  isFullyPaid ? 'border-green-200 bg-green-50/10' : 'border-red-100 bg-red-50/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 text-sm">{f.item}</h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">Por: {f.pagante}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(f.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-800">{formatCurrency(f.valor_total)}</span>
                    <div className="text-[10px] text-slate-400">Total</div>
                  </div>
                </div>

                {/* Sub details: Paid vs Pending */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400">Pago:</span>{' '}
                    <span className={`font-semibold ${isFullyPaid ? 'text-green-600' : 'text-slate-700'}`}>
                      {formatCurrency(f.valor_pago)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Pendente:</span>{' '}
                    <span className={`font-bold ${isFullyPaid ? 'text-green-600' : 'text-red-500'}`}>
                      {formatCurrency(f.valor_pendente)}
                    </span>
                  </div>
                </div>

                {f.observacao && (
                  <div className="text-[11px] bg-slate-50 text-slate-500 p-2 rounded-xl border border-slate-100">
                    <span className="font-bold">Obs:</span> {f.observacao}
                  </div>
                )}

                {/* Controls and Receipt */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {f.comprovante_url ? (
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); alert(`Visualizando comprovante: ${f.comprovante_url}`); }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sonic-sky hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Comprovante anexado
                      </a>
                    ) : (
                      <span className="text-[10px] italic text-slate-400">Sem comprovante</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFullPayment(f.id, f)}
                      className={`px-3 py-1.5 text-[10px] font-extrabold rounded-full border transition-all ${
                        isFullyPaid 
                          ? 'bg-green-100 border-green-200 text-green-700' 
                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`}
                    >
                      {isFullyPaid ? 'Marcar como Pendente' : 'Quitar Despesa'}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm(`Excluir despesa ${f.item}?`)) {
                          onDelete(f.id);
                        }
                      }}
                      className="p-2 bg-red-50 border border-red-100 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
