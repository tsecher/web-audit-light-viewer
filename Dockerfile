# --- dev : sources montées en volume, rechargement à chaud ---
FROM node:22-slim AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- build : compilation de l'app ---
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run build

# --- prod : image finale, uniquement le serveur compilé ---
FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
