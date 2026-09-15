import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.access);
      navigate('/dashboard');
    } catch {
      alert('Login invalido');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h1>Finance Pro</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', marginBottom: 8 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%' }}>Entrar</button>
      </form>
    </div>
  );
}
