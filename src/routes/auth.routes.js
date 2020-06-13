const { verifyUser } = require('../middleware')
const controller = require('../controllers/auth.controller')
const auth = require('../middleware/auth')

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Origin',
      'x-access-token, Origin, Content-Type, Accept'
    )

    next()
  })

  app.post(
    '/api/register',
    [
      verifyUser.duplicityCheck,
      verifyUser.roleValidityCheck
    ],
    controller.signup
  )

  app.post('/api/users/auth', controller.signin)

  app.get('/api/users/getUser', auth.fetchSelf)

  app.get('/api/users/getUser/:id', auth.fetchUserById)

  app.get('/api/users/getAllUsers', auth.fetchAllUsers)

  app.get('/api/users/sendMail', controller.mailHandler)

  app.post('/api/users/resetPassword/:token/:id', controller.resetPassword)
}