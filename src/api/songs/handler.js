const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const {
        title = 'untitle', year, performer, getSongsHandler, duration,
      } = request.payload;

      const SongId = await this._service.addSong({
        title, year, performer, getSongsHandler, duration,
      });

      const response = h.response({
        status: 'success',
        message: 'Song data successfully added',
        data: {
          SongId,
        },
      });

      response.code(201);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);

        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error. The server was unable to complete your request',
      });

      response.code(500);

      console.error(error);

      return response;
    }
  }

  async getSongsHandler() {
    const Songs = await this._service.getSongs();

    return {
      status: 'success',
      data: {
        Songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;

      const Song = await this._service.getSongById(id);

      const response = h.response({
        status: 'success',
        data: {
          Song,
        },
      });

      response.code(200);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);

        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error. The server was unable to complete your request',
      });

      response.code(500);

      console.error(error);

      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const { id } = request.params;

      await this._service.updateSongById(id, request.payload);

      return {
        status: 'success',
        message: 'Song data successfully updated',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);

        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error. The server was unable to complete your request',
      });

      response.code(500);

      console.error(error);

      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._service.deleteSongById(id, request.payload);

      return {
        status: 'success',
        message: 'Song data successfully removed',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);

        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error. The server was unable to complete your request',
      });

      response.code(500);

      console.error(error);

      return response;
    }
  }
}

module.exports = SongsHandler;
