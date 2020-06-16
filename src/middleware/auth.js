const jwt = require("jsonwebtoken");
const session = require('sessionstorage')
const config = require("../../config/index");
const db = require("../models");

const user = db.User;

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
    next();
  });
};

// check for role validity of admin
const isAdmin = (req, res, next) => {

  user.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    const roles = user.roles

    // check for authenticity of user making request
      if (roles === "admin") {
        next();
        return;
      }

    res.status(403).send({ message: "Admin role required!" });
  });
};

// fetch single user
const fetchSelf = (req, res) => {
  const userId = session.getItem('userId')

  if (userId) {
    user.findById(userId).exec((err, user) => {
      if (err) {
        res.status(400).send("User could not be found!");
      }

      let token = req.headers["x-access-token"];

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

      res
        .status(200)
        .send({ message: { username: user.username, email: user.email } });
    });
  } else {
    res.status(400).send({message: 'session not set or expired. Login to continue'})
  }
  
};

// fetch single user by id
const fetchUserById = (req, res, next) => {
  const userId = session.getItem("userId");

  if (userId) {
    user.findById(userId).exec((err,user) => {
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

      const roles = db.ROLES

      // iterate through roles array to very role of user
      for (let i = 0; i < roles.length; i++) {
        if (roles[i] === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({ message: "Admin role required!" });
    });
  } else {
    res.status(400).send({message: 'session not set or expired. Login to continue'})
  }
  
  
}

// fetch all existing users in database
const fetchAllUsers = (req, res) => {
  const users = []
  user.find().exec((err, user) => {
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
    user.findById(req.userId).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      const roles = user.roles

      // iterate through roles array to very role of user
      for (let i = 0; i < roles.length; i++) {
        if (roles[i] === "merchant") {
          next();
          return;
        }
      }

      res.status(403).send({ message: "Merchant role required!" });
    });
  } else {
    res.status(400).send({message: 'session not set or expired. Login to continue'})
  }
  
}

const authJwt = {
  verifyToken,
  isAdmin,
  isMerchant,
  fetchSelf,
  fetchUserById,
  fetchAllUsers
};

module.exports = authJwt;
