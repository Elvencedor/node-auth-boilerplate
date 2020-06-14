const config = require("../../config/config");
const db = require("../models");
const send_mail = require("./mailer");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var session = require("sessionstorage");
const joi = require("@hapi/joi");

const user = db.user;
const role = db.role;

exports.signup = (req, res) => {
  const schema = joi.object({
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: joi.string().min(8),
  });

  const { value, error } = schema.required().validate({
    email: req.body.email,
    password: req.body.password,
  });

  if (value) {
    if (error) {
      res.status(500).send({ message: error.details });
      return;
    }
    const User = new user({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    User.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (req.body.roles) {
        role.find({ name: { $in: req.body.roles } }, (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User registration successful!" });
          });
        });
      } else {
        role.findOne({ name: "user" }, (err, role) => {
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User registration successful!" });
          });
        });
      }
    });
  }

  
};

exports.signin = (req, res) => {
  const schema = joi.object({
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: joi.string().min(8),
  });

  const { value, error } = schema.required().validate({
    email: req.body.email,
    password: req.body.password,
  });

  if (value) {
    if (error) {
      res.status(500).send({message: error.details})
    }

    user
      .findOne({
        email: req.body.email,
      })
      .populate("roles", "-__v")
      .exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!user) {
          return res.status(404).send({ message: "User not found." });
        }

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

        var token = jwt.sign({ id: user.id }, config.auth.secret, {
          expiresIn: 86400,
        });

        var authorities = [];

        for (let i = 0; i < user.roles.length; i++) {
          authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
        }

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

exports.mailHandler = (req, res) => {
  const userId = session.getItem("userId");
  user.findById(userId).exec((err, user) => {
    if (err) {
      res.status(400).send("Unauthorized access, please login!");
    }

    var token = jwt.sign({ id: user.id }, config.auth.secret, {
      expiresIn: 86400,
    });

    const html = `<p> Please use the link below to reset your password.</p>
    <p> <a href="http://localhost:3000/api/users/resetPassword?token=${token}&id=${user._id}">click here to reset your password</a></p>`;

    send_mail({
      to: config.nodemailerOptions.from,
      subject: "password reset verification",
      html: `<h3>Reset password</h3>
      <p>${html}</p>`,
    });

    res.status(200).send({ message: "Mail sent successfully.", token: token });
  });
};

exports.resetPassword = (req, res) => {
  const token = req.query.token;
  jwt.verify(token, config.auth.secret, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ message: `Unauthorized access: ${req.query.token}` });
    }

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
  });
};
