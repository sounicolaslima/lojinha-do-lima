'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ProdutoCard from '@/components/ProdutoCard';
import CarrinhoDrawer from '@/components/CarrinhoDrawer';
import { useCart } from '@/lib/cart';
import type { Produto } from '@/types';

export default function HomePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const items = useCart((s) => s.items);

  useEffect(() => {
    fetch('/api/produtos')
      .then((r) => r.json())
      .then((d) => setProdutos(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(
    () =>
      produtos.filter((p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase().trim())
      ),
    [produtos, busca]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 via-white to-ink-50">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/80 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <Logo size={64} showTagline={true} />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex btn-ghost text-sm"
            >
              🔐 Painel Admin
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="btn-primary relative"
              aria-label="Abrir carrinho"
            >
              <span className="text-lg">🛒</span>
              <span className="hidden sm:inline">Carrinho</span>
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pop">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-400 p-8 sm:p-12 shadow-card">
          {/* Padrão decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white" />
            <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 mb-4">
              ⚡ Retirada rápida no local
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Olá, Seja muito Bem-Vindo(a),
            </h1>
            <p className="mt-4 text-white/90 text-lg max-w-2xl">
              Tá na correria do dia a dia? 🚗💨
              <br />
              Aproveite esse tempinho para conhecer nossa lojinha! Produtos
              selecionados, preços especiais e retirada rápida.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#produtos"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-bold px-5 py-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Ver produtos ↓
              </a>
              <div className="flex items-center gap-2 text-white/90 text-sm px-3 py-3">
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                <span>{produtos.length} produtos disponíveis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Busca */}
      <section id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
              🔍
            </span>
            <input
              className="input pl-11"
              placeholder="Buscar produto pelo nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar produto"
            />
          </div>
          <span className="text-sm text-ink-500 text-center sm:text-right">
            {loading
              ? 'Carregando...'
              : `${filtrados.length} produto${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </section>

      {/* Grid de produtos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-3">
                <div className="skeleton aspect-square rounded-xl mb-3" />
                <div className="skeleton h-3 mb-2" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="card p-12 sm:p-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-ink-800">
              {busca ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </h3>
            <p className="text-ink-500 mt-2">
              {busca
                ? `Não achamos nada com "${busca}". Tente outra busca.`
                : 'Volte em breve para conferir as novidades!'}
            </p>
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="btn-secondary mt-4"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 animate-fade-in">
            {filtrados.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
<footer className="border-t border-ink-100 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-center space-y-2">
    <p className="font-extrabold text-lg text-ink-800">
      Lojinha do Lima <span className="text-brand-600">💚</span>
    </p>
    <p className="text-sm text-ink-500">
      <span className="text-base">💚</span> Feito por{' '}
      <span className="font-semibold text-brand-700">Nicolas Lima</span>, com
      carinho, para clientes que sempre merecem{' '}
      <span className="text-base">➕</span>
    </p>
    <p className="text-xs text-ink-400 pt-2">
      Tá na correria do dia a dia? 🚗💨 A gente resolve.
    </p>
  </div>
</footer>

 <CarrinhoDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}