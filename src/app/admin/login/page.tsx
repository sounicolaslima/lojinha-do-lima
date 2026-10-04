'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push(params.get('callbackUrl') || '/admin');
    } else {
      setErro('E-mail ou senha incorretos. Verifique e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-white to-brand-50 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <form
        onSubmit={handleSubmit}
        className="card p-8 sm:p-10 w-full max-w-md space-y-6 relative z-10 shadow-lift animate-slide-up"
      >
        <div className="flex justify-center">
          <div className="flex justify-center">
           <Logo size={80} showTagline={false} />
        </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-xl font-extrabold text-ink-900">
            Painel Administrativo
          </h1>
          <p className="text-sm text-ink-500">Acesso restrito a colaboradores</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
        </div>

        {erro && (
          <div
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 animate-fade-in"
          >
            <span>⚠️</span>
            <span>{erro}</span>
          </div>
        )}

        <button className="btn-primary w-full py-3 text-base" disabled={loading}>
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Entrando...
            </>
          ) : (
            <>Entrar →</>
          )}
        </button>

        <p className="text-center text-xs text-ink-400">
          🔒 Conexão segura • Dados criptografados
        </p>
      </form>
    </div>
  );
}