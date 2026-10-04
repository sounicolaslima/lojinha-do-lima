import Image from 'next/image';

type LogoProps = {
  size?: number;          // altura da logo em px
  showTagline?: boolean;  // mostrar a frase abaixo
  variant?: 'default' | 'compact' | 'light';
};

export default function Logo({
  size = 56,
  showTagline = true,
  variant = 'default',
}: LogoProps) {
  // Proporção da imagem: ajusta a largura automaticamente
  // Se sua logo for horizontal (como a que você mandou), a proporção é ~2.5:1
  const width = size * 2.6;
  const height = size;

  if (variant === 'compact') {
    return (
      <div
        className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.03]"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Lojinha do Lima"
          fill
          sizes="80px"
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      {/* Logo */}
      <div
        className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.03]"
        style={{ height, width: 'auto', aspectRatio: '2.6 / 1' }}
      >
        <Image
          src="/logo.png"
          alt="Lojinha do Lima"
          width={Math.round(width)}
          height={height}
          className="object-contain h-full w-auto"
          priority
        />
      </div>

      {showTagline && (
        <div className="hidden sm:block leading-tight border-l border-ink-200 pl-3">
          <div
            className="font-bold text-ink-800 tracking-tight"
            style={{ fontSize: size * 0.22 }}
          >
            Tá na correria?
          </div>
          <div
            className="text-brand-600 font-semibold"
            style={{ fontSize: size * 0.20 }}
          >
            Aproveite! 🚗💨
          </div>
        </div>
      )}
    </div>
  );
}