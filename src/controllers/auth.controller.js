const config = require("../../config/index");
const send_mail = require("./mailer");
var jwt = require("jsonwebtoken");
var session = require("sessionstorage");
const joi = require("@hapi/joi");
const { User } = require("../models");

const UserModel = User;

exports.signup = async (req, res) => {
  // define joi schema
  const schema = joi.object({
    email: joi.string().email().required().description("email is required"),
    password: joi.string().min(8),
    role: joi
      .string()
      .allow("public", "internal", "merchant")
      .default("public"),
  }).allow(true);


  try {
    await schema.validateAsync(req.body)
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: error.details });
  }
  
  // instantiate user model
  const user = new UserModel({
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    address: req.body.address,
  });
  const { role, email } = user;

  try {
    await user.save();
    return res
      .status(200)
      .send({ message: "User registration successful!", user: { role, email } });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: 'Error creating a user' });
  }
};

exports.login = async (req, res, next) => {
  
  const { email, password } = req.body;
  let user;
  try {
    user = await UserModel.getUserByEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    return next(err);
  }

  // sign off new token with the request
  const token = jwt.sign({ 
    user_id: user._id,
    email: user.email,
    role: user.role
  }, config.auth.secret, {
    expiresIn: 86400,
  });

  // TODO: session should live in Redis
  if (!session.getItem("userId")) {
    session.setItem("userId", `${user._id}`);
  }
   
  return res.status(200).send({
    id: user._id,
    email: user.email,
    role: user.role,
    accessToken: token,
    session: session.getItem("userId"),
  });
};

// handler for sending mail to users
exports.mailHandler = async (req, res) => {
  const { email } = req.body;
  let user;
  try {
    user = await UserModel.findOne({ email });

  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: `An unknown error occurred - ${err}` });
  }

  if (!user || !user.email) {
    return res.status(200).send({
      message: "Mail sent successfully.",
      token: null,
    });
  }

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

  return res.status(200).send({
    message: "Mail sent successfully.",
    token: token,
  });

};

const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.auth.secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      return resolve(decoded);
    });
  });
}

exports.resetPassword = async (req, res) => {
  const token = req.query.token;
  let decoded;
  try {
    decoded = await verifyJWT(token);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Error updating user" });
  }

  const { email } = decoded;
  const { password } = req.body;

  try {
    await UserModel.findOneAndUpdate(
        { email },
        {$set: { password }},
        {new : true}
    );
    console.log(user);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Error updating user" });
  }

  return res.status(200).send({ message: "Password reset was successful" });
};
