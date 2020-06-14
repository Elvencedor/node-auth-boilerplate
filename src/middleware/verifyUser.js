const db = require("../models");

const User = db.user;
const Roles = db.role;

duplicityCheck = (req, res, next) => {
  User.findOne({
    email: req.body.email,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res
        .status(400)
        .send({
          message: "Email already exists, you can't create multiple accounts!",
        });
      return;
    }

    next();
  });
};

roleValidityCheck = (req, res, next) => {
  const ROLES = db.ROLES;
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `invalid user role '${req.body.roles[i]}' specified!`,
        });
        return;
      }
    }
  }

  next();
};

const verifyUser = {
  duplicityCheck,
  roleValidityCheck,
};

module.exports = verifyUser;
