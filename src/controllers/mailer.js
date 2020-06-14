const nodemailer = require("nodemailer");
const config = require("../../config/config");
const db = require("../models");

const user = db.user;

function send_mail({ from = 'test@domain.com', to, subject, html }) {
  const transporter = nodemailer.createTransport(config.nodemailerOptions);

  transporter.sendMail({from,to,subject,html});
}

module.exports = send_mail