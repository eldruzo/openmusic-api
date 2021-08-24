const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validator) {
    this._service = service.ProducerService;
    this._playlistsService = service.playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    this._validator.validateExportPlaylistSongsPayload(request.payload);

    const { id: credintialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credintialId);

    const message = {
      userId: credintialId,
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    this._service.sendMessage('export:playlistsongs', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Your request is in line',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
