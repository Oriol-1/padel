FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" APP_URL="http://localhost:3000" ADMIN_EMAIL="build@example.com" ADMIN_PASSWORD="build" SESSION_SECRET="build-only-secret-with-at-least-32-characters" CLUB_NAME="Club de Pádel" pnpm build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && pnpm start"]
