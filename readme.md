# Ambiente TCC – NestJS + MySQL + Vue/Vuetify + React/MUI

Monorepo dockerizado para experimentos de TCC com uma API NestJS conectada a MySQL e dois frontends alternativos: Vue 3 + Vuetify e React + MUI. Use perfis do Docker Compose para escolher qual frontend levantar.

## Pré-requisitos
- Docker
- Docker Compose v2

## Como subir com o frontend Vue
```bash
docker compose --profile vue up --build
```

Depois de subir, acesse:
- API: http://localhost:3000/health
- Frontend Vue: http://localhost:8081

## Como subir com o frontend React
```bash
docker compose --profile react up --build
```

Depois de subir, acesse:
- API: http://localhost:3000/health
- Frontend React: http://localhost:8082

## Desenvolvimento local (fora do Docker)
- **Backend:** na pasta `backend/`, instale dependências (`npm install`) e rode `npm run start:dev`. Configure variáveis em um `.env` baseado no `.env.example`.
- **Frontend Vue:** na pasta `frontend-vue/`, instale dependências e rode `npm run dev`. Defina `VITE_API_URL` (padrão `http://localhost:3000`).
- **Frontend React:** na pasta `frontend-react/`, instale dependências e rode `npm run dev`. Defina `VITE_API_URL` (padrão `http://localhost:3000`).

## Estrutura
- `backend/`: API NestJS com TypeORM e MySQL, rotas `/health` e `/version`.
- `frontend-vue/`: Vue 3 + Vuetify com botão para testar a API.
- `frontend-react/`: React + MUI com botão para testar a API.
- `docker-compose.yml`: orquestração com serviços `db`, `api`, `web-vue` (profile `vue`) e `web-react` (profile `react`).
