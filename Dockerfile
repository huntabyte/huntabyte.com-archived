# Base image with OS dependencies
FROM node:19-bullseye-slim as base

# Install additional OS dependencies
RUN apt-get update && apt-get install -y fuse openssl sqlite3 ca-certificates procps python3 make g++
RUN npm install -g pnpm

FROM base as all-deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

FROM base as production-deps

WORKDIR /app

COPY --from=all-deps /app/node_modules /app/node_modules
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base as builder

WORKDIR /app

COPY --from=all-deps /app/node_modules /app/node_modules

COPY . .

RUN pnpm run build


FROM base as production

ENV PORT="8080"
ENV NODE_ENV="production"
ENV ORIGIN="https://huntabyte.fly.dev"
ENV FLY="true"
ENV FLY_LITEFS_DIR="/litefs"
ENV CACHE_DB_FILENAME="cache.sqlite"
ENV CACHE_DB_PATH="${FLY_LITEFS_DIR}/${CACHE_DB_FILENAME}"

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build

COPY . .

COPY --from=flyio/litefs:0.3 /usr/local/bin/litefs /usr/local/bin/litefs
COPY config/litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${DB_DIR}

CMD ["litefs", "mount", "--", "node", "build"]