# Ambiente TCC – NestJS + MySQL + Vue/Vuetify + React/MUI

Monorepo dockerizado para experimentos de TCC com uma API NestJS conectada a MySQL e dois frontends alternativos: Vue 3 + Vuetify e React + MUI. Use perfis do Docker Compose para escolher qual frontend levantar.

## Pré-requisitos
- Docker
- Docker Compose v2

## Como subir com o frontend Vue (build de produção)
```bash
docker compose --profile vue up --build
```

Depois de subir, acesse:
- API: http://localhost:3000/health
- Frontend Vue: http://localhost:8081

## Como subir com o frontend React (build de produção)
```bash
docker compose --profile react up --build
```

Depois de subir, acesse:
- API: http://localhost:3000/health
- Frontend React: http://localhost:8082

## Hot reload com Docker Compose (dev)
Use o arquivo `docker-compose.dev.yml` junto com o Compose principal para rodar tudo com watch/HMR.

### Vue + API em modo dev
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev --profile dev-vue up
```
URLs:
- API (Nest watch): http://localhost:3000/health
- Frontend Vue (Vite + HMR): http://localhost:8081

### React + API em modo dev
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev --profile dev-react up
```
URLs:
- API (Nest watch): http://localhost:3000/health
- Frontend React (Vite + HMR): http://localhost:8082

> Dica: o Compose principal deixa a API de produção disponível pelos perfis `vue` ou `react`. Para desenvolvimento assistido, use somente os perfis `dev`/`dev-vue` ou `dev`/`dev-react` para evitar subir a versão de produção em paralelo.

## Desenvolvimento local (fora do Docker)
- **Backend:** na pasta `backend/`, instale dependências (`npm install`) e rode `npm run start:dev`. Configure variáveis em um `.env` baseado no `.env.example`.
- **Frontend Vue:** na pasta `frontend-vue/`, instale dependências e rode `npm run dev -- --host --port 8081`. Defina `VITE_API_URL` (padrão `http://localhost:3000`; em produção via Docker o build usa `http://tcc_api:3000`).
- **Frontend React:** na pasta `frontend-react/`, instale dependências e rode `npm run dev -- --host --port 8082`. Defina `VITE_API_URL` (padrão `http://localhost:3000`; em produção via Docker o build usa `http://tcc_api:3000`).

## Estrutura
- `backend/`: API NestJS com TypeORM e MySQL, rotas `/health` e `/version`.
- `frontend-vue/`: Vue 3 + Vuetify com botão para testar a API.
- `frontend-react/`: React + MUI com botão para testar a API.
- `docker-compose.yml`: orquestração com serviços `db`, `api` (profiles `vue` e `react`), `web-vue` (profile `vue`) e `web-react` (profile `react`).
- `docker-compose.dev.yml`: serviços de desenvolvimento com hot reload (`api-dev`, `web-vue-dev`, `web-react-dev`).
