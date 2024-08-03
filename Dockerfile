# Use Node.js version 18 as the base image
FROM node:18 AS builder

# Set working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock into the container at /app
COPY package*.json ./

# Install project dependencies inside the container
RUN yarn install --frozen-lockfile

# Copy all other files to the container
COPY . .

# Build the Nuxt application
RUN yarn build

# Production stage
FROM node:18 AS production

# Create app directory in production image
WORKDIR /app

# Copy built Nuxt application from builder stage to production image
COPY --from=builder /app/.nuxt/dist/client /app/.nuxt/dist/client
COPY --from=builder /app/.output/public /app/.output/public

# Create a volume for data storage
VOLUME ["/app/data"]

# Expose port 3000 for Nuxt app
EXPOSE 3000

# Start the application in production mode
CMD ["yarn", "start"]
