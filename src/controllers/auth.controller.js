const config = require("../../config/index");
const db = require("../models");
const send_mail = require("./mailer");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var session = require("sessionstorage");
const joi = require("@hapi/joi");

const user = db.User;

exports.signup = (req, res) => {
  // define joi schema
  const schema = joi.object({
    email: joi.string().email().required().description("email is required"),
    password: joi.string().min(8),
    role: joi
      .string()
      .allow("public", "internal", "merchant")
      .default("public"),
  });

  // validate user request and destructure joi validation result
  const { value, error } = schema.required().validate({
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });

  if (value) {
    if (error) {
      res.status(500).send({ message: error.details });
      return;
    }

    // instantiate user model
    const User = new user({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      role: req.body.role,
      address: req.body.address,
    });

    // create new user document in database
    try {
      User.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        return res
          .status(200)
          .send({ message: "User registration successful!" });
      });
    } catch (error) {
      return res.status(403).send(`An error occurred - ${error}`);
    }
  }
};

exports.signin = (req, res) => {
  // define joi schema
  const schema = joi.object({
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: joi.string().min(8),
  });

  // validate user request and destructure joi validation result
  const { value, error } = schema.required().validate({
    email: req.body.email,
    password: req.body.password,
  });

  if (value) {
    if (error) {
      res.status(500).send({ message: error.details });
      return;
    }

    user
      .findOne({
        email: req.body.email,
      })
      .exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!user) {
          return res.status(404).send({ message: "User not found." });
        }

        // compare for validity of password string
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!",
          });
        }

        // sign off new token with the request
        var token = jwt.sign({ id: user.id }, config.auth.secret, {
          expiresIn: 86400,
        });

        const authorities = `ROLE_ ${user.roles.name.toUpperCase()}`;

        if (!session.getItem("userId")) {
          session.setItem("userId", `${user._id}`);
        }

        res.status(200).send({
          id: user._id,
          email: user.email,
          roles: authorities,
          accessToken: token,
          session: session.getItem("userId"),
        });
      });
  }
};

// handler for sending mail to users
exports.mailHandler = (req, res) => {
  // token to be sign off with password reset request
  var token = jwt.sign({ action: "forgotPassword" }, config.auth.secret, {
    expiresIn: "120000",
  });

  const html = `<p> Please use the link below to reset your password.</p>
    <p> <a href="http://localhost:3000/api/users/resetPassword?token=${token}&action=forgotPassword">click here to reset your password</a></p>`;

  send_mail({
    to: config.nodemailer_recipient,
    subject: "password reset verification",
    html: `<h3>Reset password</h3>
      <p>${html}</p>`,
  });

  res.status(200).send({ message: "Mail sent successfully.", token: token });
};

exports.resetPassword = (req, res) => {
  const token = req.query.token;
  jwt.verify(token, config.auth.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: `Unauthorized access: ${err}` });
    }
    if (req.query.id) {
      user.findById(req.query.id).exec((err, user) => {
        if (err) {
          res.status(400).send("Unauthorized access!");
        }

        var initialVal = { password: `${user.password}` };
        var newVal = {
          $set: { password: `${bcrypt.hashSync(req.body.password, 8)}` },
        };

        user.updateOne(initialVal, newVal);

        res.status(200).send({ message: "Password reset was successful" });
      });
    } else {
      res
        .status(400)
        .sent(`Invalid access, user id doesn't exist on the system`);
    }
  });
};
