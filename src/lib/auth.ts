import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        console.log('\n🔍 [AUTH] Nova tentativa de login');
        console.log('   📧 E-mail recebido:', credentials?.email);
        console.log('   🔑 Senha recebida:', credentials?.password ? '***' : 'VAZIA');

        if (!credentials?.email || !credentials?.password) {
          console.log('   ❌ Faltou e-mail ou senha');
          return null;
        }

        // ─── Caminho 1: admin do banco de dados ─────────────────
        console.log('   🔎 Buscando admin no banco de dados...');
        let admin = null;
        try {
          admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });
          console.log(
            '   📦 Admin encontrado no banco?',
            admin ? `SIM (${admin.email}, ativo=${admin.ativo})` : 'NÃO'
          );
        } catch (err: any) {
          console.log('   ⚠️  Erro ao consultar banco:', err?.message || err);
          console.log('   → Caindo para o fallback do .env');
        }

        if (admin && admin.ativo) {
          console.log('   🔐 Comparando senha com hash do banco...');
          const ok = await bcrypt.compare(credentials.password, admin.senhaHash);
          console.log('   ✅ Senha bate com banco?', ok);
          if (ok) {
            console.log('   🎉 LOGIN OK via BANCO\n');
            return {
              id: admin.id,
              email: admin.email,
              name: admin.nome,
            };
          }
        }

        // ─── Caminho 2: admin "master" do .env ─────────────────
        console.log('   🔎 Tentando admin do .env...');
        const envEmail = process.env.ADMIN_EMAIL;
        const envHash = process.env.ADMIN_PASSWORD_HASH;

        console.log('   📧 ADMIN_EMAIL (.env):', envEmail || 'NÃO DEFINIDO');
        console.log(
          '   🔑 ADMIN_PASSWORD_HASH (.env):',
          envHash ? envHash.substring(0, 15) + '...' : 'NÃO DEFINIDO'
        );

        if (!envEmail || !envHash) {
          console.log('   ❌ Variáveis do .env não carregadas');
          return null;
        }

        if (credentials.email !== envEmail) {
          console.log('   ❌ E-mail digitado não bate com o .env');
          console.log('      Digitado:', credentials.email);
          console.log('      Esperado:', envEmail);
          return null;
        }

        console.log('   ✓ E-mail bate com .env, comparando senha...');
        const ok = await bcrypt.compare(credentials.password, envHash);
        console.log('   ✅ Senha bate com .env?', ok);

        if (!ok) {
          console.log('   ❌ Senha incorreta');
          return null;
        }

        console.log('   🎉 LOGIN OK via .ENV\n');
        return {
          id: 'env-admin',
          email: envEmail,
          name: 'Administrador Master',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin';
        token.id = (user as any).id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        session.user.name = (token.name as string) || session.user.name;
      }
      return session;
    },
  },
};