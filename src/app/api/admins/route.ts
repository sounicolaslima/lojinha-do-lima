import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// LISTAR
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admins = await prisma.admin.findMany({
    select: { id: true, nome: true, email: true, ativo: true, criadoEm: true },
    orderBy: { criadoEm: 'desc' },
  });
  return NextResponse.json(admins);
}

// CRIAR
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.nome || !body.email || !body.senha) {
    return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 });
  }

  const existe = await prisma.admin.findUnique({ where: { email: body.email } });
  if (existe) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(body.senha, 10);
  const admin = await prisma.admin.create({
    data: { nome: body.nome, email: body.email, senhaHash, ativo: true },
    select: { id: true, nome: true, email: true, ativo: true, criadoEm: true },
  });
  return NextResponse.json(admin);
}