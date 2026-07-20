# Finansync Frontend

Interface web em React para o sistema financeiro Finansync.

## Visão geral

- React 18 com Vite
- JavaScript
- Integração com a API do backend via `VITE_API_URL`
- Modo demonstração quando a API não está disponível
- Layout responsivo para login, dashboard, contas, categorias e lançamentos

## Galeria

As imagens abaixo mostram algumas telas da interface do Finansync.

<table>
  <tr>
    <td align="center">
      <img src="docs/images/login.png" alt="Tela de login do Finansync" width="100%" />
      <br />
      <strong>Login</strong>
    </td>
    <td align="center">
      <img src="docs/images/register.png" alt="Tela de cadastro do Finansync" width="100%" />
      <br />
      <strong>Cadastro</strong>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/images/dashboard.png" alt="Tela do painel do Finansync" width="100%" />
      <br />
      <strong>Painel</strong>
    </td>
    <td align="center">
      <img src="docs/images/accounts.png" alt="Tela de contas do Finansync" width="100%" />
      <br />
      <strong>Contas</strong>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/images/categories.png" alt="Tela de categorias do Finansync" width="100%" />
      <br />
      <strong>Categorias</strong>
    </td>
    <td align="center">
      <img src="docs/images/launches.png" alt="Tela de lançamentos do Finansync" width="100%" />
      <br />
      <strong>Lançamentos</strong>
    </td>
  </tr>
</table>

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

## Ambientes

### Local, sem Docker

- `npm run dev` para desenvolvimento
- `npm run build` para gerar o pacote de produção
- `npm run preview` para revisar o build

### Desenvolvimento com Docker

- `docker compose up --build` para subir frontend e backend
- `docker compose logs -f` para acompanhar a aplicação
- `docker compose down` para encerrar a stack

### Produção

- O estágio `prod` do Dockerfile gera os arquivos estáticos com Vite
- O Nginx não privilegiado serve o build na porta `8080` do container

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

## Troubleshooting

- Se a interface não carregar, confirme se o frontend está em `http://localhost:3000`
- Se a API não responder, verifique se o backend está em `http://localhost:3333/api/v1/health`
- Se mudar a porta do backend, atualize `VITE_API_URL` no `.env` e recrie a stack
- Se o cache do navegador atrapalhar, faça um reload forçado após recriar os containers

## Scripts

- `npm run dev`: inicia o frontend em modo desenvolvimento
- `npm run build`: gera a versão de produção
- `npm run preview`: visualiza o build localmente
