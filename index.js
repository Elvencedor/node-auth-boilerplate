const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./src/models/index");
const config = require("./config/index");

const app = express();

var corsOptions = {
  origin: `${config.host}:${config.port}`,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.mongoose
  .connect(`mongodb://${config.dbOptions.host}:${config.dbOptions.port}/${config.dbOptions.db}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Connection to database failed", err);
    process.exit();
  });


require('./src/routes/auth.routes')(app)
require('./src/routes/user.routes')(app)



app
.use((req, res, next) => {
  // 404
  return res.status(404).json({ message: 'NotFound' });
}) 
.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: 'InternalError' });
})
.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});
