const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentication',
    handler: handler.postAuthenticationHandler,
  },
  {
    method: 'PUT',
    path: '/authentication',
    handler: handler.putAuthenticationHandler,
  },
  {
    method: 'DELETE',
    path: '/authentication',
    handler: handler.deleteAuthenticationHandler,
  },
];

module.exports = routes;
