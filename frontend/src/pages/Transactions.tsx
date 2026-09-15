import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const token = localStorage.getItem('token');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api.get('/transactions', { headers: { Authorization: `Bearer ${token}` } });
    setTransactions(data);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/transactions', {
      title,
      amount,
      type,
      date: new Date().toISOString(),
      categoryId: 1
    }, { headers: { Authorization: `Bearer ${token}` } });
    setTitle(''); setAmount('');
    load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Transacoes</h1>
      <form onSubmit={add} style={{ marginBottom: 24 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo" required />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor" type="number" required />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </select>
        <button>Adicionar</button>
      </form>
      <table border={1} cellPadding={8}>
        <thead><tr><th>Titulo</th><th>Valor</th><th>Tipo</th></tr></thead>
        <tbody>
          {transactions.map((t: any) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>R$ {Number(t.amount).toFixed(2)}</td>
              <td>{t.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
