FROM node:22-alpine
WORKDIR /usr/src/app

# Copy global and service package files
COPY global/package*.json ./global/
COPY api-gateway/package*.json ./api-gateway/

# Install dependencies for both global and service
RUN cd global && npm install
RUN cd api-gateway && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install

# Copy source code
COPY global ./global
COPY api-gateway ./api-gateway

# Set working directory to the service
WORKDIR /usr/src/app/api-gateway

EXPOSE 8009
CMD ["node", "server.js"]