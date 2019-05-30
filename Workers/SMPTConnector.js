/**
 * Created by a on 7/20/2016.
 */
var config = require('config');

var nodemailer = require('nodemailer');

var smtpHost = {
    host: config.SMTP.ip,
    port: config.SMTP.port,
    pool: true,
    auth: {
        user: config.SMTP.user,
        pass: config.SMTP.password
    },
    tls: {

        rejectUnauthorized: false
    },
    logger: false
};


var transporter = nodemailer.createTransport(smtpHost);

module.exports.transporter = transporter;


