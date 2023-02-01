FROM node:19-bullseye-slim as builder

ENV FLY="true"
ENV FLY_LITEFS_DIR="/litefs"

ENV CACHE_DB_FILENAME="cache.sqlite"
ENV CACHE_DB_PATH="${FLY_LITEFS_DIR}/${CACHE_DB_FILENAME}"

ENV PORT="8080"
ENV NODE_ENV="production"

# Install necessary OS dependencies
RUN apt-get update && apt-get install -y fuse openssl sqlite3 ca-certificates procps python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

COPY --from=flyio/litefs:0.3 /usr/local/bin/litefs /usr/local/bin/litefs

COPY config/litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${DB_DIR}

CMD ["litefs", "mount", "--", "node", "build"]