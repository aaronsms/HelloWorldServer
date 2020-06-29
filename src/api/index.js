const express = require('express');

const {Router} = express;
const router = new Router();

const user = require('./user');
const learner = require('./learner');
const mentor = require('./mentor');
const session = require('./session');

router.use('/api/users', user);
router.use('/api/learners', learner);
router.use('/api/mentors', mentor);
router.use('/api/sessions', session);

module.exports = router;
