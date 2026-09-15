import { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const token = localStorage.getItem('token');
  const [userId, setUserId] = useState(0);
  const messages = useSocket(userId);

  useEffect(() => {
    if (!token) return;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    setUserId(decoded.userId);
    api.get('/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data));
  }, [token]);

  if (!data) return <div>Carregando...</div>;

  const chartData = [
    { name: 'Receitas', valor: data.income },
    { name: 'Despesas', valor: data.expense },
    { name: 'Saldo', valor: data.balance },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#e6ffed', padding: 16, borderRadius: 8 }}>
          <h3>Receitas</h3>
          <p>R$ {data.income.toFixed(2)}</p>
        </div>
        <div style={{ background: '#ffe6e6', padding: 16, borderRadius: 8 }}>
          <h3>Despesas</h3>
          <p>R$ {data.expense.toFixed(2)}</p>
        </div>
        <div style={{ background: '#e6f0ff', padding: 16, borderRadius: 8 }}>
          <h3>Saldo</h3>
          <p>R$ {data.balance.toFixed(2)}</p>
        </div>
      </div>
      {messages.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {messages.map((m, i) => <div key={i} style={{ padding: 8, background: '#fff3cd' }}>{m}</div>)}
        </div>
      )}
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
