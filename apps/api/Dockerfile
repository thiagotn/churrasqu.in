# Build a partir da RAIZ do monorepo:
#   docker build -f apps/api/Dockerfile -t churrasquin-api .

FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/calculator/package.json packages/calculator/
COPY apps/api/package.json apps/api/
RUN npm ci --no-audit --no-fund
COPY packages/calculator packages/calculator
COPY apps/api apps/api
RUN npm run build --workspace=packages/calculator \
  && npm run prisma:generate --workspace=apps/api \
  && npm run build --workspace=apps/api

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY packages/calculator/package.json packages/calculator/
COPY apps/api/package.json apps/api/
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=build /repo/packages/calculator/dist packages/calculator/dist
COPY --from=build /repo/apps/api/dist apps/api/dist
# Prisma Client gerado (engines musl) + schema/migrations para o migrate deploy.
# Copiado para os dois pontos de resolução possíveis do @prisma/client.
COPY --from=build /repo/apps/api/node_modules/.prisma apps/api/node_modules/.prisma
COPY --from=build /repo/apps/api/node_modules/.prisma node_modules/.prisma
COPY apps/api/prisma apps/api/prisma
USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
