const db = require("../models");

const User = db.User;

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

const verifyUser = {
  duplicityCheck,
  roleValidityCheck,
};

module.exports = verifyUser;
