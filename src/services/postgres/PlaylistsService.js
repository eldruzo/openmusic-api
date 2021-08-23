const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(songsService, collaborationsService) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const result = await this._pool.query({
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    });

    if (!result.rows[0].id) throw new InvariantError('Failed to create playlist');

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const result = await this._pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists   
      LEFT JOIN users ON users.id = playlists.owner 
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [userId],
    });

    return result.rows;
  }

  async deletePlaylistById(id) {
    const result = await this._pool.query({
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rows[0].id) throw new NotFoundError('Failed to remove playlist, id was not found');
  }

  async verifyPlaylistOwner(id, owner) {
    const result = await this._pool.query({
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) throw new NotFoundError('Failed to find playlist, Id was not found');

    const playlist = result.rows[0];

    if (playlist.owner !== owner) throw new AuthorizationError("You don't have access to this resource");
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addSongtoPlaylist(playlistId, songId) {
    const id = nanoid(16);

    const result = await this._pool.query({
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    });

    if (!result.rows[0].id) throw new InvariantError('Failed to add song to playlist');
  }

  async verifySongId(songId) {
    try {
      await this._songsService.getSongById(songId, true);
    } catch (error) {
      throw new InvariantError(error.messsage);
    }
  }

  async getPlaylistSongs(playlistId) {
    const result = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs 
      LEFT JOIN songs on songs.id = playlistsongs.song_id 
      WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    });

    return result.rows;
  }

  async deletePlaylistSong(playlistId, songId) {
    const result = await this._pool.query({
      text: 'DELETE FROM playlistsongs where playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    });

    if (!result.rows.length) throw new NotFoundError('Failed to remmove song from playlist, playlist/song id was not found');
  }
}

module.exports = PlaylistsService;
