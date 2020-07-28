const {Router} = require('express');
const Mentor = require('../persistence/mentors');

const router = new Router();

// Get all mentors' profile
router.get('/', async (request, response) => {
  const mentors = await Mentor.getAll();
  return response.status(200).json(mentors);
});

router.get('/:userId', async (request, response) => {
  const {userId} = request.params;
  const mentors = await Mentor.getAllExcept(userId);
  return response.status(200).json(mentors);
});

module.exports = router;
