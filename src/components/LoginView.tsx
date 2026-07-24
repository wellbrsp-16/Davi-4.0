'use client';

import { useState } from 'react';
import { Lock, User, Sparkles, AlertCircle } from 'lucide-react';
import { db, Usuario } from '@/utils/supabase';

interface LoginViewProps {
  onLoginSuccess: (user: Usuario) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    // Simulate small latency to show sonic spin animation
    setTimeout(async () => {
      try {
        const user = await db.loginUser(login, password);
        
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('Usuário ou senha incorretos.');
        }
      } catch (err) {
        setError('Erro na conexão com o banco de dados.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 green-hill-pattern">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200/50 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center mb-8 text-center">
          {/* Sonic Spin Logo */}
          <div className="w-16 h-16 border-4 border-yellow-400 rounded-full flex items-center justify-center animate-ring-pulse shadow-[0_0_15px_rgba(234,179,8,0.6)] bg-sonic-blue text-white font-black text-2xl tracking-tighter mb-4">
            4
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Davi 4.0 <span className="text-sonic-blue">Sonic</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
            Acesso ao Painel Oficial
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-150 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-5"
          autoComplete="off" /* Prevent standard autofill suggestions */
        >
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Usuário / Login
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Nome de usuário"
                name="sonic_login_field_rand" /* Random name to trick autocomplete */
                autoComplete="off"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue font-semibold text-slate-800 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso"
                name="sonic_password_field_rand" /* Random name to trick autocomplete */
                autoComplete="new-password" /* Direct browser to not pre-fill this */
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue font-semibold text-slate-800 transition-colors"
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-center text-sm font-bold text-white sonic-gradient-primary rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-yellow-400 rounded-full animate-spin"></div>
            ) : (
              <>
                Entrar na Aventura
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </>
            )}
          </button>
        </form>

        {/* Small theme guide footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          Wellington & Raissa • Festa de 4 Anos
        </div>

      </div>
    </div>
  );
}
