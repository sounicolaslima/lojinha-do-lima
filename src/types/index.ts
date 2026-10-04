export type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  disponivel: boolean;
  criadoEm: string;
};

export type Venda = {
  id: string;
  clienteNome: string;
  itens: { nome: string; preco: number; quantidade: number }[];
  total: number;
  pixConferido: boolean;
  mercadoriaRetirada: boolean;
  criadoEm: string;
};