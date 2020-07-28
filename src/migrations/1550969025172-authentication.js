const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    name varchar(100),
    email varchar(254) UNIQUE,
    password varchar(100)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS learners (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id) ON DELETE CASCADE,
    name varchar(100),
    biography varchar(255),
    locations json[],
    learning_languages json,
    speaking_languages json,
    profile_picture text
  );

  CREATE TABLE IF NOT EXISTS mentors (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id) ON DELETE CASCADE,
    name varchar(100),
    biography varchar(255),
    locations json[],
    learning_languages json,
    speaking_languages json,
    teaching_languages json,
    profile_picture text
  );
  
  CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY key,
    sender_id uuid REFERENCES users(id),
    send_date timestamp DEFAULT clock_timestamp(),
    notify_date timestamp DEFAULT null,
    content text
  );

  CREATE TABLE IF NOT EXISTS users_messages (
    id uuid PRIMARY KEY,
    receiver_id uuid references users(id),
    message_id uuid references messages(id),
    is_read boolean
  );

  CREATE TABLE IF NOT EXISTS recent_messages (
    id uuid PRIMARY KEY,
    message_id uuid references messages(id),
    first_id uuid references users(id) ON DELETE CASCADE,
    second_id uuid references users(id) ON DELETE CASCADE,
    UNIQUE(first_id, second_id)
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id uuid PRIMARY KEY,
    user_id uuid references users(id),
    start_date timestamp,
    end_date timestamp
  );

  CREATE TABLE IF NOT EXISTS requests (
    id uuid PRIMARY KEY,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date timestamp,
    meeting_length interval HOUR TO MINUTE
  );

  CREATE TABLE IF NOT EXISTS users_requests (
    id uuid PRIMARY KEY,
    receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
    requests_id uuid REFERENCES requests(id) ON DELETE CASCADE,
    state varchar(50) DEFAULT null
  );
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
  DROP TABLE IF EXISTS sessions;
  DROP TABLE IF EXISTS learners;
  DROP TABLE IF EXISTS mentors;
  DROP TABLE IF EXISTS schedules;
  DROP TABLE IF EXISTS users_requests;
  DROP TABLE IF EXISTS recent_messages;
  DROP TABLE IF EXISTS users_messages;
  DROP TABLE IF EXISTS requests;
  DROP TABLE IF EXISTS messages;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS languages;
  `);

  await client.release(true);
  next();
};
