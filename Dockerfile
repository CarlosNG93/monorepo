FROM node:18.20.4-alpine AS dev

WORKDIR /app

ENV NODE_ENV=development
ENV PORT=3000

COPY package.json yarn.lock ./
COPY packages/api/package.json packages/api/
COPY packages/services/package.json packages/services/
COPY packages/utilities/package.json packages/utilities/
COPY scripts/start.sh /app/scripts/
COPY scripts/init-db.sh /app/scripts/

RUN chmod +x /app/scripts/start.sh /app/scripts/init-db.sh

RUN yarn install --frozen-lockfile --non-interactive

COPY packages/api/ packages/api/
COPY packages/services/ packages/services/
COPY packages/utilities/ packages/utilities/

EXPOSE 3000

CMD ["yarn", "workspace", "api", "run", "dev"]
