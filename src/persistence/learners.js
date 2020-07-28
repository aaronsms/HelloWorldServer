const sql = require('sql-template-strings');
const {v4: uuidv4} = require('uuid');
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
  },
  async getAllExcept(userId) {
    try {
      const {rows: learners} = await db.query(sql`
            SELECT * FROM learners WHERE NOT id=${userId};
            `);

      return learners;
    } catch (error) {
      throw error;
    }
  },
  async create({
    id,
    userId,
    name,
    biography, // Nullable
    locations, // Nullable
    learningLanguages, // Nullable
    speakingLanguages, // Nullable
    profilePicture // Nullable
  } = {}) {
    try {
      const {rows} = await db.query(sql`
        INSERT INTO learners (id, user_id, name, biography, profile_picture,
          locations, learning_languages, speaking_languages)
          VALUES (${id}, ${userId}, ${name}, ${biography}, ${profilePicture},
            ${locations}, ${learningLanguages}, ${speakingLanguages})
          RETURNING id, user_id;
        `);

      const [learner] = rows;
      return learner;
    } catch (error) {
      if (error.constraint === 'users_pkey') {
        return null;
      }

      throw error;
    }
  },
  async update({
    id,
    userId,
    name,
    biography, // Nullable
    locations, // Nullable
    learningLanguages, // Nullable
    speakingLanguages, // Nullable
    profilePicture // Nullable
  } = {}) {
    try {
      const {rows} = await db.query(sql`
        UPDATE learners
          SET name=${name}, biography=${biography}, profile_picture=${profilePicture}, 
          locations=${locations}, learning_languages=${learningLanguages}, 
          speaking_languages=${speakingLanguages}
        WHERE user_id=${userId}
        `);

      return rows;
    } catch (error) {
      throw error;
    }
  }
};
