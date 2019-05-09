var SMPTSendMail = require('../SMPTHandler');
var MandrillHandler = require('../MandrillHandler').MandrillHandler;
var mandrillHandler = new MandrillHandler();

var mailSenderFactory = function(send_method) {
    if (send_method == 'SMPT') {
        return SMPTSendMail;
    } else if (send_method == 'mandrill') {
        return mandrillHandler;
    }
};


module.exports.mailSenderFactory = mailSenderFactory;