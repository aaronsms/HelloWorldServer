const sql = require('sql-template-strings');
const {v4: uuidv4} = require('uuid');
const db = require('./db');

module.exports = {
  async create(id, senderId, receiverId, content, sendTime) {
    try {
      const {rows: messageRows} = await db.query(sql`
      INSERT INTO messages (id, sender_id, send_date, content)
        VALUES (${id}, ${senderId}, ${sendTime || Date.now()}, ${content})
        RETURNING id;
      `);

      const messageId = messageRows[0].id;
      
      await db.query(sql`
      INSERT INTO users_messages (id, receiver_id, message_id, is_read)
        VALUES (${uuidv4()}, ${receiverId}, ${messageId}, ${false})
        RETURNING id;
      `);
      await db.query(sql`
      INSERT INTO recent_messages (id, message_id, first_id, second_id)
        VALUES (${uuidv4()}, ${messageId}, ${senderId}, ${receiverId})
        ON CONFLICT (first_id, second_id) 
        DO UPDATE SET message_id=${messageId};
      `);
      await db.query(sql`
      INSERT INTO recent_messages (id, message_id, first_id, second_id)
        VALUES (${uuidv4()}, ${messageId}, ${receiverId}, ${senderId})
        ON CONFLICT (first_id, second_id) 
        DO UPDATE SET message_id=${messageId};
      `);
      
      return messageId;
    } catch {
      throw error;
    }
  },
  // get all conversations related to userId
  async getAll(userId) {
    const {rows: conversations} = await db.query(sql`
    SELECT m.id, sender_id, u1.name as sender_name, receiver_id, 
    u2.name as receiver_name, content, is_read, send_date, notify_date 
      FROM messages m 
      LEFT JOIN users_messages um ON um.message_id=m.id
      LEFT JOIN users u1 ON sender_id=u1.id
      LEFT JOIN users u2 ON receiver_id=u2.id
      WHERE m.id 
        IN(SELECT message_id AS other_user_id FROM recent_messages
      WHERE first_id=${userId});
    `);
    return conversations;
  },
  // get all messages with otherId - READ
  async getAllWith(userId, otherId) {
    // apply read first
    await db.query(sql`
    UPDATE users_messages
      SET is_read=${true}
      WHERE receiver_id=${userId};
    `);

    const {rows: messages} = await db.query(sql`
    SELECT m.id, sender_id, u1.name as sender_name, receiver_id, 
    u2.name as receiver_name, content, is_read, send_date, notify_date 
	    FROM messages m 
      LEFT JOIN users_messages um ON um.message_id=m.id
	    LEFT JOIN users u1 ON sender_id=u1.id
	    LEFT JOIN users u2 ON receiver_id=u2.id
      WHERE (m.sender_id=${userId} AND um.receiver_id=${otherId})
      OR (m.sender_id=${otherId} AND um.receiver_id=${userId})
      ORDER BY send_date DESC;
    `);
    return messages;
  },
  // spontaneuous - READ
  async getOnly(userId, messageId) {
    await db.query(sql`
      UPDATE users_messages
      SET is_read=${true}
      WHERE receiver_id=${userId} AND message_id=${userId}
      RETURNING *;
    `);

    const {rows: message} = await db.query(sql`
    SELECT m.id, sender_id, u1.name as sender_name, receiver_id, 
    u2.name as receiver_name, content, is_read, send_date, notify_date 
	    FROM messages m 
      LEFT JOIN users_messages um ON um.message_id=m.id
	    LEFT JOIN users u1 ON sender_id=u1.id
	    LEFT JOIN users u2 ON receiver_id=u2.id
      WHERE m.id=${messageId}
    `);
    return message[0];
  }
};
