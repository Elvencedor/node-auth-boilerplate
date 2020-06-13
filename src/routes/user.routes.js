const { authJwt } = require('../middleware')
const controller = require('../controllers/user.controller')

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Header',
      'x-access-token, Origin, Content-Type, Accept'
    )

    next()
  })

  app.get(
    '/',
    controller.allAccess
  )

  app.get(
    '/api/test/user',
    [authJwt.verifyToken],
    controller.userBoard
  )

  app.get(
    '/api/test/admin',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  )
}