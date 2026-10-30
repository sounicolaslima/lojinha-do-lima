import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

let configurado = false;

function configurar() {
  if (configurado) return true;
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!publica || !privada) {
    console.error('[push] VAPID não configurado', { publica: !!publica, privada: !!privada });
    return false;
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@lojinha.com',
    publica,
    privada
  );
  configurado = true;
  return true;
}

export async function enviarPushNovaVenda(venda: { clienteNome: string; total: number }) {
  try {
    if (!configurar()) return;
    const inscritos = await prisma.pushSubscription.findMany();
    console.log(`[push] inscritos: ${inscritos.length}`);
    if (inscritos.length === 0) return;

    const valor = Number(venda.total).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const payload = JSON.stringify({
      title: '🛍️ Olha a compra, Limaaa!',
      body: `${venda.clienteNome} — ${valor}`,
      url: '/admin/vendas',
    });

    await Promise.allSettled(
      inscritos.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 60 * 60, urgency: 'high' }
          );
          console.log('[push] enviado para', s.endpoint.slice(0, 50));
        } catch (e: any) {
          console.error('[push] falhou', e?.statusCode, e?.body || e?.message);
          if (e?.statusCode === 404 || e?.statusCode === 410) {
            await prisma.pushSubscription
              .delete({ where: { endpoint: s.endpoint } })
              .catch(() => {});
          }
        }
      })
    );
  } catch (e) {
    console.error('[push] erro geral:', e);
  }
}