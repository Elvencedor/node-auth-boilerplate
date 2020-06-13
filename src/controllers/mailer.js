const nodemailer = require("nodemailer");
const mail_config = require("../../config/nodemailer.config");
const config = require("../../config/auth.config");
const db = require("../models");

const user = db.user;

function send_mail({ from = 'test@domain.com', to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: mail_config.HOST,
    port: mail_config.PORT,
    auth: {
      user: mail_config.USER,
      pass: mail_config.PASS,
    },
  });

  transporter.sendMail({from,to,subject,html});
}

module.exports = send_mail