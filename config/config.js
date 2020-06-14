const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  nodemailerOptions: {
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  },
  nodemailer_recipient: process.env.NODEMAILER_RECIPIENT,
  dbOptions: {
    host: process.env.HOST,
    port: process.env.DB_PORT,
    db: process.env.DB_NAME,
  },
  auth: {
    secret: process.env.SECRET,
  },
};