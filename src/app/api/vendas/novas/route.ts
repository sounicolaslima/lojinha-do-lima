import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Usado pelo painel admin para saber se entrou venda nova.
// Sem "desde": devolve só o cursor atual (data da última venda).
// Com "desde": devolve as vendas criadas depois dessa data.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const desde = new URL(req.url).searchParams.get('desde');

  if (!desde) {
    const ultima = await prisma.venda.findFirst({
      orderBy: { criadoEm: 'desc' },
      select: { criadoEm: true },
    });
    return NextResponse.json({
      cursor: (ultima?.criadoEm ?? new Date(0)).toISOString(),
      vendas: [],
    });
  }

  const vendas = await prisma.venda.findMany({
    where: { criadoEm: { gt: new Date(desde) } },
    orderBy: { criadoEm: 'asc' },
    select: { id: true, clienteNome: true, total: true, criadoEm: true },
  });

  const cursor = vendas.length ? vendas[vendas.length - 1].criadoEm.toISOString() : desde;
  return NextResponse.json({ cursor, vendas });
}
