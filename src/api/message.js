const {Router} = require('express');
const Message = require('../persistence/messages');
const {
  wsSessionMiddleware,
  sessionMiddleware
} = require('../middleware/session-middleware');

const router = new Router();
let connects = new Map();

router.ws('/', wsSessionMiddleware, (ws, request) => {
  console.log(connects);
  if (connects.has(request.userId)) {
    connects.get(request.userId).push(ws);
  } else {
    connects.set(request.userId, [ws]);
  }

  console.log(request.userId);

  ws.on('message', async (message) => {
    console.log('Received -', message);

    try {
      const data = JSON.parse(message);
      const {type} = data;
      if (type == 'send') {
        const {id, senderId, receiverId, content, sendDate} = data;
        if (senderId !== request.userId) {
          // bad request
          ws.send(JSON.stringify({message: 'Unauthorized'}));
        } else {
          // create message on database
          const messageId = await Message.create(
            id,
            senderId,
            receiverId,
            content,
            sendDate
          );

          // send to recipient if connected (else update when open)
          if (connects.has(receiverId)) {
            connects.get(receiverId).forEach((socket) => {
              socket.send(
                JSON.stringify({
                  message: 'Received message',
                  messageId: messageId
                })
              );
            });
            // Message.read(messageId) TODO
          }

          // send success
          connects.get(request.userId).forEach((socket) => {
            socket.send(
              JSON.stringify({message: 'Sent message', messageId: messageId})
            );
          });
        }
      }
    } catch (e) {
      console.log(message + ' is not JSON');
    }

    // send message to userId - SAMPLE ONLY
    connects.get(request.userId).forEach((socket) => {
      socket.send(message);
    });
  });

  ws.on('close', () => {
    connects.set(
      request.userId,
      connects.get(request.userId).filter((conn) => !(conn === ws))
    );
  });
});

// GET /api/messages (NO READ; recent conversations)
router.get('/', sessionMiddleware, async (request, response) => {
  const messages = await Message.getAll(request.userId);
  return response.status(200).json(messages);
});

// GET /api/messages/:otherUserId (APPLY READ; open conversation)
router.get('/user/:otherUserId', sessionMiddleware, async (request, response) => {
  const {otherUserId} = request.params;
  const messages = await Message.getAllWith(request.userId, otherUserId);
  return response.status(200).json(messages);
});

// GET /api/messages/:messageId (APPLY READ; spontaneous reads)
router.get('/message/:messageId', sessionMiddleware, async (request, response) => {
  const {messageId} = request.params;
  const messages = await Message.getOnly(request.userId, messageId);
  return response.status(200).json(messages);
});

// POST /api/messages - PRODUCTION
router.post('/', sessionMiddleware, async (request, response) => {
  const {id, senderId, receiverId, content, sendDate} = request.body;
  if (senderId !== request.userId) {
    return response.status(401).json();
  }

  const messageId = await Message.create(
    id,
    senderId,
    receiverId,
    content,
    sendDate
  );

  return response.status(201).json(messageId);
});

module.exports = router;
