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

# Copy package.json
COPY package.json ./

# Yarn is already available in node image
# Install node-gyp for native module builds
RUN npm install -g node-gyp

# Copy the rest of the application code
COPY . .
RUN rm -rf *.lock

# Create data directory for SQLite
RUN mkdir -p /app/data
RUN chown -R node:node /app/data

# Install dependencies with rebuild flag to ensure native modules are compiled correctly
RUN yarn install
# Use npm rebuild for better-sqlite3 as yarn doesn't have an equivalent command
RUN npm rebuild better-sqlite3 --build-from-source

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Set the command to run the app
CMD ["node", ".output/server/index.mjs"]
