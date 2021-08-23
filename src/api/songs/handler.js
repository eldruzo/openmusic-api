const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler({ payload }, h) {
    this._validator.validateSongPayload(payload);

    const songId = await this._service.addSong(payload);

    const response = h.response({
      status: 'success',
      message: 'Song data successfully added',
      data: {
        songId,
      },
    });

    response.code(201);

    return response;
  }

  async getSongsHandler() {
    const songs = await this._service.getSongs();

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });

    response.code(200);

    return response;
  }

  async putSongByIdHandler({ params, payload }) {
    this._validator.validateSongPayload(payload);

    const { id } = params;

    await this._service.updateSongById(id, payload);

    return {
      status: 'success',
      message: 'Song data successfully updated',
    };
  }

  async deleteSongByIdHandler({ params }) {
    const { id } = params;

    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song data successfully removed',
    };
  }
}

module.exports = SongsHandler;
