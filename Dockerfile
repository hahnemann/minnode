# syntax=docker/dockerfile:1

# Regenerates data/processed/airport_pair_fares.csv from the committed raw sources
# (see scripts/prepare_data.py -- the same script notebooks/prepare_data.ipynb calls)
# so the image is reproducible from a fresh clone with no manual pre-step, and never
# drifts from the code even if the raw award/airport data files are updated.
FROM python:3.10.18-slim AS data-prep
WORKDIR /app
RUN pip install --no-cache-dir pandas==2.3.3
COPY data/awards_2026.csv data/iata-icao.csv data/
COPY scripts/prepare_data.py scripts/
RUN python scripts/prepare_data.py

FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=data-prep /app/data/processed/airport_pair_fares.csv data/processed/airport_pair_fares.csv
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Makes no external network requests at runtime -- the fare graph, airport
# coordinates, and CONUS map outline are all inlined into the server bundle
# at build time, so this image runs the same behind an air-gapped network.
USER node
CMD ["node", "build/index.js"]
