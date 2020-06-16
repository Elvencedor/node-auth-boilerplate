const db = require("../models");

const User = db.user;

// check for user object duplicates in database
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

// check for existence of specified role on user request
roleValidityCheck = (req, res, next) => {
  const ROLES = db.ROLES;
  if (req.body.roles) {
    // iterate through roles array and compare against request body
    for (let i = 0; i < ROLES.length; i++) {
      if (ROLES[i] == req.body.roles) {
        next();
      }
    }

    res.status(400).send({
      message: `invalid user role '${req.body.roles}' specified!`,
    });
    return;
  }

  
};

const verifyUser = {
  duplicityCheck,
  roleValidityCheck,
};

module.exports = verifyUser;
