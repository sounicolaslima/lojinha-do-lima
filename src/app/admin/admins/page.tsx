'use client';
import { useEffect, useState } from 'react';

type Admin = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  criadoEm: string;
};

const empty = { id: '', nome: '', email: '', senha: '', ativo: true };

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState('');

  const load = () =>
    fetch('/api/admins')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setAdmins(d));

  useEffect(() => {
  load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (editing) {
      const payload: any = { nome: form.nome, email: form.email, ativo: form.ativo };
      if (form.senha) payload.senha = form.senha;
      const res = await fetch(`/api/admins/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setErro(d.error || 'Erro ao editar');
        return;
      }
    } else {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErro(d.error || 'Erro ao criar');
        return;
      }
    }

    setForm(empty);
    setEditing(false);
    setShowForm(false);
    load();
  };

  const editar = (a: Admin) => {
    setForm({ id: a.id, nome: a.nome, email: a.email, senha: '', ativo: a.ativo });
    setEditing(true);
    setShowForm(true);
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir este admin? Ele não poderá mais logar.')) return;
    await fetch(`/api/admins/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Administradores</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setForm(empty);
            setEditing(false);
            setShowForm(true);
          }}
        >
          + Novo Admin
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="font-bold">{editing ? 'Editar admin' : 'Cadastrar admin'}</h2>
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
              <label className="block text-sm font-medium mb-1">E-mail *</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Senha {editing && <span className="text-slate-400">(deixe vazio para manter)</span>}
              </label>
              <input
                type="password"
                className="input"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required={!editing}
                minLength={6}
                placeholder={editing ? '••••••' : 'Mínimo 6 caracteres'}
              />
            </div>
          </div>

          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Admin ativo (pode fazer login)
            </label>
          )}

          {erro && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{erro}</div>}

          <div className="flex gap-2">
            <button className="btn-primary">{editing ? 'Salvar alterações' : 'Cadastrar'}</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setForm(empty);
                setEditing(false);
                setErro('');
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">E-mail</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="p-3 font-medium">{a.nome}</td>
                <td className="p-3 text-slate-600">{a.email}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      a.ativo ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {a.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => editar(a)}
                    className="text-brand-700 hover:underline text-xs font-semibold mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(a.id)}
                    className="text-red-600 hover:underline text-xs font-semibold"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Nenhum admin cadastrado no banco. Você ainda pode logar com o admin do .env.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}