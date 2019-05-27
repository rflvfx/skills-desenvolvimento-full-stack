# Auth Flow

```
login -> POST /auth/login -> { accessToken (15m), refreshToken (7d, httpOnly cookie) }
API calls send Authorization: Bearer <accessToken>
401 -> POST /auth/refresh -> new accessToken -> retry once
```

- never store tokens in localStorage (XSS); httpOnly cookies for refresh
- hash passwords with bcrypt cost >= 10
