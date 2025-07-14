
const nodemailer = require('nodemailer');
const { EMAIL_PASS, EMAIL_USER, EMAIL_PORT, EMAIL_HOST } = require('../config/dotenv.config');

const transporter = nodemailer.createTransport({ // basic configuration
    host: EMAIL_HOST, // smtp gmail server
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user : EMAIL_USER,
        pass : EMAIL_PASS,
    },
});


module.exports  =  transporter;