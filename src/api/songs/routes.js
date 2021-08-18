const routes = (handler) => [
  {
    method: 'POST',
    path: '/Songs',
    handler: handler.postSongHandler,
  },
  {
    method: 'GET',
    path: '/Songs',
    handler: handler.getSongsHandler,
  },
  {
    method: 'GET',
    path: '/Songs/{id}',
    handler: handler.getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/Songs/{id}',
    handler: handler.putSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/Songs/{id}',
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = routes;
