'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, User, Baby, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Convidado, FinanceiroItem } from '@/utils/supabase';

interface DashboardProps {
  config: { nome_aniversariante: string; data_festa: string };
  convidados: Convidado[];
  financeiro: FinanceiroItem[];
}

export default function DashboardView({ config, convidados, financeiro }: DashboardProps) {
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  // Calculate countdown
  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(config.data_festa) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
        return;
      }

      setTimeLeft({
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.data_festa]);

  // Calculations for guests
  const totalConvidados = convidados.length;
  const confirmados = convidados.filter(c => c.confirmado).length;
  const pendentesConvidados = totalConvidados - confirmados;
  const criancas = convidados.filter(c => c.tipo === 'Criança').length;
  const adultos = totalConvidados - criancas;

  // Calculations for finance
  const totalOrcado = financeiro.reduce((acc, item) => acc + Number(item.valor_total), 0);
  const totalPago = financeiro.reduce((acc, item) => acc + Number(item.valor_pago), 0);
  const totalPendente = totalOrcado - totalPago;

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-dash">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Banner and Countdown */}
        <div className="space-y-6">
          {/* Banner de Boas-vindas Temático */}
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

          {/* Contador Regressivo (Sonic Speed Countdown) */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
              <Clock className="w-4 h-4 text-sonic-blue" />
              Contagem Regressiva para a Aventura
            </h3>
            
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'Dias', value: timeLeft.dias, color: 'text-sonic-blue' },
                { label: 'Horas', value: timeLeft.horas, color: 'text-tails-orange' },
                { label: 'Min', value: timeLeft.minutos, color: 'text-ring-gold' },
                { label: 'Seg', value: timeLeft.segundos, color: 'text-shoes-red' }
              ].map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                  <div className={`text-2xl font-black ${item.color} tracking-tight`}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats and Progress */}
        <div className="space-y-6">
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

              {/* Grid 4 Mini Métricas sem texto em Adultos/Crianças */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-xs whitespace-nowrap">
                <div className="bg-slate-50 border border-slate-100 px-2 py-2 rounded-xl flex items-center justify-center gap-1" title="Adultos">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-black text-slate-800 text-xs">{adultos}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 px-2 py-2 rounded-xl flex items-center justify-center gap-1" title="Crianças">
                  <Baby className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="font-black text-slate-800 text-xs">{criancas}</span>
                </div>

                <div className="bg-emerald-50/90 border border-emerald-200/80 px-2 py-2 rounded-xl flex items-center justify-center gap-1 text-emerald-800" title="Confirmados">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-black text-emerald-900 text-xs">{confirmados}</span>
                </div>

                <div className="bg-amber-50/90 border border-amber-200/80 px-2 py-2 rounded-xl flex items-center justify-center gap-1 text-amber-800" title="Pendentes">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-black text-amber-900 text-xs">{pendentesConvidados}</span>
                </div>
              </div>
            </div>

            {/* Card Orçamento */}
            <div className="glass-card rounded-3xl p-5 shadow-lg border border-slate-200/60 bg-white/90 backdrop-blur-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
              {/* Header: Label e Valor Total */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-yellow-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orçamento Previsto</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mt-0.5 whitespace-nowrap">
                      {formatCurrency(totalOrcado)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso Financeiro */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 whitespace-nowrap">
                  <span>Progresso de Pagamentos</span>
                  <span className="text-emerald-600 font-extrabold">
                    {totalOrcado > 0 ? Math.round((totalPago / totalOrcado) * 100) : 0}% pago
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalOrcado > 0 ? (totalPago / totalOrcado) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Sub-métricas Financeiras sem truncamento com fonte ajustada */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs whitespace-nowrap">
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
          <div className="glass-card rounded-3xl p-5 shadow-md border border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Divisão
            </h3>
            
            <div className="space-y-3">
              {/* Wellington Progress */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Wellington</span>
                  <span>
                    {convidados.filter(c => c.convidado_por === 'Wellington').length} convidados / {' '}
                    {formatCurrency(financeiro.filter(f => f.pagante === 'Wellington').reduce((acc, curr) => acc + Number(curr.valor_total), 0))}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full sonic-gradient-primary rounded-full" 
                    style={{
                      width: `${(financeiro.filter(f => f.pagante === 'Wellington').reduce((acc, curr) => acc + Number(curr.valor_total), 0) / (totalOrcado || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Raissa Progress */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Raissa</span>
                  <span>
                    {convidados.filter(c => c.convidado_por === 'Raissa').length} convidados / {' '}
                    {formatCurrency(financeiro.filter(f => f.pagante === 'Raissa').reduce((acc, curr) => acc + Number(curr.valor_total), 0))}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 rounded-full" 
                    style={{
                      width: `${(financeiro.filter(f => f.pagante === 'Raissa').reduce((acc, curr) => acc + Number(curr.valor_total), 0) / (totalOrcado || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
