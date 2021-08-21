const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(service, validator) {
    this._service = service.collaborationsService;
    this._playlistService = service.playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;

    const { id: credintialId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistOwner(playlistId, credintialId);

    const collaborationId = await this._service.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration successfully added',
      data: {
        collaborationId,
      },
    });

    response.code(201);

    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;

    const { id: credintialId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistOwner(playlistId, credintialId);

    await this._service.deleteCollaborations(playlistId, userId);

    return {
      status: 'success',
      message: 'Collaboration successfully removed',
    };
  }
}

module.exports = CollaborationsHandler;
