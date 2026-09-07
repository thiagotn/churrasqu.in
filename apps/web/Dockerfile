# Build a partir da RAIZ do monorepo:
#   docker build -f apps/web/Dockerfile -t churrasquin-web .
# NEXT_PUBLIC_API_URL é resolvido em build; '/api' funciona atrás do Ingress único.

FROM node:22-alpine AS build
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/calculator/package.json packages/calculator/
COPY apps/web/package.json apps/web/
RUN npm ci --no-audit --no-fund
COPY packages/calculator packages/calculator
COPY apps/web apps/web
RUN npm run build --workspace=packages/calculator && npm run build --workspace=apps/web

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static apps/web/.next/static
COPY --from=build /repo/apps/web/public apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
