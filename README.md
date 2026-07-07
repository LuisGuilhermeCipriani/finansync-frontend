# Finansync Frontend

Interface web em React para consumir a API do Finansync.

## Stack

- React
- Vite
- JavaScript puro

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores.

- `VITE_API_URL`: URL base da API financeira
- `FRONTEND_PORT`: porta do servidor de desenvolvimento do Vite

## Estrutura

- `src/components`: componentes reutilizáveis
- `src/services`: integração com API e dados de apoio
- `src/styles`: estilos globais e da aplicação

## Observação

O frontend pode rodar em modo demonstracao quando a API não estiver disponível, ou autenticar com a API para acessar os dados do usuário.
