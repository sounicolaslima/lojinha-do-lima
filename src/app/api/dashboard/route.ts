import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const agora = new Date();
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioAno = new Date(agora.getFullYear(), 0, 1);

  const [
    totalVendas,
    totalReceita,
    vendasDia,
    receitaDia,
    vendasMes,
    receitaMes,
    vendasAno,
    receitaAno,
    pendentesPix,
    pendentesRetirada,
  ] = await Promise.all([
    prisma.venda.count(),
    prisma.venda.aggregate({ _sum: { total: true } }),
    prisma.venda.count({ where: { criadoEm: { gte: inicioDia } } }),
    prisma.venda.aggregate({
      _sum: { total: true },
      where: { criadoEm: { gte: inicioDia } },
    }),
    prisma.venda.count({ where: { criadoEm: { gte: inicioMes } } }),
    prisma.venda.aggregate({
      _sum: { total: true },
      where: { criadoEm: { gte: inicioMes } },
    }),
    prisma.venda.count({ where: { criadoEm: { gte: inicioAno } } }),
    prisma.venda.aggregate({
      _sum: { total: true },
      where: { criadoEm: { gte: inicioAno } },
    }),
    prisma.venda.count({ where: { pixConferido: false } }),
    prisma.venda.count({ where: { mercadoriaRetirada: false } }),
  ]);

  return NextResponse.json({
    totalVendas,
    totalReceita: totalReceita._sum.total || 0,
    vendasDia,
    receitaDia: receitaDia._sum.total || 0,
    vendasMes,
    receitaMes: receitaMes._sum.total || 0,
    vendasAno,
    receitaAno: receitaAno._sum.total || 0,
    pendentesPix,
    pendentesRetirada,
  });
}