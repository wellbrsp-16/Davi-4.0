'use client';

import { useState, useEffect } from 'react';
import { db, Convidado } from '@/utils/supabase';
import { Sparkles, Calendar, Clock, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface RSVPViewProps {
  guestId: string;
}

export default function RSVPView({ guestId }: RSVPViewProps) {
  const [guest, setGuest] = useState<Convidado | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<'yes' | 'no' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch guest information
  useEffect(() => {
    const fetchGuest = async () => {
      try {
        const data = await db.getConvidadoById(guestId);
        if (data) {
          setGuest(data);
          // If already confirmed in some way, we can pre-set
          if (data.confirmado === true) {
            setConfirmed('yes');
          } else if (data.confirmado === false) {
            setConfirmed('no');
          } else {
            setConfirmed(null);
          }
        } else {
          setError('Convite não encontrado. Por favor, verifique o link.');
        }
      } catch (err) {
        setError('Erro ao carregar o convite.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [guestId]);

  const handleRSVP = async (going: boolean) => {
    if (!guest) return;
    setSubmitting(true);
    try {
      const updated = await db.updateConvidado(guest.id, { confirmado: going });
      if (updated) {
        setGuest(updated);
        setConfirmed(going ? 'yes' : 'no');
      } else {
        alert('Ocorreu um erro ao salvar sua resposta. Tente novamente.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar sua resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Carregando seu convite...
        </p>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black tracking-tight mb-2">Ops! Algo deu errado</h2>
        <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">{error || 'Convite inválido.'}</p>
        <a 
          href="/"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-2xl transition-all"
        >
          Ir para a tela inicial
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8 relative overflow-hidden green-hill-pattern">
      {/* Decorative ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-2xl relative z-10 text-center space-y-6">
        
        {/* Theme Header */}
        <div className="flex flex-col items-center">
          {/* Static Sonic Image */}
          <img 
            src="/images/sonic_static.png" 
            alt="Sonic the Hedgehog" 
            className="w-28 h-28 object-contain mb-3 select-none"
          />
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Festa de 4 Anos do Davi
          </h2>
          <h1 className="text-base font-black text-slate-900 tracking-tight mt-2 max-w-[280px] leading-snug">
            Acelere o passo, a festa vai começar!
          </h1>
        </div>

        {/* Guest Greeting Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Convidado(a)</p>
          <p className="text-lg font-black text-slate-850 tracking-tight mt-0.5">{guest.nome}</p>
          <span className="inline-block mt-1.5 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200/60 text-slate-600 uppercase">
            👉 {guest.tipo}
          </span>
        </div>

        {/* Party Info */}
        <div className="space-y-3 text-left bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-sonic-blue shrink-0" />
            <div>
              <p className="font-bold text-slate-700">Data da Festa</p>
              <p className="text-slate-500">Domingo, 06 de Setembro de 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-tails-orange shrink-0" />
            <div>
              <p className="font-bold text-slate-700">Horário</p>
              <p className="text-slate-500">A partir das 14:00h</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 mt-1">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700">Localização</p>
                <p className="text-slate-500 leading-normal">R. Professor Thiré, 130 - Vila Nhocuné - Arthur Alvim</p>
              </div>
            </div>
            {/* Navigation buttons */}
            <div className="grid grid-cols-2 gap-2 mt-1 pl-7">
              <a
                href="https://www.google.com/maps/search/?api=1&query=R.+Professor+Thir%C3%A9%2C+130+-+Vila+Nhocun%C3%A9+-+Arthur+Alvim"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200 select-none"
              >
                🗺️ Google Maps
              </a>
              <a
                href="https://waze.com/ul?q=R.+Professor+Thir%C3%A9%2C+130+-+Vila+Nhocun%C3%A9+-+Arthur+Alvim"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200 select-none"
              >
                🚗 Waze
              </a>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        {submitting ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-sonic-blue animate-spin" />
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Gravando sua resposta...</p>
          </div>
        ) : confirmed === 'yes' ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-emerald-800 space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <div>
              <p className="font-black text-sm">Presença Confirmada! 🎉</p>
            </div>
            <button
              onClick={() => handleRSVP(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline"
            >
              Alterar minha resposta
            </button>
          </div>
        ) : confirmed === 'no' ? (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-rose-800 space-y-3">
            <XCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <div>
              <p className="font-black text-sm">Que pena! 😢</p>
            </div>
            <button
              onClick={() => handleRSVP(true)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline"
            >
              Alterar minha resposta e ir à festa!
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500">Você poderá comparecer?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRSVP(true)}
                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🚀 Sim, eu vou!
              </button>
              <button
                onClick={() => handleRSVP(false)}
                className="py-3 px-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                😢 Não vou
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
