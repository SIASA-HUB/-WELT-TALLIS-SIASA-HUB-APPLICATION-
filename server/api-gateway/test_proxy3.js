const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api/v1/users', createProxyMiddleware({
  target: 'http://127.0.0.1:9090',
  changeOrigin: true,
  pathRewrite: (path, req) => {
    console.log("REWRITE CALLED, req.originalUrl =", req.originalUrl);
    return req.originalUrl;
  }
}));

app.listen(8090, () => console.log('Proxy on 8090'));

const target = express();
target.use((req, res) => {
  console.log('Target received url:', req.url);
  console.log('Target received originalUrl:', req.originalUrl);
  res.json({ success: true, received: req.url });
});
target.listen(9090, () => console.log('Target on 9090'));
