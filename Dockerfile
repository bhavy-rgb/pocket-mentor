# Pocket Mentor — one container that serves the API and the built client.
# Build:  docker build -t pocket-mentor .
# Run:    docker run -p 4000:4000 -e PM_SECRET=... pocket-mentor

FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# Render, Railway and Fly all inject PORT; the server falls back to 4000.
ENV PORT=4000
EXPOSE 4000

# server/data is created on first boot. Mount a volume here to keep the data
# across restarts, otherwise the demo dataset is reseeded every deploy.
VOLUME ["/app/server/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/index.js"]
