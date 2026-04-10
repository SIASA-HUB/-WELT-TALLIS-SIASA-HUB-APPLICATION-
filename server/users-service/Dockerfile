FROM node:22-alpine
WORKDIR /usr/src/app

# Copy global and service package files
COPY global/package*.json ./global/
COPY users-service/package*.json ./users-service/

# Install dependencies for both global and service
RUN cd global && npm install
RUN cd users-service && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install

# Copy source code
COPY global ./global
COPY users-service ./users-service

# Set working directory to the service
WORKDIR /usr/src/app/users-service

EXPOSE 8002
CMD ["node", "server.js"]
