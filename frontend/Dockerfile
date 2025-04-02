# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY frontend/ ./

# Install dependencies
RUN npm install

# Install esbuild
RUN npm install esbuild@0.25.2


# Expose port
EXPOSE 5173

# Run the dev script - log what's available first
CMD ["sh", "-c", "npm run && npm run dev"]