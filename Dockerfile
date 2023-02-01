FROM node:19-bullseye-slim as builder

# Install necessary OS dependencies
RUN apt-get update && apt-get install -y fuse openssl sqlite3 ca-certificates procps python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN pnpm build

FROM node:19-bullseye-slim
USER node:node

ENV DB_DIR="/db"

ENV CACHE_DB_FILENAME="cache.sqlite"
ENV CACHE_DB_PATH="${DB_DIR}/${CACHE_DB_FILENAME}"

ENV PORT="8080"
ENV NODE_ENV="production"

# Access SQLite CLI 
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$CACHE_DB_PATH" > /usr/local/bin/cache-db-cli && chmod +x /usr/local/bin/cache-db-cli

WORKDIR /app/

COPY --from=builder --chown=node:node /app/node_modules /app/node_modules
COPY --from=builder --chown=node:node /app/build /app/build
COPY --chown=node:node package.json pnpm-lock.yaml ./
CMD ["node", "build"]