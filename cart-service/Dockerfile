# Base
FROM node:12.20.0-alpine3.12 AS base
WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install && npm cache clean --force

# Build
WORKDIR /app
COPY . .
RUN npm run build

# Release
FROM node:12.20.0-alpine3.12 AS release
COPY --from=base /app/package*.json ./
RUN npm install --only=production && npm cache clean --force
COPY --from=base /app/dist ./dist

USER node
ENV PORT=3030
EXPOSE 3030

CMD [ "node", "./dist/main.js" ]