'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import Logo from '@/components/Logo';

export default function CheckoutPage() {
  const [nome, setNome] = useState('');
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const router = useRouter();

  const handleContinuar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    sessionStorage.setItem('lojinha_cliente', nome.trim());
    router.push('/checkout/pix');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-xl font-bold mb-2">Seu carrinho está vazio</h1>
          <button onClick={() => router.push('/')} className="btn-primary mt-4">
            Voltar às compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Logo />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        <form onSubmit={handleContinuar} className="card p-6 space-y-4">
          <h1 className="text-xl font-bold">Seus dados</h1>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Seu nome completo *
            </label>
            <input
              className="input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              required
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-1">
              Usaremos esse nome para identificar seu pedido na retirada.
            </p>
          </div>
          <button type="submit" className="btn-primary w-full">
            Ir para o Pix →
          </button>
        </form>

        <div className="card p-6">
          <h2 className="font-bold mb-3">Resumo do pedido</h2>
          <ul className="divide-y divide-slate-100">
            {items.map((i) => (
              <li key={i.id} className="py-2 flex justify-between text-sm">
                <span>
                  {i.quantidade}× {i.nome}
                </span>
                <span className="font-semibold">
                  R$ {(i.preco * i.quantidade).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4 pt-4 border-t border-slate-100 font-extrabold text-lg">
            <span>Total</span>
            <span className="text-brand-700">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </main>
    </div>
  );
}