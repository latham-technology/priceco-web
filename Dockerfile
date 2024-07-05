ARG SENTRY_AUTH_TOKEN
ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

# Stage 1 - Build
FROM node:18-alpine AS builder
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}
ENV SENTRY_DSN ${SENTRY_DSN}
ENV SENTRY_ORG ${SENTRY_ORG}
ENV SENTRY_PROJECT ${SENTRY_PROJECT}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# Stage 2 - Production
FROM node:18-alpine AS final
WORKDIR /app
ADD package.json .
ADD nuxt.config.ts .
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/static ./static

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["npm", "start"]