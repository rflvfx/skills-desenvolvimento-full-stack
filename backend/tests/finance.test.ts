import request from 'supertest';
import app from '../src/app';

describe('Finance Pro API', () => {
  let token: string;
  let userId: number;
  let categoryId: number;

  beforeEach(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ email: 'teste@email.com', password: '123456', name: 'Teste' });
    userId = register.body.id;

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teste@email.com', password: '123456' });
    token = login.body.access;

    const category = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Moradia', color: '#0000ff' });
    categoryId = category.body.id;
  });

  it('deve autenticar com credenciais corretas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teste@email.com', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.access).toBeDefined();
  });

  it('deve rejeitar acesso sem token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  it('deve criar uma transacao de despesa', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Aluguel',
        amount: 1200,
        type: 'EXPENSE',
        date: '2026-09-15',
        categoryId
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Aluguel');
    expect(res.body.type).toBe('EXPENSE');
  });

  it('deve criar uma receita e calcular saldo corretamente', async () => {
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Salario', amount: 5000, type: 'INCOME', date: '2026-09-15', categoryId });
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mercado', amount: 500, type: 'EXPENSE', date: '2026-09-15', categoryId });

    const res = await request(app)
      .get('/api/dashboard?month=2026-09')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.income).toBe(5000);
    expect(res.body.expense).toBe(500);
    expect(res.body.balance).toBe(4500);
  });

  it('deve listar transacoes filtradas por tipo', async () => {
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Salario', amount: 5000, type: 'INCOME', date: '2026-09-15', categoryId });
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Luz', amount: 100, type: 'EXPENSE', date: '2026-09-15', categoryId });

    const res = await request(app)
      .get('/api/transactions?type=INCOME')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].type).toBe('INCOME');
  });
});
