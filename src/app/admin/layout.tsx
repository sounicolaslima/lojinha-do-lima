'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Logo from '@/components/Logo';

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/produtos', label: 'Produtos', icon: '📦' },
  { href: '/admin/vendas', label: 'Vendas', icon: '🧾' },
  { href: '/admin/qrcode', label: 'QR Code', icon: '🔗' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { data: session, status } = useSession();

  if (path === '/admin/login') return <>{children}</>;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-ink-400">
          <span className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando painel...</span>
        </div>
      </div>
    );
  }
  if (!session) {
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="bg-white border-b border-ink-100 sticky top-0 z-30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/admin">
            <Logo size={48} showTagline={false} variant="compact" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-ink-400">Logado como</p>
              <p className="text-sm font-semibold text-ink-800">
                {session.user?.name || session.user?.email}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              {(session.user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="btn-secondary text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  active
                    ? 'text-brand-700'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}