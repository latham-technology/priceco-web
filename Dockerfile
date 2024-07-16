FROM node:18-alpine

ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
ARG NUXT_MAILGUN_API_KEY
ARG NUXT_TURNSTILE_SECRET_KEY
ARG SENTRY_RELEASE_NAME

ENV SENTRY_DSN=${SENTRY_DSN}
ENV SENTRY_ORG=${SENTRY_ORG}
ENV SENTRY_PROJECT=${SENTRY_PROJECT}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV SENTRY_RELEASE_NAME=${SENTRY_RELEASE_NAME}
ENV NUXT_MAILGUN_API_KEY=${NUXT_MAILGUN_API_KEY}
ENV NUXT_TURNSTILE_SECRET_KEY=${NUXT_TURNSTILE_SECRET_KEY}

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run prisma:generate
RUN npm run build

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["npm", "start"]