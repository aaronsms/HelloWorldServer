const express = require('express');

const {Router} = express;
const router = new Router();

const user = require('./user');
const learner = require('./learner');
const mentor = require('./mentor');
const session = require('./session');
const message = require('./message');

// For registration and modifying user information
router.use('/api/users', user);
// For fetching learners' profile
router.use('/api/learners', learner);
// For fetching mentors' profile
router.use('/api/mentors', mentor);
// For tracking sessions
router.use('/api/sessions', session);

// For messaging websockets and retrieving conversations
router.use('/api/messages', message);


module.exports = router;
