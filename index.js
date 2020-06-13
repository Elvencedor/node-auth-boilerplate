const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./src/models/index");
const dbConfig = require("./config/db.config");

const app = express();

var corsOptions = {
  origin: "http://localhost:8080",
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection successful");
    initial();
  })
  .catch((err) => {
    console.error("Connection to database failed", err);
    process.exit();
  });

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("err", err);
        }
        console.log(`added 'user' to roles collection`);
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("err", err);
        }
        console.log(`added 'admin' to roles collection`);
      });
    }
  });
}

require('./src/routes/auth.routes')(app)
require('./src/routes/user.routes')(app)
