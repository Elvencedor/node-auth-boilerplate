const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller')
const { verifyToken, isAdmin } = require('../middleware').authJwt;

router
  .get('/', controller.allAccess)
  .get('/api/test/user', verifyToken, controller.userBoard)
  .get('/api/test/admin', verifyToken, isAdmin, controller.adminBoard)
  .get('/api/stores/access', verifyToken, isMerchant, controller.merchantStore);

module.exports = router;
