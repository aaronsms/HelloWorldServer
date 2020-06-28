const {Router} = require('express');
const User = require('../persistence/users');

const router = new Router();

router.post('/', async (request, response) => {
  try {
    const {user, learner, mentor} = request.body;
    const {id, name, email, password} = user;
    const {id: learnerOrMentorId, userId} = learner || mentor;

    if (!id || !name || !email || !password) {
      return response
        .status(400)
        .json({message: 'name, email and password must be provided'});
    }

    if (!learnerOrMentorId || !userId || id !== userId) {
      return response
        .status(400)
        .json({message: 'learner/mentor creation error'});
    }

    if (learner) learner.isLearnerOrMentor = true;
    if (mentor) mentor.isLearnerOrMentor = false;

    const newUser = await User.create(id, name, email, password);
    const newLearnerOrMentor = await User.createLearnerOrMentor(
      learner || mentor
    );
    if (!newUser || !newLearnerOrMentor) {
      return response.status(400).json({message: 'User already exists'});
    }

    return response.status(200).json(newUser);
  } catch (error) {
    console.error(
      `createUser({ email: ${request.body.email} }) >> Error: ${error.stack}`
    );
    response.status(500).json();
  }
});

module.exports = router;
