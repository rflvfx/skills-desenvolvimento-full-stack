# Finance Pro

Sistema completo de gestao financeira pessoal.

## Tecnologias

- TypeScript (frontend + backend)
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT com refresh token
- Redis
- React + Vite + Recharts
- Docker + Docker Compose
- GitHub Actions
- Swagger/OpenAPI

## Funcionalidades

- Cadastro e login de usuarios
- Criacao de categorias
- Lancamento de receitas e despesas
- Dashboard com graficos
- Relatorios por categoria
- Filtros por mes e tipo
- API documentada em `/api/docs`

## Como rodar

```bash
docker compose up -d postgres redis
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

cd ../frontend
npm install
npm run dev
```

Acesse:
- Backend: http://localhost:4000/api
- Docs: http://localhost:4000/api/docs
- Frontend: http://localhost:5173
