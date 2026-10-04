'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';

export default function QRPage() {
  const [qr, setQr] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    // 🔧 Troque por seu domínio real quando publicar no Vercel:
    // const u = 'https://lojinha-do-lima.vercel.app';
    const u = window.location.origin;
    setUrl(u);
    QRCode.toDataURL(u, {
      width: 480,
      margin: 2,
      color: { dark: '#065f46', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(setQr);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">QR Code da Loja</h1>

      <div className="max-w-2xl mx-auto">
        {/* Cartaz para impressão */}
        <div className="bg-white rounded-3xl shadow-card p-8 sm:p-12 text-center space-y-6 border border-ink-100">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Lojinha do Lima"
              width={400}
              height={160}
              className="object-contain h-32 w-auto"
              priority
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-ink-900">
              Escaneie e compre agora!
            </h2>
            <p className="text-ink-600 text-base max-w-md mx-auto">
              Tá na correria do dia a dia? 🚗💨
              <br />
              Aproveite o tempo de estampagem para conhecer nossa lojinha!
            </p>
          </div>

          {qr && (
            <div className="inline-block rounded-2xl border-4 border-brand-100 bg-white p-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="QR Code da loja"
                width={280}
                height={280}
                className="block"
              />
            </div>
          )}

          <p className="text-xs text-ink-400 break-all">{url}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href={qr}
              download="qrcode-lojinha-do-lima.png"
              className="btn-primary"
            >
              ⬇️ Baixar QR Code
            </a>
            <button onClick={() => window.print()} className="btn-secondary">
              🖨️ Imprimir Cartaz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}