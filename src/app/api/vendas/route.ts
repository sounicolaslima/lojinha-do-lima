import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json();
  const venda = await prisma.venda.create({
    data: {
      clienteNome: body.clienteNome,
      itens: body.itens, 
      total: Number(body.total),
    },
  });

  // Baixa de estoque
  for (const item of body.itens) {
    if (item.produtoId) {
      await prisma.produto
        .update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: Number(item.quantidade) } },
        })
        .catch(() => {});
    }
  }

  return NextResponse.json({ ...venda, itens: body.itens });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const inicio = searchParams.get('inicio');
  const fim = searchParams.get('fim');

  const where: any = {};
  if (inicio || fim) {
    where.criadoEm = {};
    if (inicio) where.criadoEm.gte = new Date(inicio);
    if (fim) {
      const f = new Date(fim);
      f.setHours(23, 59, 59, 999);
      where.criadoEm.lte = f;
    }
  }

  const vendas = await prisma.venda.findMany({
    where,
    orderBy: { criadoEm: 'desc' },
  });

  
 return NextResponse.json(vendas);
}