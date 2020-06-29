const {Router} = require('express');
const Learner = require('../persistence/learners');

const router = new Router();

router.get('/', async (request, response) => {
  const learners = await Learner.getAll();
  return response.status(200).json(learners);
});

module.exports = router;
