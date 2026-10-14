import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.pixConferido !== undefined) data.pixConferido = body.pixConferido;
  if (body.mercadoriaRetirada !== undefined) data.mercadoriaRetirada = body.mercadoriaRetirada;

  const venda = await prisma.venda.update({ where: { id: params.id }, data });
  return NextResponse.json(venda);
}

// 🆕 DELETE — excluir uma venda
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.venda.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}