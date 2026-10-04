import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.nome !== undefined) data.nome = body.nome;
  if (body.descricao !== undefined) data.descricao = body.descricao;
  if (body.preco !== undefined) data.preco = Number(body.preco);
  if (body.estoque !== undefined) data.estoque = Number(body.estoque);
  if (body.imagemUrl !== undefined) data.imagemUrl = body.imagemUrl;
  if (body.disponivel !== undefined) data.disponivel = body.disponivel;

  const produto = await prisma.produto.update({ where: { id: params.id }, data });
  return NextResponse.json(produto);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.produto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}