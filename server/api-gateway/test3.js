const express = require('express');
const proxy = require('express-http-proxy');

const app = express();
app.all('/api/v1/:service*', (req, res, next) => {
  return proxy('http://localhost:8008', {
    proxyReqPathResolver: (r) => {
      console.log('originalUrl inside resolver:', r.originalUrl);
      return r.originalUrl;
    }
  })(req, res, next);
});
app.listen(8010, () => console.log('Proxy on 8010'));

const target = express();
target.use((req, res) => {
  console.log('Target got url:', req.url);
  console.log('Target got originalUrl:', req.originalUrl);
  res.json({ targetUrl: req.url });
});
target.listen(9010, () => console.log('Target on 9010'));
