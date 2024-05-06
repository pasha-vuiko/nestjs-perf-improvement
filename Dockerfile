FROM node:20.12.2-alpine

RUN apk add --update --no-cache \
    openssl \
    dumb-init

ARG VERSION

RUN mkdir -p /opt/app/
COPY package.json package-lock.json nest-cli.json .env.example tsconfig.json tsconfig.build.json /opt/app/
COPY prisma /opt/app/prisma/
WORKDIR /opt/app/

RUN npm ci
COPY src /opt/app/src/
RUN npm run prisma:generate
RUN npm run build

RUN rm -rf tsconfig.json tsconfig.build.json src
RUN npm prune --production

ENV APP_PORT=3000 \
    APP_VERSION=${VERSION:-unknown} \
    NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps" \
    LOG_FORMAT="json"

EXPOSE 3000

ENTRYPOINT ["dumb-init", "node", "/opt/app/dist/main.js"]