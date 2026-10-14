'use client';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import type { Produto } from '@/types';
import { useState } from 'react';

export default function ProdutoCard({ produto }: { produto: Produto }) {
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [feedback, setFeedback] = useState(false);

  const noCarrinho = items.find((i) => i.id === produto.id);
  const semEstoque = produto.estoque <= 0;
  const estoqueBaixo = produto.estoque > 0 && produto.estoque <= 3;

  const handleAdd = () => {
    if (semEstoque) return;
    add({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: produto.imagemUrl,
      estoque: produto.estoque,
    });
    setFeedback(true);
    setTimeout(() => setFeedback(false), 1200);
  };

  return (
    <article className="card-hover overflow-hidden flex flex-col group">
      {/* Imagem */}
      <div className="relative aspect-square bg-gradient-to-br from-ink-50 to-ink-100 overflow-hidden">
        {produto.imagemUrl ? (
          <Image
            src={produto.imagemUrl}
            alt={produto.nome}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-ink-300">
            📦
          </div>
        )}

        {estoqueBaixo && !semEstoque && (
          <div className="absolute top-2 left-2 badge bg-accent-500 text-white shadow-md">
            ⚡ Últimas {produto.estoque}
          </div>
        )}

        {noCarrinho && (
          <div className="absolute top-2 right-2 badge bg-brand-600 text-white shadow-md">
            ✓ {noCarrinho.quantidade} no carrinho
          </div>
        )}

        {semEstoque && (
          <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="badge bg-white text-ink-800 text-sm px-4 py-2 shadow-lg">
              😔 Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-ink-900 text-sm leading-snug line-clamp-2 min-h-[2.4em]">
          {produto.nome}
        </h3>
        <p className="text-xs text-ink-500 mt-1.5 line-clamp-2 flex-1 leading-relaxed">
          {produto.descricao}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-ink-400 font-semibold">
              Preço
            </div>
            <div className="text-lg font-extrabold text-brand-700 leading-none">
              R$ {produto.preco.toFixed(2)}
            </div>
          </div>

          {noCarrinho ? (
            // Já está no carrinho: mostra - qtd +
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (noCarrinho.quantidade <= 1) {
                    remove(produto.id);
                  } else {
                    setQty(produto.id, noCarrinho.quantidade - 1);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold flex items-center justify-center transition"
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold text-ink-900">
                {noCarrinho.quantidade}
              </span>
              <button
                onClick={() => setQty(produto.id, noCarrinho.quantidade + 1)}
                disabled={noCarrinho.quantidade >= produto.estoque}
                className="w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>
          ) : (
            // Não está no carrinho: botão de adicionar
            <button
              onClick={handleAdd}
              disabled={semEstoque}
              className={`btn text-xs px-3 py-2 transition-all ${
                feedback ? 'bg-brand-600 text-white scale-95' : 'btn-primary'
              }`}
              aria-label={`Adicionar ${produto.nome} ao carrinho`}
            >
              {feedback ? (
                <>
                  <span>✓</span>
                  <span className="hidden sm:inline">Adicionado</span>
                </>
              ) : (
                <>
                  <span>+</span>
                  <span className="hidden sm:inline">Adicionar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}