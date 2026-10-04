'use client';
import { useEffect, useState } from 'react';
import type { Venda } from '@/types';

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function VendasAdmin() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (inicio) qs.set('inicio', inicio);
    if (fim) qs.set('fim', fim);
    const res = await fetch('/api/vendas?' + qs.toString());
    setVendas(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (v: Venda, campo: 'pixConferido' | 'mercadoriaRetirada') => {
    await fetch(`/api/vendas/${v.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [campo]: !v[campo] }),
    });
    load();
  };

  const status = (v: Venda) => {
    if (v.pixConferido && v.mercadoriaRetirada)
      return { label: 'Venda Finalizada', cls: 'bg-brand-100 text-brand-700' };
    if (v.pixConferido)
      return { label: 'Pix Conferido', cls: 'bg-blue-100 text-blue-700' };
    return { label: 'Aguardando Pix', cls: 'bg-amber-100 text-amber-700' };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Vendas</h1>

      <div className="card p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Data início</label>
          <input type="date" className="input" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Data fim</label>
          <input type="date" className="input" value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>
        <button onClick={load} className="btn-primary">
          🔍 Filtrar
        </button>
        <button
          onClick={() => {
            setInicio('');
            setFim('');
            setTimeout(load, 0);
          }}
          className="btn-secondary"
        >
          Limpar
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Carregando...</div>
      ) : vendas.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">Nenhuma venda no período.</div>
      ) : (
        <div className="space-y-3">
          {vendas.map((v) => {
            const s = status(v);
            return (
              <div key={v.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">{v.clienteNome}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(v.criadoEm).toLocaleString('pt-BR')}
                    </div>
                    <ul className="text-sm mt-2 space-y-0.5">
                      {v.itens.map((it, i) => (
                        <li key={i} className="text-slate-700">
                          {it.quantidade}× {it.nome} —{' '}
                          <span className="text-slate-500">
                            {brl(it.preco * it.quantidade)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-brand-700">
                      {brl(v.total)}
                    </div>
                    <span className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={v.pixConferido}
                      onChange={() => toggle(v, 'pixConferido')}
                    />
                    Pix conferido
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={v.mercadoriaRetirada}
                      onChange={() => toggle(v, 'mercadoriaRetirada')}
                    />
                    Mercadoria retirada
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}