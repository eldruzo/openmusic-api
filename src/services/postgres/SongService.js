const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

const { mapDBSongsToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Failed to add song data');

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT * FROM songs');

    return result.rows.map(mapDBSongsToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs where id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Song data not found');

    return result.rows.map(mapDBSongsToModel)[0];
  }

  async updateSongById(id, {
    title, year, performer, genre, duration,
  }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs set title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 where id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Failed to update song data, ID was not found');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Failed to delete, ID was not found');
  }
}

module.exports = SongsService;