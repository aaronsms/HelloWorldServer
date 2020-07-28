const {Router} = require('express');
const User = require('../persistence/users');
const Learner = require('../persistence/learners');
const Mentor = require('../persistence/mentors');

const {sessionMiddleware} = require('../middleware/session-middleware');

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

    const newUser = await User.create(id, name, email, password);
    if (learner) {
      if (!learner.name) learner.name = name;
      await Learner.create(learner);
    }

    if (mentor) {
      if (!mentor.name) mentor.name = name;
      await Mentor.create(mentor);
    }

    if (!newUser) {
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

router.get('/:userId', async (request, response) => {
  try {
    const {userId} = request.params;
    const result = await User.getProfile(userId);

    return response.status(200).json(result);
  } catch (error) {
    console.error(error.stack);
    response.status(500).json();
  }
});

router.put('/', sessionMiddleware, async (request, response) => {
  try {
    const {learner, mentor} = request.body;

    if (learner) {
      if (learner.userId != request.userId) {
        return response.status(401).json();
      }
      await Learner.update(learner);
      return response.status(201).json();
    }

    if (mentor) {
      if (mentor.userId != request.userId) {
        return response.status(401).json();
      }
      await Mentor.update(mentor);
      return response.status(201).json();
    }

    return response.status(400).json();
  } catch (error) {
    console.error(error.stack);
    response.status(500).json();
  }
});

module.exports = router;
