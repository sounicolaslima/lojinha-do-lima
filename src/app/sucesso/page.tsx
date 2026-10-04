'use client';
import Link from 'next/link';

export default function SucessoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="card p-8 sm:p-12 text-center max-w-lg">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-extrabold text-brand-700 mb-3">
          Compra efetuada com Sucesso!
        </h1>
        <p className="text-slate-600 text-lg">
          Solicite a retirada para um de nossos atendentes.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Obrigado por comprar na Lojinha do Lima 💚
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Fazer novo pedido
        </Link>
      </div>
    </div>
  );
}