const sql = require('sql-template-strings');
const {v4: uuidv4} = require('uuid');
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
  },
  async getAllExcept(userId) {
    try {
      const {rows: mentors} = await db.query(sql`
            SELECT * FROM mentors WHERE NOT id=${userId};
            `);

      return mentors;
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
    teachingLanguages, // Nullable
    profilePicture // Nullable
  } = {}) {
    try {
      const {rows} = await db.query(sql`
        INSERT INTO mentors (id, user_id, name, biography, profile_picture,
          locations, learning_languages, speaking_languages, teaching_languages)
          VALUES (${id}, ${userId}, ${name}, ${biography}, ${profilePicture},
            ${locations}, ${learningLanguages}, ${speakingLanguages}, ${teachingLanguages})
          RETURNING id, user_id;
        `);

      const [mentor] = rows;
      return mentor;
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
    teachingLanguages,
    profilePicture // Nullable
  } = {}) {
    try {
      const {rows} = await db.query(sql`
        UPDATE mentors
          SET name=${name}, biography=${biography}, profile_picture=${profilePicture}, 
          locations=${locations}, learning_languages=${learningLanguages}, 
          speaking_languages=${speakingLanguages}), teaching_languages=${teachingLanguages}
        WHERE user_id=${userId}
        `);

      return rows;
    } catch (error) {
      throw error;
    }
  }
};
