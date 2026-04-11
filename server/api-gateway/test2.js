const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
app.use('/api/v1/:service*', (req, res, next) => {
  return proxy('http://localhost:8008', {
    proxyReqPathResolver: (req) => {
      console.log('Resolver called! Returning:', req.originalUrl);
      return req.originalUrl;
    }
  })(req, res, next);
});
app.listen(8009, () => console.log('proxy on 8009'));

const target = express();
target.use((req, res) => {
  console.log('Target received:', req.url);
  res.send('ok');
});
target.listen(9000, () => console.log('target on 9000'));
