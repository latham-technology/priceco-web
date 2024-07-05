ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT

# Stage 1 - Build
FROM node:18-alpine AS builder
RUN --mount=type=secret,id=sentry_auth_token \
    sh -c 'SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token)'
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN echo "SENTRY_DSN $SENTRY_DSN"
RUN echo "SENTRY_ORG $SENTRY_ORG"
RUN echo "SENTRY_PROJECT $SENTRY_PROJECT"
RUN npm run build


# Stage 2 - Production
FROM node:18-alpine AS final
RUN echo "SENTRY_DSN $SENTRY_DSN"
RUN echo "SENTRY_ORG $SENTRY_ORG"
RUN echo "SENTRY_PROJECT $SENTRY_PROJECT"
WORKDIR /app
ADD package.json .
ADD nuxt.config.ts .
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["npm", "start"]