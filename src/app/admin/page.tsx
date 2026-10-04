'use client';
import { useEffect, useState } from 'react';

type Dash = {
  totalVendas: number;
  totalReceita: number;
  vendasDia: number;
  receitaDia: number;
  vendasMes: number;
  receitaMes: number;
  vendasAno: number;
  receitaAno: number;
  pendentesPix: number;
  pendentesRetirada: number;
};

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const [d, setD] = useState<Dash | null>(null);

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then(setD);
  }, []);

  if (!d) return <div className="text-slate-500">Carregando dashboard...</div>;

  const cards = [
    { label: 'Vendas hoje', value: d.vendasDia, sub: brl(d.receitaDia), icon: '📅' },
    { label: 'Vendas no mês', value: d.vendasMes, sub: brl(d.receitaMes), icon: '🗓️' },
    { label: 'Vendas no ano', value: d.vendasAno, sub: brl(d.receitaAno), icon: '📆' },
    { label: 'Total geral', value: d.totalVendas, sub: brl(d.totalReceita), icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{c.label}</span>
              <span className="text-2xl">{c.icon}</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{c.value}</div>
            <div className="text-sm text-brand-700 font-semibold mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 border-l-4 border-amber-400">
          <div className="text-sm text-slate-500">Pagamentos Pix pendentes de conferência</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">
            {d.pendentesPix}
          </div>
        </div>
        <div className="card p-5 border-l-4 border-blue-400">
          <div className="text-sm text-slate-500">Mercadorias aguardando retirada</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">
            {d.pendentesRetirada}
          </div>
        </div>
      </div>
    </div>
  );
}