const proxy = require('express-http-proxy');

// mock request
const req = { originalUrl: '/api/v1/rallies', url: '/rallies', method: 'GET', headers: {} };
const res = {};
const next = () => {};

const proxyMiddleware = proxy('http://rally-service:8001', {
  proxyReqPathResolver: (req) => {
    console.log('Resolving path, returning:', req.originalUrl);
    return req.originalUrl;
  }
});

// Since proxyMiddleware needs a real Express app to actually run the http request, let's just trace how it works or use proxy API
