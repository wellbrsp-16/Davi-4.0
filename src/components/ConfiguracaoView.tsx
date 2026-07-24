'use client';

import { useState } from 'react';
import { Settings, Save, Lock, Info, Sparkles, Database, LogOut } from 'lucide-react';

interface ConfiguracaoViewProps {
  config: { nome_aniversariante: string; data_festa: string };
  onUpdateConfig: (nome: string, data: string) => void;
  onLogout?: () => void;
}

export default function ConfiguracaoView({ config, onUpdateConfig, onLogout }: ConfiguracaoViewProps) {
  const [nome, setNome] = useState(config.nome_aniversariante);
  const [data, setData] = useState(config.data_festa.split('T')[0]);
  const [hora, setHora] = useState(
    new Date(config.data_festa).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // Password reset mockup state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Character card mockup
  const [activeSonicCharacter, setActiveSonicCharacter] = useState<'sonic' | 'tails' | 'knuckles' | 'shadow'>('sonic');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !data) return;

    // Combine data and hora
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

  const characters = {
    sonic: { name: 'Sonic the Hedgehog', color: 'bg-sonic-blue text-white border-blue-600', quote: 'Gotta go fast!', description: 'O aniversariante principal corre na velocidade do som e lidera a contagem regressiva!' },
    tails: { name: 'Miles "Tails" Prower', color: 'bg-yellow-500 text-white border-yellow-600', quote: 'I can build that!', description: 'O gênio mecânico que ajuda a cadastrar e filtrar os convidados.' },
    knuckles: { name: 'Knuckles the Echidna', color: 'bg-shoes-red text-white border-red-700', quote: 'Rougher than the rest of them!', description: 'O guardião forte que garante as configurações e a segurança de senhas.' },
    shadow: { name: 'Shadow the Hedgehog', color: 'bg-slate-900 text-red-400 border-red-900', quote: 'I am the ultimate life form.', description: 'O rival focado no controle absoluto das finanças e cumprimento dos prazos.' }
  };

  return (
    <div className="space-y-6 animate-dash">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Event Config & Password Change */}
        <div className="space-y-6">
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

        {/* Right Column: Character Team & Supabase Guides */}
        <div className="space-y-6">
          {/* Characters Tabs (Fun Theme Element) */}
          <div className="glass-card rounded-3xl p-5 border border-slate-100 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Time da Festa (Equipe Sonic)
            </h3>

            {/* Buttons */}
            <div className="flex gap-1.5 mb-4">
              {(Object.keys(characters) as Array<keyof typeof characters>).map(char => (
                <button
                  key={char}
                  onClick={() => setActiveSonicCharacter(char)}
                  className={`flex-1 py-1.5 text-center text-[10px] font-extrabold rounded-xl transition-all border capitalize cursor-pointer ${
                    activeSonicCharacter === char 
                      ? 'bg-sonic-blue text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>

            {/* Selected character details */}
            <div className={`p-4 rounded-2xl border transition-all ${characters[activeSonicCharacter].color}`}>
              <div className="font-black text-sm tracking-tight">{characters[activeSonicCharacter].name}</div>
              <div className="text-[11px] opacity-90 italic mt-0.5">&ldquo;{characters[activeSonicCharacter].quote}&rdquo;</div>
              <div className="text-xs mt-2 font-medium opacity-95">{characters[activeSonicCharacter].description}</div>
            </div>
          </div>

          {/* Supabase connection instructions */}
          <div className="bg-slate-900 rounded-3xl p-5 text-slate-300 space-y-3 border border-slate-800 shadow-md">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
              <Database className="w-4 h-4 text-emerald-400" />
              Conexão Supabase Real
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Atualmente o projeto está em modo <span className="text-emerald-400 font-bold">Simulado (localStorage)</span>. 
              Para sincronizar com seu banco de dados Supabase na nuvem:
            </p>
            <ol className="text-xs list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
              <li>Crie um projeto no Supabase</li>
              <li>Execute a migração SQL em <code className="text-white bg-slate-800 px-1 py-0.5 rounded">supabase/migrations</code></li>
              <li>Execute o seed em <code className="text-white bg-slate-800 px-1 py-0.5 rounded">supabase/seed.sql</code></li>
              <li>Adicione o arquivo <code className="text-white bg-slate-800 px-1 py-0.5 rounded">.env.local</code> na raiz do projeto com as chaves:</li>
            </ol>
            <pre className="text-[10px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_do_supabase`}
            </pre>
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

      </div>
    </div>
  );
}
