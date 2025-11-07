# Proyecto PG2 — Backend + Frontend + MCP + pgAdmin (local)

**Fecha:** 2025-11-08

## Levantar local

```bash
docker compose up --build -d
```

- Frontend: http://localhost:5173
- Auth: http://localhost:4001/auth
- Events: http://localhost:4002
- Report: http://localhost:4003
- Provisioning: http://localhost:4010/provision
- MCP: http://localhost:4020/rpc
- pgAdmin: http://localhost:5050 (user: fquejq@miumg.edu.gt / pass: fr3dy)

## Producción (Azure)

Usa `docker-compose.prod.yml` (sin pgAdmin). Monta certificados en `infra/nginx` (volumen `certs`).

## Prisma

```bash
docker compose run auth-service npx prisma generate
docker compose run events-service npx prisma generate
docker compose run report-service npx prisma generate
```

## Seed por defecto (auth)

- Email: fquejq@miumg.edu.gt
- Password: fr3dy

## Health checks

```bash
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:4010/health
curl http://localhost:4020/health
```
