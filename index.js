const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./src/models/index");
const config = require("./config/config");

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
  .connect(`mongodb://${config.dbOptions.host}:${config.dbOptions.port}/${config.dbOptions.db}`, {
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
      const roles = [{ name: "public" }, { name: "admin" }, { name: "merchant" }, { name: "internal" }]
      Role.insertMany(roles, (err) => {
        if (err) {
          console.log('An error occurred: ', err)
        }

        console.log('Added - ')
        for (let role in roles) {
          console.info(`${roles[role].name} `)
        }
        console.log(' to roles collection')
      })
      
    }
  });
}

require('./src/routes/auth.routes')(app)
require('./src/routes/user.routes')(app)
