const {Router} = require('express');
const Learner = require('../persistence/learners');

const router = new Router();

// Get all learners' profile
router.get('/', async (request, response) => {
  const learners = await Learner.getAll();
  return response.status(200).json(learners);
});

router.get('/:userId', async (request, response) => {
  const {userId} = request.params;
  const learners = await Learner.getAllExcept(userId);
  return response.status(200).json(learners);
});

module.exports = router;
