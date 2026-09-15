import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { auth, AuthRequest } from './auth';
import { getCache, setCache, delCache, delCachePattern } from './cache';
import { emitTransaction } from './socket';
const router = Router();

function parseMonth(month: string) {
  const [year, m] = month.split('-').map(Number);
  return {
    gte: new Date(Date.UTC(year, m - 1, 1, 0, 0, 0, 0)),
    lte: new Date(Date.UTC(year, m, 0, 23, 59, 59, 999))
  };
}

function generateTokens(user: any) {
  const access = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  const refresh = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh', { expiresIn: '7d' });
  return { access, refresh };
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Cria uma conta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       201: { description: Usuario criado }
 */
router.post('/auth/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, password: hash, name } });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    res.status(400).json({ error: 'Email ja existe' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais invalidas' });
  }
  const tokens = generateTokens(user);
  res.json({ ...tokens, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.post('/categories', auth, async (req: AuthRequest, res: Response) => {
  const { name, color } = req.body;
  const category = await prisma.category.create({
    data: { name, color: color || '#000000', userId: req.user.userId }
  });
  res.status(201).json(category);
});

router.get('/categories', auth, async (req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({ where: { userId: req.user.userId } });
  res.json(categories);
});

router.post('/transactions', [
  auth,
  body('title').notEmpty(),
  body('amount').isNumeric(),
  body('type').isIn(['INCOME', 'EXPENSE'])
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, amount, type, date, description, categoryId } = req.body;
  const transaction = await prisma.transaction.create({
    data: {
      title,
      amount: parseFloat(amount),
      type,
      date: new Date(date),
      description,
      userId: req.user.userId,
      categoryId: parseInt(categoryId)
    },
    include: { category: { select: { name: true, color: true } } }
  });
  await delCachePattern(`transactions:${req.user.userId}:*`);
  await delCachePattern(`dashboard:${req.user.userId}:*`);
  emitTransaction(req.user.userId, transaction);
  res.status(201).json(transaction);
});

router.get('/transactions', auth, async (req: AuthRequest, res: Response) => {
  const { month, type } = req.query;
  const cacheKey = `transactions:${req.user.userId}:${month || 'all'}:${type || 'all'}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const where: any = { userId: req.user.userId };
  if (type) where.type = type;
  if (month) {
    where.date = parseMonth(month as string);
  }
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: { select: { name: true, color: true } } }
  });
  await setCache(cacheKey, transactions, 60);
  res.json(transactions);
});

router.get('/dashboard', auth, async (req: AuthRequest, res: Response) => {
  const { month } = req.query;
  const cacheKey = `dashboard:${req.user.userId}:${month || 'current'}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const dateFilter = month ? parseMonth(month as string) : parseMonth(new Date().toISOString().slice(0, 7));
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user.userId,
      date: dateFilter
    }
  });
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;
  const result = { income, expense, balance, transactions };
  await setCache(cacheKey, result, 120);
  res.json(result);
});

router.get('/reports/by-category', auth, async (req: AuthRequest, res: Response) => {
  const { month } = req.query;
  const dateFilter = month ? parseMonth(month as string) : parseMonth(new Date().toISOString().slice(0, 7));
  const result = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId: req.user.userId,
      type: 'EXPENSE',
      date: dateFilter
    },
    _sum: { amount: true }
  });
  res.json(result);
});

export default router;
