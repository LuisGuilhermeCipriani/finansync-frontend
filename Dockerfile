FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN chown -R node:node /app

COPY --chown=node:node package*.json ./

FROM base AS dev

USER node
RUN npm ci
COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM base AS build

USER node
RUN npm ci
COPY --chown=node:node . .

ARG VITE_API_URL=http://localhost:3333/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS prod

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
