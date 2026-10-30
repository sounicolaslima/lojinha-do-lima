import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Venda finalizada = Pix conferido E mercadoria retirada
function ehFinal(v: { pixConferido: boolean; mercadoriaRetirada: boolean }) {
  return v.pixConferido && v.mercadoriaRetirada;
}

type ItemVenda = { produtoId?: string; quantidade?: number };

/** sinal -1 baixa o estoque, +1 devolve. updateMany não dá erro se o produto não existir mais. */
async function ajustarEstoque(tx: any, itens: any, sinal: 1 | -1) {
  if (!Array.isArray(itens)) return;
  for (const item of itens as ItemVenda[]) {
    if (!item?.produtoId) continue;
    const qtd = Number(item.quantidade) || 0;
    if (qtd <= 0) continue;
    await tx.produto.updateMany({
      where: { id: item.produtoId },
      data: { estoque: sinal === -1 ? { decrement: qtd } : { increment: qtd } },
    });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.pixConferido !== undefined) data.pixConferido = body.pixConferido;
  if (body.mercadoriaRetirada !== undefined) data.mercadoriaRetirada = body.mercadoriaRetirada;

  const atual = await prisma.venda.findUnique({ where: { id: params.id } });
  if (!atual) return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });

  const eraFinal = ehFinal(atual);
  const ficaFinal = ehFinal({ ...atual, ...data });

  const venda = await prisma.$transaction(async (tx) => {
    const atualizada = await tx.venda.update({ where: { id: params.id }, data });
    if (!eraFinal && ficaFinal) await ajustarEstoque(tx, atual.itens, -1); // finalizou: baixa
    if (eraFinal && !ficaFinal) await ajustarEstoque(tx, atual.itens, +1); // desfez: devolve
    return atualizada;
  });

  return NextResponse.json(venda);
}

// Excluir uma venda
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const atual = await prisma.venda.findUnique({ where: { id: params.id } });
  if (!atual) return NextResponse.json({ ok: true });

  await prisma.$transaction(async (tx) => {
    // Só devolve o estoque se a venda já tinha baixado (estava finalizada)
    if (ehFinal(atual)) await ajustarEstoque(tx, atual.itens, +1);
    await tx.venda.delete({ where: { id: params.id } });
  });

  return NextResponse.json({ ok: true });
}