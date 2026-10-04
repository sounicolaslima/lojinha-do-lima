'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';

export default function CarrinhoDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="p-5 border-b border-ink-100 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg text-ink-900">Seu Carrinho</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {items.length === 0
                ? 'Nenhum item'
                : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-ink-100 hover:bg-ink-200 flex items-center justify-center transition"
            aria-label="Fechar carrinho"
          >
            ✕
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-6xl mb-3 opacity-30">🛒</div>
              <p className="font-semibold text-ink-700">Seu carrinho está vazio</p>
              <p className="text-sm text-ink-500 mt-1">
                Que tal dar uma olhada nos produtos?
              </p>
            </div>
          ) : (
            <>
              {items.map((i) => (
                <div
                  key={i.id}
                  className="card p-3 flex gap-3 items-center hover:shadow-card transition-shadow animate-slide-up"
                >
                  <div className="w-16 h-16 rounded-xl bg-ink-100 overflow-hidden flex-shrink-0">
                    {i.imagemUrl ? (
                      <Image
                        src={i.imagemUrl}
                        alt={i.nome}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-ink-300">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">
                      {i.nome}
                    </p>
                    <p className="text-sm text-brand-700 font-bold mt-0.5">
                      R$ {i.preco.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => setQty(i.id, i.quantidade - 1)}
                        className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-sm font-bold text-ink-700 transition"
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-ink-800">
                        {i.quantidade}
                      </span>
                      <button
                        onClick={() => setQty(i.id, i.quantidade + 1)}
                        className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-sm font-bold text-ink-700 transition disabled:opacity-40"
                        disabled={i.quantidade >= i.estoque}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(i.id)}
                    className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition"
                    aria-label={`Remover ${i.nome}`}
                    title="Remover item"
                  >
                    🗑️
                  </button>
                </div>
              ))}

              {items.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm('Esvaziar o carrinho?')) clear();
                  }}
                  className="w-full text-xs text-ink-500 hover:text-red-600 py-2 transition"
                >
                  Esvaziar carrinho
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-ink-100 p-5 space-y-4 bg-ink-50/50">
            <div className="flex items-center justify-between">
              <span className="text-ink-600 font-medium">Subtotal</span>
              <span className="text-2xl font-extrabold text-brand-700">
                R$ {total.toFixed(2)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="btn-primary w-full text-base py-3"
              onClick={onClose}
            >
              Finalizar Compra →
            </Link>
            <p className="text-xs text-ink-400 text-center">
              🔒 Pagamento via Pix • Retirada no local
            </p>
          </div>
        )}
      </aside>
    </>
  );
}