'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, User, Baby, Sparkles, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Convidado, FinanceiroItem, PlanejamentoItem, RoteiroItem } from '@/utils/supabase';

interface DashboardProps {
  config: { nome_aniversariante: string; data_festa: string };
  convidados: Convidado[];
  financeiro: FinanceiroItem[];
  planejamento: PlanejamentoItem[];
  roteiro?: RoteiroItem[];
  onUpdateRoteiro?: (id: string, updates: Partial<RoteiroItem>) => void;
}

export default function DashboardView({ config, convidados, financeiro, planejamento, roteiro = [], onUpdateRoteiro }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Calculations for guests
  const totalConvidados = convidados.length;
  const confirmados = convidados.filter(c => c.confirmado === true).length;
  const naoVai = convidados.filter(c => c.confirmado === false).length;
  const pendentesConvidados = convidados.filter(c => c.confirmado === null).length;
  const criancas = convidados.filter(c => c.tipo === 'Criança').length;
  const adultos = totalConvidados - criancas;

  // Calculations for finance
  // Orçamento Previsto = soma dos valor_estimado do Planejamento
  const totalOrcamentoPrevisto = planejamento.reduce((acc, item) => acc + Number(item.valor_estimado), 0);
  // Gasto Real = soma do valor_total dos lançamentos reais
  const totalGastoReal = financeiro.reduce((acc, item) => acc + Number(item.valor_total), 0);
  // Total Pago = soma do valor_pago dos lançamentos reais
  const totalPago = financeiro.reduce((acc, item) => acc + Number(item.valor_pago), 0);
  const totalPendente = totalGastoReal - totalPago;

  // % do orçamento já comprometido com gastos reais
  const pctUsado = totalOrcamentoPrevisto > 0 ? Math.min((totalGastoReal / totalOrcamentoPrevisto) * 100, 100) : 0;
  const pctUsadoExato = totalOrcamentoPrevisto > 0 ? Math.round((totalGastoReal / totalOrcamentoPrevisto) * 100) : 0;

  // % do gasto real já quitado
  const pctPago = totalGastoReal > 0 ? Math.min((totalPago / totalGastoReal) * 100, 100) : 0;
  const pctPagoExato = totalGastoReal > 0 ? Math.round((totalPago / totalGastoReal) * 100) : 0;

  // Roteiro time calculation helpers
  const sortedRoteiro = [...roteiro].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const getMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const getRoteiroItemStyle = (item: RoteiroItem) => {
    if (item.status === 'OK') {
      return {
        cardStyle: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 border-l-4 border-l-emerald-500',
        dotStyle: 'bg-emerald-500 ring-4 ring-emerald-100 text-white',
        badgeStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-500/20',
        badgeText: '✓ Concluído',
        statusType: 'ok',
        highlightText: null
      };
    }

    const startMins = getMinutes(item.hora_inicio);
    const diff = startMins - currentMinutes;

    if (currentMinutes >= startMins) {
      return {
        cardStyle: 'bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/5 border-red-500/40 border-l-4 border-l-red-600 text-red-950 shadow-lg shadow-red-500/10 animate-pulse',
        dotStyle: 'bg-red-600 ring-4 ring-red-200 text-white animate-ping',
        badgeStyle: 'bg-red-600 hover:bg-red-700 text-white border-red-700 font-black shadow-md shadow-red-600/30',
        badgeText: '🚨 EXECUTAR AGORA',
        statusType: 'red',
        highlightText: '🔔 Hora de realizar este item do roteiro!'
      };
    } else if (diff > 0 && diff <= 15) {
      return {
        cardStyle: 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 border-amber-500/40 border-l-4 border-l-amber-500 text-amber-950 shadow-md',
        dotStyle: 'bg-amber-500 ring-4 ring-amber-100 text-white',
        badgeStyle: 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-900 font-black shadow-md',
        badgeText: `⏳ EM BREVE (${diff} min)`,
        statusType: 'yellow',
        highlightText: `⚠️ Faltam apenas ${diff} minuto(s) para o início`
      };
    } else {
      return {
        cardStyle: 'bg-slate-50/70 border-slate-200/90 text-slate-800 border-l-4 border-l-slate-300 hover:bg-slate-50',
        dotStyle: 'bg-slate-300 ring-4 ring-slate-100 text-slate-600',
        badgeStyle: 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200',
        badgeText: 'Pendente',
        statusType: 'pending',
        highlightText: null
      };
    }
  };

  // Legacy alias para a seção Divisão
  const totalOrcado = totalGastoReal;

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-dash">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* 1. Banner (Order 1 on Mobile & Desktop) */}
        <div className="order-1 lg:order-1">
          <div className="rounded-3xl shadow-xl relative overflow-hidden border border-slate-200/50 aspect-video md:aspect-[21/9] lg:aspect-video xl:aspect-[21/9]">
            <img 
              src="/images/sonic_friends_banner.png" 
              alt="Sonic and Friends" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
              <h2 className="text-base font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Aniversário do {config.nome_aniversariante}!
              </h2>

              <div className="pt-1.5 flex items-center gap-2 text-xs text-yellow-300 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  {new Date(config.data_festa).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Quick Stats and Progress (Order 2 on Mobile & Desktop) */}
        <div className="order-2 lg:order-2 space-y-6 lg:row-span-2">
          {/* Estatísticas Rápidas - Cards Modernos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card Convidados */}
            <div className="glass-card rounded-3xl p-5 shadow-lg border border-slate-200/60 bg-white/90 backdrop-blur-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
              {/* Header: Label e Total Principal */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lista de Convidados</span>
                    <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1 mt-0.5">
                      {totalConvidados} <span className="text-xs font-extrabold text-slate-400">pessoas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso de Confirmação */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Confirmações</span>
                  <span className="text-emerald-600 font-extrabold">
                    {totalConvidados > 0 ? Math.round((confirmados / totalConvidados) * 100) : 0}% confirmado
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalConvidados > 0 ? (confirmados / totalConvidados) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Grid 5 Mini Métricas sem texto em Adultos/Crianças */}
              <div className="grid grid-cols-5 gap-1 pt-1 text-xs whitespace-nowrap">
                <div className="bg-slate-50 border border-slate-100 px-1 py-2 rounded-xl flex items-center justify-center gap-1" title="Adultos">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-black text-slate-800 text-[11px]">{adultos}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 px-1 py-2 rounded-xl flex items-center justify-center gap-1" title="Crianças">
                  <Baby className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="font-black text-slate-800 text-[11px]">{criancas}</span>
                </div>

                <div className="bg-emerald-50/90 border border-emerald-200/80 px-1 py-2 rounded-xl flex items-center justify-center gap-1 text-emerald-800" title="Confirmados">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-black text-emerald-900 text-[11px]">{confirmados}</span>
                </div>

                <div className="bg-amber-50/90 border border-amber-200/80 px-1 py-2 rounded-xl flex items-center justify-center gap-1 text-amber-800" title="Pendentes">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-black text-amber-900 text-[11px]">{pendentesConvidados}</span>
                </div>

                <div className="bg-rose-50/90 border border-rose-200/80 px-1 py-2 rounded-xl flex items-center justify-center gap-1 text-rose-800" title="Não vão">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="font-black text-rose-900 text-[11px]">{naoVai}</span>
                </div>
              </div>
            </div>

            {/* Card Orçamento */}
            <div className="glass-card rounded-3xl p-5 shadow-lg border border-slate-200/60 bg-white/90 backdrop-blur-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
              {/* Header: Orçamento Previsto (Planejamento) */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-yellow-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orçamento Previsto</span>
                    <div className="text-xl font-black text-slate-900 tracking-tight leading-none mt-0.5 whitespace-nowrap">
                      {formatCurrency(totalOrcamentoPrevisto)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra 1: % do orçamento já comprometido com gastos reais */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Orçamento utilizado</span>
                  <span className={`font-extrabold ${pctUsadoExato > 90 ? 'text-rose-600' : pctUsadoExato > 60 ? 'text-amber-600' : 'text-indigo-600'}`}>
                    {formatCurrency(totalGastoReal)} · {pctUsadoExato}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pctUsadoExato > 90 ? 'bg-gradient-to-r from-rose-500 to-red-400' : pctUsadoExato > 60 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-indigo-500 to-blue-400'}`}
                    style={{ width: `${pctUsado}%` }}
                  />
                </div>
              </div>

              {/* Barra 2: % do gasto real já pago */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Gasto real pago</span>
                  <span className="text-emerald-600 font-extrabold">
                    {pctPagoExato}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${pctPago}%` }}
                  />
                </div>
              </div>

              {/* Sub-métricas: Pago e Pendente */}
              <div className="grid grid-cols-2 gap-1.5 text-xs whitespace-nowrap">
                <div className="bg-emerald-50/90 border border-emerald-200/80 px-2 py-2 rounded-xl flex items-center justify-center gap-1 text-[10px] sm:text-[11px]" title="Total Pago">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-black text-emerald-900">{formatCurrency(totalPago)}</span>
                </div>

                <div className="bg-rose-50/90 border border-rose-200/80 px-2 py-2 rounded-xl flex items-center justify-center gap-1 text-[10px] sm:text-[11px]" title="Total Pendente">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="font-black text-rose-900">{formatCurrency(totalPendente)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Relação de Pagantes e Criadores */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Divisão
            </h3>

            {(() => {
              const welGastos = financeiro.filter(f => f.pagante === 'Wellington').reduce((acc, curr) => acc + Number(curr.valor_pago), 0);
              const raiGastos = financeiro.filter(f => f.pagante === 'Raissa').reduce((acc, curr) => acc + Number(curr.valor_pago), 0);
              const welConv = convidados.filter(c => c.convidado_por === 'Wellington').length;
              const raiConv = convidados.filter(c => c.convidado_por === 'Raissa').length;
              const totalGastos = welGastos + raiGastos;
              const totalConv = welConv + raiConv;

              const welPctGasto = totalGastos > 0 ? welGastos / totalGastos : 0.5;
              const raiPctGasto = 1 - welPctGasto;

              const welPctConv = totalConv > 0 ? welConv / totalConv : 0.5;
              const raiPctConv = 1 - welPctConv;

              return (
                <div className="space-y-6">
                  {/* Gastos Split */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="font-extrabold text-blue-600 block text-[10px] uppercase">Wellington</span>
                        <span className="font-black text-slate-800 text-sm">{formatCurrency(welGastos)}</span>
                      </div>
                      <div className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-0.5">
                        Divisão de Gastos
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-pink-600 block text-[10px] uppercase">Raissa</span>
                        <span className="font-black text-slate-800 text-sm">{formatCurrency(raiGastos)}</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 flex items-center justify-start pl-3 text-[10px] font-black text-white"
                        style={{ width: `${welPctGasto * 100}%` }}
                      >
                        {welPctGasto > 0.15 && `${Math.round(welPctGasto * 100)}%`}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500 flex items-center justify-end pr-3 text-[10px] font-black text-white"
                        style={{ width: `${raiPctGasto * 100}%` }}
                      >
                        {raiPctGasto > 0.15 && `${Math.round(raiPctGasto * 100)}%`}
                      </div>
                    </div>
                  </div>

                  {/* Convidados Split */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="font-extrabold text-blue-600 block text-[10px] uppercase">Wellington</span>
                        <span className="font-black text-slate-800 text-sm">{welConv} conv.</span>
                      </div>
                      <div className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-0.5">
                        Divisão de Convidados
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-pink-600 block text-[10px] uppercase">Raissa</span>
                        <span className="font-black text-slate-800 text-sm">{raiConv} conv.</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 flex items-center justify-start pl-3 text-[10px] font-black text-white"
                        style={{ width: `${welPctConv * 100}%` }}
                      >
                        {welPctConv > 0.15 && `${Math.round(welPctConv * 100)}%`}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500 flex items-center justify-end pr-3 text-[10px] font-black text-white"
                        style={{ width: `${raiPctConv * 100}%` }}
                      >
                        {raiPctConv > 0.15 && `${Math.round(raiPctConv * 100)}%`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 3. Roteiro da Festa (Order 3: LAST on Mobile, under Banner on Desktop) */}
        <div className="order-3 lg:order-3">
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-200/60 bg-white/90 backdrop-blur-md space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sonic-blue flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">
                    Roteiro da Festa
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Cronograma de eventos em tempo real
                  </p>
                </div>
              </div>

              {/* Progress pill */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="block text-[11px] font-black text-slate-800">
                    {sortedRoteiro.filter(r => r.status === 'OK').length}/{sortedRoteiro.length}
                  </span>
                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                    Concluídos
                  </span>
                </div>
                <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: sortedRoteiro.length > 0
                        ? `${(sortedRoteiro.filter(r => r.status === 'OK').length / sortedRoteiro.length) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            </div>

            {sortedRoteiro.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-500">Nenhum evento cadastrado</p>
                <p className="text-[10px] text-slate-400">Cadastre o cronograma na aba Configurações</p>
              </div>
            ) : (
              <div className="relative pl-3 space-y-4">
                {/* Vertical Connector Line */}
                <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-100" />

                {sortedRoteiro.map(item => {
                  const style = getRoteiroItemStyle(item);
                  return (
                    <div key={item.id} className="relative flex items-start gap-4 group">
                      {/* Timeline Node Dot */}
                      <div className={`relative z-10 w-4 h-4 mt-3 rounded-full shrink-0 transition-transform ${style.dotStyle}`} />

                      {/* Event Content Card */}
                      <div className={`flex-1 p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${style.cardStyle}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-[11px] px-2 py-0.5 rounded-lg bg-slate-900/10 text-current border border-current/15 tracking-tight font-mono">
                                ⏰ {item.hora_inicio}{item.hora_fim ? ` - ${item.hora_fim}` : ''}
                              </span>
                              <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-snug">
                                {item.evento}
                              </span>
                            </div>

                            {style.highlightText && (
                              <p className="text-[10px] font-extrabold tracking-wide mt-1 animate-pulse">
                                {style.highlightText}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => onUpdateRoteiro && onUpdateRoteiro(item.id, { status: item.status === 'OK' ? 'Pendente' : 'OK' })}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${style.badgeStyle}`}
                          >
                            {style.badgeText}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
