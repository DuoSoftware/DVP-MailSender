/**
 * Created by a on 7/20/2016.
 */
var config = require('config');

var nodemailer = require('nodemailer');

var  smtpHost = {
    host: config.SMTP.ip,
    port: config.SMTP.port,
    pool: true,
    tls: {
        rejectUnauthorized: false
    },
    logger: false
};

if(config.SMTP.user && config.SMTP.password){
    
    smtpHost.auth = {
        user: config.SMTP.user,
        pass: config.SMTP.password
    }
}


var transporter = nodemailer.createTransport(smtpHost);

module.exports.transporter = transporter;


