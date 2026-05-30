FROM node:22-alpine
WORKDIR /usr/src/app

# Copy global and service package files
COPY global/package*.json ./global/
COPY endorsement-service/package*.json ./endorsement-service/

# Install dependencies for both global and service
RUN npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm config set fetch-retries 10 && cd global && npm install
RUN cd endorsement-service && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install

# Copy source code
COPY global ./global
COPY endorsement-service ./endorsement-service

# Set working directory to the service
WORKDIR /usr/src/app/endorsement-service

EXPOSE 8003
CMD ["node", "server.js"]
