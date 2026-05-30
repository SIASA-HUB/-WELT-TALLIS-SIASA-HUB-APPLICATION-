FROM node:22-alpine
WORKDIR /usr/src/app

COPY global/package*.json ./global/
COPY socketio-service/package*.json ./socketio-service/

RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    cd global && npm install

RUN cd socketio-service && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install

COPY global ./global
COPY socketio-service ./socketio-service

WORKDIR /usr/src/app/socketio-service
EXPOSE 8010
CMD ["node", "server.js"]