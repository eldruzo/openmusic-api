const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const result = await this._pool.query({
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    });

    if (!result.rows[0].id) throw new InvariantError('Failed to create collaboration');

    return result.rows[0].id;
  }

  async deleteCollaborations(playlistId, userId) {
    const result = await this._pool.query({
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    });

    if (!result.rows[0].id) throw new NotFoundError('Failed to remove playlist, id was not found');
  }

  async verifyCollaborator(playlistId, userId) {
    const result = await this._pool.query({
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    });

    if (!result.rows.length) throw new InvariantError('Collaborations verification failed');
  }
}

module.exports = CollaborationsService;
