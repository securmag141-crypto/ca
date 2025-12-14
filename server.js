const { PeerServer } = require('peer');

const server = PeerServer({
  port: process.env.PORT || 9000,
  path: '/myapp'
});

console.log('PeerServer запущен');