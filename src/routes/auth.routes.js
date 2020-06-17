const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller')
const auth = require('../middleware/auth')
const { validateEmailPassword } = require('../middleware/auth');

router
  .post('/api/register', controller.signup)
  .post('/api/users/auth', validateEmailPassword, controller.login)
  .get('/api/users/me', auth.fetchSelf)
  .get('/api/users/:id', auth.fetchUserById)
  .get('/api/users', auth.fetchAllUsers)
  .get('/api/users/sendMail', controller.mailHandler)
  .post('/api/users/resetPassword', controller.resetPassword);

module.exports = router;
