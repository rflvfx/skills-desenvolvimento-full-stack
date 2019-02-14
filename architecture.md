# Full Stack Architecture Notes

```
[Browser] -> [Frontend SPA] -> [REST API] -> [Service Layer] -> [DB]
```

- Frontend: React SPA, state via hooks/context
- Backend: Node/Express or PHP, thin controllers
- Auth: JWT + refresh tokens
- DB: MySQL/Postgres, migrations versioned
- Deploy: Docker Compose (dev) -> CI/CD pipeline
