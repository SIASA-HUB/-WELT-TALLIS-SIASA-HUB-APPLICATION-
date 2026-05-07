FROM node:22-alpine
WORKDIR /usr/src/app

# Copy global and service package files
COPY global/package*.json ./global/
COPY socketio-service/package*.json ./socketio-service/

# Install dependencies
RUN cd global && npm install
RUN cd socketio-service && npm install

# Copy source code
COPY global ./global
COPY socketio-service ./socketio-service

# Set working directory to the service
WORKDIR /usr/src/app/socketio-service

EXPOSE 8010
CMD ["node", "server.js"]
