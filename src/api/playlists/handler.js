const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    const { id: credintialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name, owner: credintialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist successfully added',
      data: {
        playlistId,
      },
    });

    response.code(201);

    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credintialId } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(credintialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: credintialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credintialId);
    await this._service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist successfully deleted',
    };
  }

  async postSongtoPlaylistHandler(request, h) {
    await this._validator.validateSongToPlaylistPayload(request.payload);

    const { id: credintialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { playlistId } = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credintialId);
    await this._service.verifySongId(songId);

    await this._service.addSongtoPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Song successfully added to playlist',
    });

    response.code(201);

    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: credintialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credintialId);

    const songs = await this._service.getPlaylistSongs(playlistId);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    await this._validator.validateSongToPlaylistPayload(request.payload);

    const { id: credintialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(playlistId, credintialId);
    await this._service.verifySongId(songId);

    await this._service.deletePlaylistSong(playlistId, songId);

    return {
      status: 'success',
      message: 'Song successfully removed from playlist',
    };
  }
}

module.exports = PlaylistsHandler;
