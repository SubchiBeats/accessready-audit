FROM mcr.microsoft.com/playwright:v1.61.0-noble AS base

WORKDIR /app
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile --config.dangerously-allow-all-builds=true

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start:web"]
