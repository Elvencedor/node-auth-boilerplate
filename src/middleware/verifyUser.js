const db = require("../models");

const ROLES = db.ROLES;
const User = db.user;


duplicityCheck = (req, res, next) => {
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err })
      return;
    }
    if (user) {
      res.status(400).send({ message: "User already exists, you can't create multiple accounts!" })
      return;
    }

    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err })
        return;
      }

      if (user) {
        res.status(400).send({message: "Email already exists, you can't create multiple accounts!"})
        return;
      }

      next()
    })
  })
}

roleValidityCheck = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({ message: 'invalid user role specified!' })
        return;
      }
    }
  }

  next()
}

const verifyUser = {
  duplicityCheck,
  roleValidityCheck
}

module.exports = verifyUser