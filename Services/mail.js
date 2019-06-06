/**
 * Created by a on 7/18/2016.
 */


var Org = require('dvp-mongomodels/model/Organisation');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var Email = require('dvp-mongomodels/model/Email').Email;
var Mandrillwh = require('dvp-mongomodels/model/MandrillWebhook').MandrillWebhook;
var mandrillHandler = require('../MandrillHandler');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var EmailSession = require('dvp-mongomodels/model/MailSession').EmailSession;
var uuid = require('node-uuid');

var config = require('config');

var emailSendMethod = config.EmailSendMethod;


function GetOrganisation(company, tenant, cb) {
    logger.debug("DVP-UserService.GetOrganisation Internal method ");
    var jsonString;
    Org.findOne({tenant: tenant, id: company}, function (err, org) {
        if (err) {
            return cb(false, undefined);
        } else {
            if (org) {
                return cb(true, org);
            } else {
                return cb(false, undefined);
            }
        }

    });
}

function CreateMailAccount(req, res) {


    logger.debug("DVP-SocialConnector.CreateMailAccount Internal method ");
    var jsonString;
    var tenant = parseInt(req.user.tenant);
    var company = parseInt(req.user.company);
    var domain = req.body.domain;

    var email = Email({


        company: company,
        tenant: tenant,
        name: req.body.name,
        domain: domain,
        fromOverwrite: req.body.fromOverwrite,
        ticket_type: req.body.ticket_type,
        ticket_tags: req.body.ticket_tags,
        ticket_priority: req.body.ticket_priority,
        created_at: Date.now(),
        updated_at: Date.now()

    });

    email.save(function (err, email) {

        if (err) {

            jsonString = messageFormatter.FormatMessage(err, "Email save failed", false, undefined);
            res.end(jsonString);

        } else {

            if (emailSendMethod.toLowerCase() === 'mandrill') { // if domain exists it is considered as a mandrill email config

                mandrillHandler.createSubAccountIfNotExist(company, tenant).then(function (mandrillAcc) {

                    var outboundDomain = req.body.fromOverwrite.split('@').pop();
                    mandrillHandler.addSendersDomain(outboundDomain).then(function (result) { // add domain to sender's domain

                            mandrillHandler.whitelistEmail(req.body.fromOverwrite, company, tenant).then(function (result) {

                                mandrillHandler.addInboundDomain(domain).then(function (result) {

                                    var pattern = '*'; // route all emails come to the domain to one webhook
                                    var webhookURL = config.Services.mailReceiverHost + '/DVP/API/' + config.Services.mailReceiverVersion + '/webhook/' + domain;

                                    var webhook = Mandrillwh({

                                        inbound_domain: domain,
                                        sub_account_id: mandrillAcc._id,
                                        webhook_url: webhookURL,
                                        company: company,
                                        tenant: tenant,
                                        created_at: Date.now(),
                                        updated_at: Date.now(),
                                        status: true

                                    });
                                    webhook.save(function (err, result) {
                                        mandrillHandler.addRoute(domain, pattern, webhookURL).then(function (result) {
                                            jsonString = messageFormatter.FormatMessage(err, "Email saved successfully", true, result);
                                            res.end(jsonString);

                                        }).catch(function (err) {
                                            jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding webhook to Mandrill", false, result);
                                            res.end(jsonString);
                                        });

                                    });


                                }).catch(function (err) {
                                    jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding inbound domain to Mandrill", false, result);
                                    res.end(jsonString);
                                });


                            }).catch(function (err) {

                                jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding domain to Mandrill", false, result);
                                res.end(jsonString);

                            })


                        }
                    ).catch(function (err) {

                        jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding domain to Mandrill", false, result);
                        res.end(jsonString);

                    })
                }).catch(function (err) {
                    jsonString = messageFormatter.FormatMessage(err, "Error occurred while accessing Mandrill subaccount", false, result);
                    res.end(jsonString);
                })


            } else {

                jsonString = messageFormatter.FormatMessage(err, "Email saved successfully", true, email);
                res.end(jsonString);

            }
        }


    });


};

function UpdateEmailAccount(req, res) {


    logger.debug("DVP-SocialConnector.UpdateEmailAccount Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;


    var email = Email({


        ticket_type: req.body.ticket_type,
        ticket_tags: req.body.ticket_tags,
        ticket_priority: req.body.ticket_priority,
        updated_at: Date.now()

    });

    Email.findOneAndUpdate({_id: req.params.id, company: company, tenant: tenant}, email, function (err, twitter) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Update Email account failed", false, undefined);
        } else {
            jsonString = messageFormatter.FormatMessage(undefined, "Update Email account Success", true, twitter);
        }
        res.end(jsonString);
    });


};

