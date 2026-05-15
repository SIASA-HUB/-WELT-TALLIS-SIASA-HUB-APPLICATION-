FROM node:22-alpine
WORKDIR /usr/src/app

# Copy global and service package files
COPY global/package*.json ./global/
COPY mpesa-service/package*.json ./mpesa-service/

# Install dependencies
RUN cd global && npm install
RUN cd mpesa-service && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install

# Copy source code
COPY global ./global
COPY mpesa-service ./mpesa-service

# Set working directory to the service
WORKDIR /usr/src/app/mpesa-service

EXPOSE 8011
CMD ["node", "server.js"]
