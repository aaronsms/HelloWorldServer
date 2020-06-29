const sql = require('sql-template-strings');
const db = require('./db');

module.exports = {
  async getAll() {
    try {
      const {rows: learners} = await db.query(sql`
            SELECT * FROM learners;
            `);

      return learners;
    } catch (error) {
      throw error;
    }
  }
};
