'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
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
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card Convidados */}
            <div className="glass-card rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              {/* Decorative Ring Background */}
              <div className="absolute right-2 top-2 w-12 h-12 border-2 border-yellow-400/20 rounded-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 text-sonic-blue rounded-2xl">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  {confirmados} ok
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800 tracking-tight">{totalConvidados}</div>
                <div className="text-xs font-bold text-slate-500">Convidados</div>
                
                <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2 text-[10px] text-slate-400">
                  <span>{adultos} Ad.</span>
                  <span>•</span>
                  <span>{criancas} Crianças</span>
                </div>
              </div>
            </div>

            {/* Card Financeiro */}
            <div className="glass-card rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              {/* Decorative Ring Background */}
              <div className="absolute right-2 top-2 w-12 h-12 border-2 border-yellow-400/20 rounded-full"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-yellow-50 text-ring-gold rounded-2xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                  {formatCurrency(totalPendente)}
                </span>
              </div>
              <div>
                <div className="text-xl font-black text-slate-800 tracking-tight">
                  {formatCurrency(totalOrcado)}
                </div>
                <div className="text-xs font-bold text-slate-500">Orçamento Total</div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2 text-[10px] text-slate-400">
                  <span className="text-green-600 font-semibold">{formatCurrency(totalPago)} pago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Relação de Pagantes e Criadores */}
          <div className="glass-card rounded-3xl p-5 shadow-md border border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Divisão de Responsabilidades (Wellington vs Raissa)
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
