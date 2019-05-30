/**
 * Created by Nimeshka on 5/21/2019.
 */

var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var PersonalMessage = require('dvp-mongomodels/model/Room').PersonalMessage;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var crypto_handler = require('./crypto_handler.js');


function getConverstation(req, res) {

    logger.debug("DVP-SocialConnector.GetEmailReport Internal method ");

    var jsonString;

    var filters = {
        company: parseInt(req.user.company), 
        tenant: parseInt(req.user.tenant)
    };

    if(req.params && req.params.engagementId) {

        PersonalMessage.find({ session: req.params.engagementId })
            .sort({created_at: 'asc'})
            .exec(function (err, result) {
                if (err) {
                    jsonString = messageFormatter.FormatMessage(err, "Get messages failed!", false, undefined);
                } else {
                    var decryptedMsgs = decryptMessages(result);
                    jsonString = messageFormatter.FormatMessage(null, "Get messages successful", true, decryptedMsgs);
                }

                res.end(jsonString);
            });
    } else {
        jsonString = messageFormatter.FormatMessage(new Error('Engagement Id not provided'), "Engagement Id not provided", false, undefined);
        res.end(jsonString);
    }
};

function decryptMessages(messages) {
    return messages.map(function (item) {
        item.data = crypto_handler.Decrypt(item.data);
        return item;
    });
};

module.exports.getConverstation = getConverstation;