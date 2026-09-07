import React, { useState } from 'react';
import { Sparkles, Mail, Lock, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

interface LoginViewProps {
  onLoginSuccess: (userEmail: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('daniel.ddsb@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor, informe o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          onLoginSuccess(data.user.email || email);
        }
      } else {
        // Fallback local caso Supabase anon key ainda não esteja totalmente conectada
        onLoginSuccess(email);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar login. Verifique suas credenciais.';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMessage('E-mail ainda não confirmado. Ative seu usuário no painel do Supabase.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            DashBite <span className="text-indigo-400 text-xs px-2 py-0.5 rounded bg-indigo-500/10 font-semibold border border-indigo-500/20">PRO</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gestão Financeira & Controle de Faturas</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-slate-950/50">
          <div className="mb-6 border-b border-slate-800/80 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Acesso Restrito</h2>
              <p className="text-xs text-slate-400">Insira suas credenciais para gerenciar a conta</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          DashBite Finance &copy; 2026. Acesso exclusivo para administradores autorizados.
        </p>
      </div>
    </div>
  );
};
