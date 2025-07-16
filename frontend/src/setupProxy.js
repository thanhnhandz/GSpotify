const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to backend
      },
      onError: function (err, req, res) {
        console.log('Proxy Error:', err);
      },
      logLevel: 'debug',
    })
  );
  
  // Fallback for any other requests that should go to backend
  app.use(
    ['/auth', '/songs', '/users', '/playlists', '/artists', '/admin', '/genres', '/search'],
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      onError: function (err, req, res) {
        console.log('Proxy Error:', err);
      },
    })
  );
}; 