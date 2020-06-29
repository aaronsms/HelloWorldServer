const {Router} = require('express');
const Mentor = require('../persistence/mentors');

const router = new Router();

router.get('/', async (request, response) => {
  const mentors = await Mentor.getAll();
  return response.status(200).json(mentors);
});

module.exports = router;
