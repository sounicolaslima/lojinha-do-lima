import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get('admin') === '1';

  if (admin) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const produtos = await prisma.produto.findMany({ orderBy: { criadoEm: 'desc' } });
    return NextResponse.json(produtos);
  }

  const produtos = await prisma.produto.findMany({
    where: { disponivel: true, estoque: { gt: 0 } },
    orderBy: { criadoEm: 'desc' },
  });
  return NextResponse.json(produtos);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const produto = await prisma.produto.create({
    data: {
      nome: body.nome,
      descricao: body.descricao,
      preco: Number(body.preco),
      estoque: Number(body.estoque),
      imagemUrl: body.imagemUrl || null,
      disponivel: body.disponivel !== false,
    },
  });
  return NextResponse.json(produto);
}