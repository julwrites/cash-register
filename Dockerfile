# Use an official Node runtime as the base image
FROM node:22-bookworm-slim

# Install build dependencies and SQLite
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy config files to ensure postinstall scripts (nuxt prepare) run correctly
COPY nuxt.config.ts app.config.ts ./

# Install node-gyp for native module builds
RUN npm install -g node-gyp

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R node:node /app/data

# Rebuild better-sqlite3
RUN npm rebuild better-sqlite3 --build-from-source

# Run nuxt prepare again to ensure all assets and components are detected
RUN npx nuxt prepare

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set the command to run the app
CMD ["node", ".output/server/index.mjs"]
