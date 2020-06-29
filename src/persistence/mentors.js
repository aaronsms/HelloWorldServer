const sql = require('sql-template-strings');
const db = require('./db');

module.exports = {
  async getAll() {
    try {
      const {rows: mentors} = await db.query(sql`
            SELECT * FROM mentors;
            `);

      return mentors;
    } catch (error) {
      throw error;
    }
  }
};