function DeleteEmailAccount(req, res) {


    logger.debug("DVP-SocialConnector.DeleteEmailAccount Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;
    Email.findOneAndRemove({_id: req.params.id, company: company, tenant: tenant}, function (err, twitter) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Delete Email account failed", false, undefined);
        } else {
            jsonString = messageFormatter.FormatMessage(undefined, "Delete Email account Success", true, twitter);
        }
        res.end(jsonString);
    });

};

function GetEmailAccount(req, res) {


    logger.debug("DVP-SocialConnector.GetEmailAccount Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;
    Email.findOne({_id: req.params.id, company: company, tenant: tenant}, function (err, email) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Get Email account failed", false, undefined);
        } else {
            if (email) {
                jsonString = messageFormatter.FormatMessage(undefined, "Get Email account Success", true, email);
            } else {

                jsonString = messageFormatter.FormatMessage(undefined, "No Email account found", false, undefined);
            }
        }
        res.end(jsonString);
    });

};

function GetEmailAccounts(req, res) {


    logger.debug("DVP-SocialConnector.GetEmailAccounts Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;
    Email.find({company: company, tenant: tenant}, function (err, email) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Get Email accounts failed", false, undefined);
        } else {
            if (email && email.length > 0) {
                jsonString = messageFormatter.FormatMessage(undefined, "Get Email accounts Success", true, email);
            } else {

                jsonString = messageFormatter.FormatMessage(undefined, "No Email account found", false, undefined);
            }
        }
        res.end(jsonString);
    });

};

function GetEmailReport(req, res) {

    logger.debug("DVP-SocialConnector.GetEmailReport Internal method ");

    var limit = parseInt(req.query.limit) || 10;
    var offset = (parseInt(req.query.page) - 1 ) * limit || 0;
    
    var jsonString;

    var filters = {
        company: parseInt(req.user.company), 
        tenant: parseInt(req.user.tenant)
    };

    if(req.query.from_date && req.query.to_date) {
        try {
            var from_date = new Date(req.query.from_date);
            var to_date = new Date(req.query.to_date);
        } catch(ex) {
            jsonString = messageFormatter.FormatMessage(ex, "From and To dates are required", false, undefined);
            return res.end(jsonString);
        }

        if(from_date > to_date) {
            jsonString = messageFormatter.FormatMessage(new Error('Invalid date range'), "From date should be less than To Date", false, undefined);
            return res.end(jsonString);
        }

        filters['created_at'] = { $gte: from_date, $lte: to_date };
    
        if(req.query.from_email)
            filters['from.0.address'] = req.query.from_email;

        if(req.query.to_email)
            filters['to.address'] = req.query.to_email;

        if(req.query.direction)
            filters['direction'] = req.query.direction;

        EmailSession.count(filters).exec(function(err, count) {
            if(err) {
                jsonString = messageFormatter.FormatMessage(null, "Get emails error", true, unedfined);
                res.end(jsonString);
            } else {
                if(count > 0) {
                    EmailSession.find(filters, { html: 0, headers: 0 })
                    // .sort({created_at: 'desc'})
                    .skip(offset)
                    .limit(limit)
                    .exec(function (err, emails) {
                        if (err) {
                            jsonString = messageFormatter.FormatMessage(err, "Get emails error", false, undefined);
                        } else {
                            jsonString = messageFormatter.FormatMessage(null, "Get emails successful", true, { count: count, data: emails });
                        }

                        res.end(jsonString);
                    });
                } else {
                    jsonString = messageFormatter.FormatMessage(null, "Get emails successful", true, { count: 0, data: [] });
                    res.end(jsonString);
                }
            }
        });

    } else {
        jsonString = messageFormatter.FormatMessage(new Error('Date range not provided'), "From and To dates are required", false, undefined);
        res.end(jsonString);
    }
};

module.exports.CreateMailAccount = CreateMailAccount;
module.exports.UpdateEmailAccount = UpdateEmailAccount;
module.exports.DeleteEmailAccount = DeleteEmailAccount;
module.exports.GetEmailAccounts = GetEmailAccounts;
module.exports.GetEmailAccount = GetEmailAccount;
module.exports.GetEmailReport = GetEmailReport;
