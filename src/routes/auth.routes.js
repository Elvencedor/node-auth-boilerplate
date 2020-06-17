const { verifyUser } = require('../middleware')
const controller = require('../controllers/auth.controller')
const auth = require('../middleware/auth')
const { validateEmailPassword } = require('../middleware/auth');
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Origin',
      'x-access-token, Origin, Content-Type, Accept'
    )

    return next()
  })

  app
    .post('/api/register', controller.signup)
    .post('/api/users/auth', validateEmailPassword, controller.login)
    .get('/api/users/me', auth.fetchSelf)
    .get('/api/users/:id', auth.fetchUserById)
    .get('/api/users', auth.fetchAllUsers)
    .get('/api/users/sendMail', controller.mailHandler)
    .post('/api/users/resetPassword', controller.resetPassword)
}