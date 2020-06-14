const jwt = require("jsonwebtoken");
const session = require('sessionstorage')
const config = require("../../config/config");
const db = require("../models");

const user = db.user;
const role = db.role;

verifyToken = (req, res, next) => {
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

isAdmin = (req, res, next) => {
  user.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    role.find({ _id: { $in: user.roles } }, (err, roles) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({ message: "Admin role required!" });
    });
  });
};

const fetchSelf = (req, res, next) => {
  const userId = session.getItem('userId')
  user.findById(userId).exec((err, user) => {
    if (err) {
      res.status(400).send("User could not be found!");
    }

    let token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({ message: "Invalid or no token provided" });
    }

    jwt.verify(token, config.auth.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: `Unauthorized: ${err}` });
      }
    });

    res.status(200).send({ message: {"username": user.username, "email": user.email} });
  });
};

const fetchUserById = (req, res) => {
  const id = req.query.id
  const userId = session.getItem("userId");
  user.findById(userId).exec((err, user) => {
    if (err) {
      res.status(400).send("User could not be found!");
    }

    let token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({ message: "Invalid or no token provided" });
    }

    jwt.verify(token, config.auth.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: `Unauthorized: ${err}` });
      }
    });

    role.find({ _id: { $in: user.roles } }, (err, roles) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          user.findById(id).exec((err, user) => {
            if (err) {
              res.status(400).send("User could not be found!");
            }

            res
              .status(200)
              .send({
                message: { username: user.username, email: user.email },
              });
          });
        }
      }

      res.status(403).send({ message: "Admin role required!" });
    });
  });
  
}

const fetchAllUsers = (req, res) => {
  const users = []
  user.find().exec((err, user) => {
    if (err) {
      res.status(500).send({message: `An error occurred: ${err}`})
    }

    for (obj in user) {
      users.push(user)
    }
    res.status(200).send({message: users})
  })
}

const isMerchant = (req, res, next) => {
  user.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    role.find({ _id: { $in: user.roles } }, (err, roles) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "merchant") {
          next();
          return;
        }
      }

      res.status(403).send({ message: "Merchant role required to access a store!" });
    });
  });
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
