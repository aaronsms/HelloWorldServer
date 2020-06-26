const {Router} = require('express');
const User = require('../persistence/users');

const router = new Router();

router.post('/', async (request, response) => {
  try {
    const {user, mentor, learner} = request.body;
    const {id, name, email, password} = user;
    if (!id || !name || !email || !password) {
      return response
        .status(400)
        .json({message: 'name, email and password must be provided'});
    }

    const newUser = await User.create(id, name, email, password);
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

module.exports = router;
