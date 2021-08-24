/* eslint-disable consistent-return */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

const { mapDBSongsToModel } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();

    this._cacheService = cacheService;
  }

  async addSong(payload) {
    const id = `song-${nanoid(16)}`;
    const insertedUpdatedAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, ...Object.values(payload), insertedUpdatedAt, insertedUpdatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Failed to add song data');

    await this._cacheService.delete('songs-data');

    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const result = await this._cacheService.get('songs-data');
      return JSON.parse(result);
    } catch {
      const result = await this._pool.query('SELECT id, title, performer FROM songs');

      await this._cacheService.set('songs-data', JSON.stringify(result.rows));

      return result.rows;
    }
  }

  async getSongById(id, checkData = false) {
    try {
      const result = await this._cacheService.get(`song:${id}`);
      return JSON.parse(result);
    } catch {
      const query = {
        text: 'SELECT * FROM songs where id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) throw new NotFoundError('Song data not found');

      await this._cacheService.set(`song:${result.rows[0].id}`, JSON.stringify(result.rows.map(mapDBSongsToModel)[0]));

      if (!checkData) return result.rows.map(mapDBSongsToModel)[0];
    }
  }

  async updateSongById(id, payload) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs set title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 where id = $7 RETURNING id',
      values: [...Object.values(payload), updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Failed to update song data, ID was not found');

    await this._cacheService.delete('songs-data');
    await this._cacheService.delete(`song:${id}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Failed to delete, ID was not found');

    await this._cacheService.delete('songs-data');
    await this._cacheService.delete(`song:${id}`);
  }
}

module.exports = SongsService;
