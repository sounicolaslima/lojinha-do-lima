import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// EDITAR
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.nome !== undefined) data.nome = body.nome;
  if (body.email !== undefined) data.email = body.email;
  if (body.ativo !== undefined) data.ativo = body.ativo;
  if (body.senha) data.senhaHash = await bcrypt.hash(body.senha, 10);

  const admin = await prisma.admin.update({
    where: { id: params.id },
    data,
    select: { id: true, nome: true, email: true, ativo: true, criadoEm: true },
  });
  return NextResponse.json(admin);
}

// EXCLUIR
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.admin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
