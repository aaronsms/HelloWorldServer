const sql = require('sql-template-strings');
const bcrypt = require('bcrypt');
const db = require('./db');

module.exports = {
  async create(id, name, email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const {rows} = await db.query(sql`
      INSERT INTO users (id, name, email, password)
        VALUES (${id}, ${name}, ${email}, ${hashedPassword})
        RETURNING id, name, email;
      `);

      const [user] = rows;
      return user;
    } catch (error) {
      if (error.constraint === 'users_email_key') {
        return null;
      }

      throw error;
    }
  },
  async find(email) {
    const {rows} = await db.query(sql`
    SELECT * FROM users WHERE email=${email} LIMIT 1;
    `);
    return rows[0];
  },
  async getProfile(userId) {
    const {rows: learner} = await db.query(sql`
    SELECT * FROM learners
    WHERE user_id=${userId};
    `);

    const {rows: mentor} = await db.query(sql`
    SELECT * FROM mentors
    WHERE user_id=${userId};
    `);
  
    if (learner.length !== 0) {
      return learner[0];
    }

    if (mentor.length !== 0) {
      return mentor[0];
    }

    return {};
  }
};
