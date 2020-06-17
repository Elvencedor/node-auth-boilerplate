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
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 27017,
    db: process.env.DB_NAME || 'perdiem', 
  },
  auth: {
    secret: process.env.JWT_SECRET || 'secret...',
  },
  host: process.env.HOST,
  port: process.env.PORT || 3000
};