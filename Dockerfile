# Stage 0
# Install all dependencies and build app.
FROM node:lts-alpine AS builder
WORKDIR /home/crawler/websight
COPY . .
RUN yarn install && yarn build

# Stage 1
# Copy built app from stage 0, install only runtime dependencies, and run app.
# Also run the app as non-root user as a best practice.
FROM node:lts-alpine
RUN addgroup -S crawlers && adduser -S crawler -G crawlers
USER crawler
RUN mkdir /home/crawler/websight
WORKDIR /home/crawler/websight

COPY --chown=crawler:crawlers ./package.json ./yarn.lock ./
RUN yarn install --production && \
    yarn cache clean --force
COPY --from=builder --chown=crawler:crawlers /home/crawler/websight/lib ./lib

ENV LOG_LEVEL=info
ENTRYPOINT ["yarn", "start"]
CMD ["http://example.com"]
