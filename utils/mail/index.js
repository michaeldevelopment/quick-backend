const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid");
const config = require("../../config");

exports.welcomeEmail = async (username, email) => {
  const options = {
    apiKey: config.sendgrid.apiKey,
  };

  let transporter = nodemailer.createTransport(sgTransport(options));

  let info = await transporter.sendMail({
    from: `${config.sendgrid.senderEmail}`, // sender address
    to: `${email}`, // list of receivers
    subject: "Bienvenido a Quick App!", // Subject line
    text: `Hola, ${username} bienvenido a nuestra aplicacion Quick!`, // plain text body
    html: `<b>Hola, ${username} bienvenido</b>`, // html body
  });
};

exports.changePassword = async (username, email, id) => {
  const options = {
    apiKey: config.sendgrid.SENGRID_API_KEY,
  };

  let transporter = nodemailer.createTransport(sgTransport(options));

  let info = await transporter.sendMail({
    from: `${config.sendgrid.senderEmail}`, // sender address
    to: `${email}`, // list of receivers
    subject: "Recupera tu contraseña", // Subject line
    text: `Hola, ${username}. Has clic en el siguiente link para poder recuperar tu contraseña: ${config.sendgrid.resetUrl}/${id}`, // plain text body
    html: `<b>Hola, ${username} Has clic en el siguiente link para poder recuperar tu contraseña: ${config.sendgrid.resetUrl}/${id}</b>`, // html body
  });
};
