var SMPTSendMail = require('../SMPTHandler');
var mandrillHandler = require('../MandrillHandler');

var mailSenderFactory = function(send_method) {
    if (send_method.toLowerCase() == 'smpt') {
        return SMPTSendMail;
    } else if (send_method.toLowerCase() == 'mandrill') {
        return mandrillHandler;
    }
};


module.exports.mailSenderFactory = mailSenderFactory;