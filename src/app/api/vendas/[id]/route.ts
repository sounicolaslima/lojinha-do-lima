import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Item = { produtoId?: string; quantidade?: number };

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const venda = await prisma.$transaction(async (tx) => {
    const atual = await tx.venda.findUnique({ where: { id: params.id } });
    if (!atual) return null;

    const pixConferido =
      body.pixConferido !== undefined ? Boolean(body.pixConferido) : atual.pixConferido;
    const mercadoriaRetirada =
      body.mercadoriaRetirada !== undefined
        ? Boolean(body.mercadoriaRetirada)
        : atual.mercadoriaRetirada;

    // Venda finalizada = Pix conferido + Mercadoria retirada
    const finalizada = pixConferido && mercadoriaRetirada;
    const itens = (Array.isArray(atual.itens) ? atual.itens : []) as Item[];
    let estoqueBaixado = atual.estoqueBaixado;

    if (finalizada && !estoqueBaixado) {
      // Acabou de finalizar: tira do estoque
      for (const item of itens) {
        if (!item.produtoId) continue;
        await tx.produto.updateMany({
          where: { id: item.produtoId },
          data: { estoque: { decrement: Number(item.quantidade) || 0 } },
        });
      }
      estoqueBaixado = true;
    } else if (!finalizada && estoqueBaixado) {
      // Desmarcou algo (ou venda antiga ainda não finalizada): devolve ao estoque
      for (const item of itens) {
        if (!item.produtoId) continue;
        await tx.produto.updateMany({
          where: { id: item.produtoId },
          data: { estoque: { increment: Number(item.quantidade) || 0 } },
        });
      }
      estoqueBaixado = false;
    }

    return tx.venda.update({
      where: { id: params.id },
      data: { pixConferido, mercadoriaRetirada, estoqueBaixado },
    });
  });

  if (!venda) return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
  return NextResponse.json(venda);
}

// 🆕 DELETE — excluir uma venda
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.venda.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
