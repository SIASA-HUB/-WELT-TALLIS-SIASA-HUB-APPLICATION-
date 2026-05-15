const http = require('http');
const server = http.createServer((req, res) => {
  res.end('OK');
});
const PORT = 9999;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server listening on port ${PORT}`);
});

setTimeout(() => {
  console.log('Keeping process alive for 10 seconds...');
}, 10000);
