/**
 * Created by a on 7/18/2016.
 */


var Org = require('dvp-mongomodels/model/Organisation');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var Email = require('dvp-mongomodels/model/Email').Email;
var Mandrill = require('dvp-mongomodels/model/Mandrill').MandrillAccount;
const {MandrillHandler} = require('../MandrillHandler');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');

const mandrillHandler = new MandrillHandler();

function GetOrganisation(company, tenant, cb) {
    logger.debug("DVP-UserService.GetOrganisation Internal method ");
    var jsonString;
    Org.findOne({ tenant: tenant, id: company }, function (err, org) {
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

            if (domain) { // if domain exists it is considered as a mandrill email config

                Mandrill.findOne({ // check if Mandrill subaccount already created
                    company: company,
                    tenant: tenant
                }, function (err, mandrillAcc) {

                    if (err) {

                        jsonString = messageFormatter.FormatMessage(err, "Error occurred while retrieving Mandrill account", false, undefined);
                        res.end(jsonString);

                    } else {

                        if (mandrillAcc) { // if account exists add domain

                            mandrillHandler.addDomain(req.body.domain).then(function (result) {

                                    let email = req.body.name + '@' + req.body.domain;
                                    mandrillHandler.whitelistEmail(email, company, tenant).then(function (result) {

                                        jsonString = messageFormatter.FormatMessage(err, "Email saved successfully", true, result);
                                        res.end(jsonString);

                                    }).catch(function (err) {

                                        jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding domain to Mandrill", false, result);
                                        res.end(jsonString);

                                    })

                                }
                            ).catch(function (err) {

                                jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding domain to Mandrill", false, result);
                                res.end(jsonString);

                            })
                        } else { // if account does not exist create subaccount and add domain

                            mandrillHandler.createSubAccount(company, tenant).then(function (result) {

                                console.log(result);
                                var mandrill = Mandrill({
                                    company: company,
                                    tenant: tenant,
                                    sub_account_id: result.id,
                                    created_at: Date.now(),
                                    updated_at: Date.now(),
                                    status: true
                                });
                                mandrill.save(function (result) {

                                    console.log(result);
                                    mandrillHandler.addDomain(req.body.domain).then(function (result) {

                                            let email = req.body.name + '@' + req.body.domain;
                                            mandrillHandler.whitelistEmail(email).then(function (result) {
                                                if(result.added) {

                                                    jsonString = messageFormatter.FormatMessage(err, "Email saved successfully", true, result);
                                                    res.end(jsonString);

                                                }
                                                else{

                                                    jsonString = messageFormatter.FormatMessage(err, "Email saved successfully but couldn't whitelist the email", true, result);
                                                    res.end(jsonString);

                                                }

                                            }).catch(function (err) {

                                                jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding domain to Mandrill", false, result);
                                                res.end(jsonString);

                                            })
                                        }
                                    ).catch(function (err) {

                                        jsonString = messageFormatter.FormatMessage(err, "Error occurred while adding domain to Mandrill", false, result);
                                        res.end(jsonString);

                                    })
                                });

                            }).catch(function (err) {

                                jsonString = messageFormatter.FormatMessage(err, "Error occurred while creating Mandrill subaccount", false, null);
                                res.end(jsonString);

                            });
                        }
                    }
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

    Email.findOneAndUpdate({ _id: req.params.id, company: company, tenant: tenant }, email, function (err, twitter) {
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
    Email.findOne({ _id: req.params.id, company: company, tenant: tenant }, function (err, email) {
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
    Email.find({ company: company, tenant: tenant }, function (err, email) {
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


module.exports.CreateMailAccount = CreateMailAccount;
module.exports.UpdateEmailAccount = UpdateEmailAccount;
module.exports.DeleteEmailAccount = DeleteEmailAccount;
module.exports.GetEmailAccounts = GetEmailAccounts;
module.exports.GetEmailAccount = GetEmailAccount;
