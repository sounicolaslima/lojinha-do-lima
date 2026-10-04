'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { useCart } from '@/lib/cart';
import Logo from '@/components/Logo';

// ══════════════════════════════════════════════════════════════
// Gerador do payload Pix (padrão EMV BR Code)
// ══════════════════════════════════════════════════════════════

function emv(id: string, value: string) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function normalizar(texto: string, limite: number) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 .-]/g, '')
    .slice(0, limite)
    .trim();
}

type PixParams = {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number;   // se undefined, QR fica sem valor (cliente digita)
  txid?: string;    // máximo 25 caracteres
};

function gerarPixPayload({ chave, nome, cidade, valor, txid }: PixParams): string {
  // Merchant Account Info (ID 26)
  const gui = emv('00', 'br.gov.bcb.pix');
  const chaveEmv = emv('01', chave);
  const merchantAccount = emv('26', gui + chaveEmv);

  // Campos obrigatórios
  const payloadSemCRC =
    emv('00', '01') +                          // Payload Format Indicator
    merchantAccount +                          // Merchant Account Info
    emv('52', '0000') +                        // Merchant Category Code
    emv('53', '986') +                         // Moeda: BRL
    (valor !== undefined ? emv('54', valor.toFixed(2)) : '') + // Valor (opcional)
    emv('58', 'BR') +                          // País
    emv('59', normalizar(nome, 25)) +          // Nome do recebedor (máx 25)
    emv('60', normalizar(cidade, 15)) +        // Cidade (máx 15)
    emv('62', emv('05', (txid || '***').slice(0, 25))) + // TxID
    '6304';                                    // CRC16 placeholder

  return payloadSemCRC + crc16(payloadSemCRC);
}

// ══════════════════════════════════════════════════════════════
// Configuração do Pix da loja
// ══════════════════════════════════════════════════════════════

const PIX_CONFIG = {
  chave: process.env.NEXT_PUBLIC_PIX_KEY || 'pixlojinha99@gmail.com',
  nome: 'Nicolas Mariano Lima',   // 👈 Seu nome real (do seu payload)
  cidade: 'Sao Paulo',             // 👈 Sua cidade (do seu payload)
};

// ══════════════════════════════════════════════════════════════

export default function PixPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const router = useRouter();

  const [qr, setQr] = useState('');
  const [payload, setPayload] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    // Gera um TxID único por venda (máx 25 caracteres)
    const txid = `REC${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`.slice(0, 25);

    const payloadStr = gerarPixPayload({
      chave: PIX_CONFIG.chave,
      nome: PIX_CONFIG.nome,
      cidade: PIX_CONFIG.cidade,
      valor: total,          // 👈 valor já embutido no QR
      txid,
    });

    setPayload(payloadStr);

    QRCode.toDataURL(payloadStr, {
      width: 400,
      margin: 2,
      color: { dark: '#065f46', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQr);
  }, [total]);

  const copiarPayload = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert('Não foi possível copiar automaticamente. Selecione o texto manualmente.');
    }
  };

  const confirmar = async () => {
    setProcessing(true);
    setErro('');
    const nome = sessionStorage.getItem('lojinha_cliente') || 'Cliente';
    try {
      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNome: nome,
          itens: items.map((i) => ({
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
            produtoId: i.id,
          })),
          total,
        }),
      });
      if (!res.ok) throw new Error('Falha ao registrar venda');
      clear();
      router.push('/sucesso');
    } catch {
      setErro('Não foi possível registrar o pedido. Tente novamente.');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ink-50">
        <div className="card p-8 text-center max-w-md animate-slide-up">
          <div className="text-5xl mb-4">🧾</div>
          <h1 className="text-xl font-bold mb-2">Nenhum pedido em andamento</h1>
          <p className="text-ink-500 mb-6">Volte à loja para escolher seus produtos.</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Ir às compras →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Logo size={56} showTagline={false} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="card p-6 sm:p-8 space-y-6 animate-slide-up">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 bg-brand-50 rounded-full px-3 py-1.5 w-fit mx-auto">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            Pagamento via Pix
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-center text-ink-900">
            Pague com Pix para finalizar
          </h1>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 p-5 text-white text-center">
            <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">
              Total a pagar
            </p>
            <p className="text-4xl font-extrabold mt-1">R$ {total.toFixed(2)}</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {qr ? (
              <div className="rounded-2xl border-2 border-brand-100 bg-white p-4 shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr}
                  alt="QR Code Pix"
                  width={280}
                  height={280}
                  className="block"
                />
              </div>
            ) : (
              <div className="w-[280px] h-[280px] skeleton" />
            )}

            <p className="text-xs text-ink-500 text-center max-w-xs">
              Abra o app do seu banco, escolha <strong>Pix → Ler QR Code</strong> e
              aponte para o código acima. O valor já vem preenchido.
            </p>
          </div>

          <div className="rounded-xl bg-ink-50 border border-ink-100 p-4 space-y-2">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              🔑 Chave Pix
            </p>
            <p className="text-sm font-mono break-all text-ink-800">
              {PIX_CONFIG.chave}
            </p>
            <p className="text-xs text-ink-400">
              Destinatário: <strong>{PIX_CONFIG.nome}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              📋 Pix Copia e Cola
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={payload}
                className="input text-xs font-mono flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copiarPayload}
                className={copiado ? 'btn bg-brand-600 text-white' : 'btn-secondary'}
              >
                {copiado ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-ink-400">
              Esse é o código oficial Pix. Cole no seu app de banco se preferir.
            </p>
          </div>

          {erro && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
              ⚠️ {erro}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-ink-100">
            <button
              onClick={confirmar}
              disabled={processing}
              className="btn-primary flex-1 py-3 text-base"
            >
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                <>✓ Já fiz o Pix</>
              )}
            </button>
            <button
              onClick={() => {
                if (confirm('Cancelar a compra? Seu carrinho será esvaziado.')) {
                  clear();
                  router.push('/');
                }
              }}
              className="btn-danger sm:flex-initial"
            >
              Cancelar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}