'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { alertaNovaVenda, desbloquearAudio, somVenda } from '@/lib/sons';

const INTERVALO_MS = 8000;
const CHAVE = 'lojinha_alertas';

type NovaVenda = { id: string; clienteNome: string; total: number };

function chaveParaBytes(base64: string) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Inscreve este aparelho para receber avisos mesmo com o app fechado. */
async function inscreverPush(): Promise<boolean> {
  try {
    const chave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!chave || !('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    if (Notification.permission !== 'granted') return false;
    await navigator.serviceWorker.register('/sw.js');
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chaveParaBytes(chave) as any,
      });
    }
    const r = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function cancelarPush() {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  } catch {}
}

export default function AdminNotificador() {
  const [ativo, setAtivo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const cursor = useRef<string | null>(null);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lembra se o admin já tinha ativado os alertas
  useEffect(() => {
    try {
      if (localStorage.getItem(CHAVE) === '1') {
        setAtivo(true);
        inscreverPush(); // garante que o aparelho continua inscrito
      }
    } catch {}
  }, []);

  // Navegador exige um toque na página para liberar o som
  useEffect(() => {
    const liberar = () => desbloquearAudio();
    window.addEventListener('pointerdown', liberar, { once: true });
    return () => window.removeEventListener('pointerdown', liberar);
  }, []);

  const notificar = useCallback(async (vendas: NovaVenda[]) => {
    alertaNovaVenda();

    const brl = (v: number) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const titulo = vendas.length === 1 ? '🛍️ Nova compra!' : `🛍️ ${vendas.length} novas compras!`;
    const corpo =
      vendas.length === 1
        ? `${vendas[0].clienteNome} — ${brl(vendas[0].total)}`
        : vendas.map((v) => v.clienteNome).join(', ');

    setAviso(`${titulo} ${corpo}`);
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(null), 10000);

    // Notificação do sistema (barra de notificações do celular)
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const opts: any = {
          body: corpo,
          icon: '/icons/icon-192.png',
          tag: 'nova-venda',
          renotify: true,
          vibrate: [200, 100, 200],
        };
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg) reg.showNotification(titulo, opts);
        else new Notification(titulo, opts);
      }
    } catch {}

    window.dispatchEvent(new Event('nova-venda'));
  }, []);

  // Consulta o servidor a cada poucos segundos
  useEffect(() => {
    if (!ativo) return;
    cursor.current = null;
    let parado = false;

    const checar = async () => {
      if (parado) return;
      try {
        const qs = cursor.current ? `?desde=${encodeURIComponent(cursor.current)}` : '';
        const r = await fetch('/api/vendas/novas' + qs, { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        cursor.current = d.cursor;
        if (d.vendas?.length) notificar(d.vendas);
      } catch {}
    };

    checar();
    const t = setInterval(checar, INTERVALO_MS);
    const vis = () => document.visibilityState === 'visible' && checar();
    document.addEventListener('visibilitychange', vis);
    return () => {
      parado = true;
      clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [ativo, notificar]);

  const alternar = async () => {
    if (ativo) {
      await cancelarPush();
      setAtivo(false);
      try { localStorage.setItem(CHAVE, '0'); } catch {}
      return;
    }
    desbloquearAudio();
    somVenda(); // toque de teste
    try {
      if ('serviceWorker' in navigator) await navigator.serviceWorker.register('/sw.js');
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch {}
    setAtivo(true);
    try { localStorage.setItem(CHAVE, '1'); } catch {}

    const ok = await inscreverPush();
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const instalado = window.matchMedia('(display-mode: standalone)').matches;
    const msg = ok
      ? '✅ Alertas ligados, inclusive com o app fechado!'
      : ios && !instalado
      ? '⚠️ No iPhone, adicione o site à Tela de Início e ative de novo para receber com o app fechado.'
      : '⚠️ Alertas ligados, mas só com o app aberto (permita notificações no navegador).';
    setAviso(msg);
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(null), 8000);
  };

  return (
    <>
      <button
        onClick={alternar}
        className={`text-sm font-semibold px-3 py-2 rounded-xl border transition ${
          ativo
            ? 'bg-brand-50 text-brand-700 border-brand-200'
            : 'bg-white text-ink-500 border-ink-200 hover:bg-ink-50'
        }`}
        aria-pressed={ativo}
        title={ativo ? 'Alertas de venda ligados' : 'Ativar alertas de venda'}
      >
        {ativo ? '🔔' : '🔕'}
        <span className="hidden sm:inline ml-1">{ativo ? 'Alertas ligados' : 'Ativar alertas'}</span>
      </button>

      {aviso && (
        <Link
          href="/admin/vendas"
          onClick={() => setAviso(null)}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md bg-brand-600 text-white rounded-2xl shadow-2xl px-4 py-3 text-sm font-semibold animate-pop text-center"
        >
          {aviso}
        </Link>
      )}
    </>
  );
}
