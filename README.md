# 🛍️ Lojinha do Lima

Sistema completo de vendas online com checkout via Pix.

> Tá na correria do dia a dia? 🚗💨  
> Aproveite o tempo de estampagem para conhecer nossa lojinha!

## ✨ Funcionalidades

- 🛒 Vitrine com produtos, busca e disponibilidade em estoque
- 🛍️ Carrinho de compras com persistência local
- 💳 Checkout com Pix (padrão EMV/BR Code)
- 🔐 Painel administrativo com autenticação
- 📦 CRUD completo de produtos (foto, descrição, preço, estoque)
- 🧾 Quadro de vendas com filtro por período
- ✅ Marcação de "Pix conferido" e "Mercadoria retirada"
- 📊 Dashboard com métricas de vendas (dia/mês/ano)
- 🔗 QR Code da loja para impressão

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **Prisma** + **SQLite** (dev) / **Postgres** (prod)
- **NextAuth** (autenticação)
- **Tailwind CSS** (estilo)
- **Vercel Blob** (upload de imagens)
- **TypeScript**

## 🛠️ Como rodar localmente

\`\`\`bash
# 1. Clonar
git clone https://github.com/sounicolaslima/lojinha-do-lima.git
cd lojinha-do-lima

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores

# 4. Criar o banco
npx prisma db push

# 5. Rodar
npm run dev
\`\`\`

Acesse:
- 🛒 Loja: http://localhost:3000
- 🔐 Admin: http://localhost:3000/admin/login

## 📄 Licença

Projeto privado da Lojinha do Lima.