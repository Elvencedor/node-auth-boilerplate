const jwt = require("jsonwebtoken");
const Joi = require('@hapi/joi');
const session = require('sessionstorage')
const config = require("../../config/index");
const db = require("../models");

const UserModel = db.User;

const validateEmailPassword = async (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  try {
    await schema.validateAsync(req.body);
    return next();
  } catch (err) {
    console.error(err);
    return next('Invalid email or/and password');
  }
}

// verify token sent with request header or body
const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "Invalid or no token provided" });
  }

  jwt.verify(token, config.auth.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: `Unauthorized: ${err}` });
    }
    req.userId = decoded.id;
    return next();
  });
};

// check for role validity of admin
const isAdmin = (req, res, next) => {

  return UserModel.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user.role === 'admin') {
      return next();
    }

    return res.status(403).send({ message: "Admin role required!" });
  });
};

// fetch single user
const fetchSelf = (req, res) => {
  const userId = session.getItem('userId')

  if (userId) {
    UserModel.findById(userId).exec((err, user) => {
      if (err) {
        res.status(400).send("User could not be found!");
      }

      let token = req.headers['x-access-token'] || req.headers['authorization'];

      if (!token) {
        return res
          .status(403)
          .send({ message: "Invalid or no token provided" });
      }

      jwt.verify(token, config.auth.secret, (err,decoded) => {
        if (err) {
          return res.status(401).send({ message: `Unauthorized: ${err}` });
        }
      });

      return res
        .status(200)
        .send({ user });
    });
  } else {
    return res.status(400).send({message: 'session not set or expired. Login to continue'})
  }
  
};

// fetch single user by id
const fetchUserById = (req, res, next) => {
  const userId = session.getItem("userId");

  if (userId) {
    UserModel.findById(userId).exec((err,user) => {
      if (err) {
        res.status(400).send("User could not be found!");
      }

      let token = req.headers["x-access-token"];

      if (!token) {
        return res
          .status(403)
          .send({ message: "Invalid or no token provided" });
      }

      // verify token sent with request body
      jwt.verify(token, config.auth.secret, (err,user) => {
        if (err) {
          return res.status(401).send({ message: `Unauthorized: ${err}` });
        }
      });
      if (user.role === 'admin') {
        return next();
      }

      return res.status(403).send({ message: "Admin role required!" });
    });
  } 
  
  return res.status(400).send({message: 'session not set or expired. Login to continue'})  
}

// fetch all existing users in database
const fetchAllUsers = (req, res) => {
  const users = []
  UserModel.find().exec((err, user) => {
    if (err) {
      res.status(500).send({message: `An error occurred: ${err}`})
    }

    for (let obj in user) {
      users.push(obj)
    }
    res.status(200).send({message: users})
  })
}

const isMerchant = (req, res, next) => {
  if (req.userId) {
    UserModel.findById(req.userId).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (user.role === 'merchant') {
        return next();
      }
      
      return res.status(403).send({ message: "Merchant role required!" });
    });
  } else {
    return res.status(400).send({message: 'session not set or expired. Login to continue'})
  }
  
}

const authJwt = {
  verifyToken,
  isAdmin,
  isMerchant,
  fetchSelf,
  fetchUserById,
  fetchAllUsers,
  validateEmailPassword
};

module.exports = authJwt;
