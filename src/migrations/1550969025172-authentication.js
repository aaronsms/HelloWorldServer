const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    name text,
    email text UNIQUE,
    password text
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS learners (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id),
  )

  CREATE TABLE IF NOT EXISTS mentors (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id),
  )
  `);

  await client.query(`
  CREATE INDEX users_email on users (email);

  CREATE INDEX sessions_user on sessions (user_id);

  CREATE INDEX learners_user on learners (user_id);

  CREATE INDEX mentors_user on mentors (user_id);
  `);

  await client.release(true);
  next();
};

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE sessions;
  DROP TABLE users;
  DROP TABLE learners;
  DROP TABLE mentors;
  `);

  await client.release(true);
  next();
};
