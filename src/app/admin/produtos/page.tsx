'use client';
import { useEffect, useState } from 'react';
import type { Produto } from '@/types';

const emptyForm = {
  id: '',
  nome: '',
  descricao: '',
  preco: '',
  estoque: '',
  imagemUrl: '',
  disponivel: true,
};

export default function ProdutosAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch('/api/produtos?admin=1').then((r) => r.json()).then(setProdutos);
  };
  useEffect(() => {
  load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handleUpload = async (file: File) => {
  setUploading(true);
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });

    // Lê o texto primeiro para conseguir mostrar erro se o JSON falhar
    const text = await res.text();

    if (!res.ok) {
      let msg = 'Erro ao enviar imagem';
      try {
        const err = JSON.parse(text);
        msg = err.error || msg;
      } catch {
        // resposta não era JSON
      }
      alert(`❌ ${msg}`);
      return;
    }

    const data = JSON.parse(text);
    if (data.url) {
      setForm((f) => ({ ...f, imagemUrl: data.url }));
    } else {
      alert('❌ A API não retornou a URL da imagem');
    }
  } catch (err: any) {
    alert(`❌ Falha no upload: ${err?.message || 'erro desconhecido'}`);
  } finally {
    setUploading(false);
  }
};

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: Number(form.preco),
      estoque: Number(form.estoque),
      imagemUrl: form.imagemUrl || null,
      disponivel: form.disponivel,
    };
    if (editing) {
      await fetch(`/api/produtos/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setForm(emptyForm);
    setEditing(false);
    setShowForm(false);
    load();
  };

  const editar = (p: Produto) => {
    setForm({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco: String(p.preco),
      estoque: String(p.estoque),
      imagemUrl: p.imagemUrl || '',
      disponivel: p.disponivel,
    });
    setEditing(true);
    setShowForm(true);
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir este produto? Esta ação não pode ser desfeita.')) return;
    await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleDisponivel = async (p: Produto) => {
    await fetch(`/api/produtos/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponivel: !p.disponivel }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Produtos</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setEditing(false);
            setShowForm(true);
          }}
        >
          + Novo Produto
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="font-bold">{editing ? 'Editar produto' : 'Cadastrar produto'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                className="input"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estoque *</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.estoque}
                onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagem</label>
              <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              {uploading && <p className="text-xs text-slate-500 mt-1">Enviando...</p>}
              {form.imagemUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imagemUrl} alt="" className="mt-2 w-24 h-24 rounded-lg object-cover" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <textarea
              className="input min-h-[90px]"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.disponivel}
              onChange={(e) => setForm({ ...form, disponivel: e.target.checked })}
            />
            Disponível na vitrine
          </label>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={uploading}>
              {editing ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setEditing(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left">Produto</th>
                <th className="p-3 text-left">Preço</th>
                <th className="p-3 text-left">Estoque</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                        {p.imagemUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imagemUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{p.nome}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                          {p.descricao}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-brand-700">
                    R$ {p.preco.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-semibold ${
                        p.estoque > 0 ? 'text-slate-700' : 'text-red-600'
                      }`}
                    >
                      {p.estoque}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleDisponivel(p)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.disponivel
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.disponivel ? 'Disponível' : 'Oculto'}
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => editar(p)}
                      className="text-brand-700 hover:underline text-xs font-semibold mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(p.id)}
                      className="text-red-600 hover:underline text-xs font-semibold"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}