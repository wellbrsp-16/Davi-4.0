'use client';

import { useState } from 'react';
import { Lock, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { db, Usuario } from '@/utils/supabase';

interface ForcePasswordChangeViewProps {
  user: Usuario;
  onPasswordChanged: (updatedUser: Usuario) => void;
}

export default function ForcePasswordChangeView({ user, onPasswordChanged }: ForcePasswordChangeViewProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError('A nova senha não pode ser vazia.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não conferem.');
      return;
    }

    if (newPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword === 'admin') {
      setError('Por razões de segurança, não use a senha padrão "admin".');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate password hash and storage update latency
    setTimeout(async () => {
      try {
        const successUpdate = await db.updateUserPassword(user.id, newPassword);
        
        if (successUpdate) {
          setSuccess(true);
          // Delay callback slightly to show the beautiful green success card
          setTimeout(() => {
            // Fetch updated user from state (where forcar_troca_senha is now false)
            const updatedUser = {
              ...user,
              forcar_troca_senha: false,
              ultimo_acesso: new Date().toISOString()
            };
            onPasswordChanged(updatedUser);
          }, 1500);
        } else {
          setError('Erro ao atualizar a senha no banco de dados.');
        }
      } catch (err) {
        setError('Erro na conexão com o banco de dados.');
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 green-hill-pattern">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200/50 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
            <Lock className="w-6 h-6 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Alteração Obrigatória de Senha
          </h2>
          <p className="text-xs text-slate-500 mt-2 max-w-xs">
            Olá, <span className="font-bold text-slate-700">{user.nome}</span>! Como este é seu primeiro acesso ou sua conta foi resetada, você deve definir uma nova senha.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-150 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-green-50 border border-green-150 text-green-700 px-5 py-6 rounded-2xl text-center flex flex-col items-center gap-2 animate-pulse mb-2">
            <CheckCircle className="w-10 h-10 text-green-500 mb-1" />
            <h3 className="text-sm font-black uppercase tracking-wider">Senha Atualizada!</h3>
            <p className="text-xs text-green-600">Redirecionando para a Green Hill Zone...</p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            autoComplete="off"
          >
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Defina sua nova senha"
                  name="sonic_new_pwd"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue font-semibold text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  name="sonic_confirm_pwd"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sonic-blue font-semibold text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-center text-sm font-bold text-white bg-slate-900 hover:bg-slate-850 rounded-2xl shadow-md active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-yellow-400 rounded-full animate-spin"></div>
              ) : (
                <>
                  Confirmar Nova Senha
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
