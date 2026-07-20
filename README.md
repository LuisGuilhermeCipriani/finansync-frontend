# Finansync Frontend

Interface web em React para o sistema financeiro Finansync.

## Visão geral

- React 18 com Vite
- JavaScript
- Integração com a API do backend via `VITE_API_URL`
- Modo demonstração quando a API não está disponível
- Layout responsivo para login, dashboard, contas, categorias e lançamentos

## Estrutura

- `src/App.jsx`: composição principal
- `src/components`: componentes reutilizáveis
- `src/services`: cliente da API e dados de apoio
- `src/styles`: estilos globais
- `public`: arquivos estáticos
- `docs/images`: capturas da interface

## Requisitos

- Node.js 22 ou superior
- npm
- Backend do Finansync em execução para consumo da API real

## Execução local

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

Pré-visualização do build:

```bash
npm run preview
```

## Docker

O repositório inclui suporte a desenvolvimento com Docker e uma imagem de produção com Nginx.

### Desenvolvimento

```bash
docker compose up --build
```

URLs padrão:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3333`

O container do frontend usa hot reload e publica a API em `VITE_API_URL=http://localhost:3333/api/v1`, porque o acesso final acontece pelo navegador no host.

Comandos úteis na raiz do projeto:

```bash
docker compose logs -f
docker compose down
```

### Encerramento

```bash
docker compose down
```

### Produção

O `Dockerfile` possui um estágio `prod` que gera os arquivos estáticos com Vite e serve tudo com Nginx não privilegiado na porta `8080` do container.

### Observação sobre a API

No navegador, o frontend precisa apontar para a porta publicada do backend no host.
Por isso, `VITE_API_URL` continua usando `http://localhost:3333/api/v1` mesmo quando os containers se comunicam por rede interna.

Se você alterar a porta do backend, atualize `VITE_API_URL` e recrie o ambiente com `docker compose up --build`.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL base da API consumida pelo navegador |
| `FRONTEND_PORT` | Porta do servidor de desenvolvimento do Vite |
| `BACKEND_PORT` | Porta publicada do backend no host |
| `DB_CLIENT` | Cliente do backend: `memory` ou `oracle` |
| `CORS_ORIGIN` | Origem permitida pelo backend |
| `AUTH_TOKEN_TTL` | Tempo de expiração do token JWT |
| `JWT_SECRET` | Segredo do token JWT |
| `ORACLE_USER` | Usuário do Oracle |
| `ORACLE_PASSWORD` | Senha do Oracle |
| `ORACLE_HOST` | Host do Oracle no Docker ou na máquina local |
| `ORACLE_PORT` | Porta do listener do Oracle |
| `ORACLE_SERVICE_NAME` | Service name do banco Oracle |
| `ORACLE_CONNECTION_STRING` | Alternativa opcional para conexão direta |

## Exemplo de `.env`

```env
VITE_API_URL=http://localhost:3333/api/v1
FRONTEND_PORT=3000
BACKEND_PORT=3333
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
DB_CLIENT=memory
CORS_ORIGIN=http://localhost:3000
AUTH_TOKEN_TTL=7d
JWT_SECRET=troque-esta-chave
ORACLE_USER=finansync
ORACLE_PASSWORD=finansync
ORACLE_HOST=host.docker.internal
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XEPDB1
```

## Integração com o backend

O frontend consome a API por `VITE_API_URL` e não altera os contratos existentes.
Quando o backend estiver em Oracle no ambiente Docker, o frontend continua apontando para a mesma URL pública publicada no host.

## Scripts

- `npm run dev`: inicia o frontend em modo desenvolvimento
- `npm run build`: gera a versão de produção
- `npm run preview`: visualiza o build localmente
