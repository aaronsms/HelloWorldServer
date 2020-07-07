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
  async createLearnerOrMentor({
    id,
    userId,
    name,
    biography, // Nullable
    locations, // Nullable
    learningLanguages, // Nullable
    speakingLanguages, // Nullable
    teachingLanguages, // Nullable
    profilePicture, // Nullable
    isLearnerOrMentor
  } = {}) {
    try {
      let rows;
      if (isLearnerOrMentor) {
        ({rows} = await db.query(sql`
        INSERT INTO learners (id, user_id, name, biography, profile_picture,
          locations, learning_languages, speaking_languages)
          VALUES (${id}, ${userId}, ${name}, ${biography}, ${profilePicture},
            ${locations}, ${learningLanguages}, ${speakingLanguages})
          RETURNING id, user_id;
        `));
      } else {
        ({rows} = await db.query(sql`
        INSERT INTO mentors (id, user_id, biography, profile_picture,
          locations, learning_languages, speaking_languages, teaching_languages)
          VALUES (${id}, ${userId}, ${biography}, ${profilePicture},
            ${locations}, ${learningLanguages}, ${speakingLanguages}, ${teachingLanguages})
          RETURNING id, user_id;
        `));
      }

      const [learnerOrMentor] = rows;
      return learnerOrMentor;
    } catch (error) {
      if (error.constraint === 'users_pkey') {
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
  }
};
