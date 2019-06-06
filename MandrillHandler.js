var uuid = require('node-uuid');
var mandrill = require('mandrill-api/mandrill');
var Mandrill = require('dvp-mongomodels/model/Mandrill').MandrillAccount;
var format = require("stringformat");
var Template = require('./Model/Template').Template;
var dust = require('dustjs-linkedin');
var juice = require('juice');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var util = require('util');
var config = require('config');

var mandrill_client;
mandrill_client = new mandrill.Mandrill(config.MANDRILL.mandrillAPIKey);


var addSendersDomain = function addSendersDomain(domain) {
    return new Promise(function (resolve, reject) {
        mandrill_client.senders.addDomain({
            "domain": domain
        }, function (result) {
            resolve(result)
        }, function (e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            reject(e)
        })
    })
};

var addInboundDomain = function addInboundDomain(domain) {
    return new Promise(function (resolve, reject) {
        mandrill_client.inbound.addDomain({
            "domain": domain
        }, function (result) {
            resolve(result)
        }, function (e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            reject(e)
        })
    })
};

var addRoute = function addRoute(domain, pattern, url) {
    return new Promise(function (resolve, reject) {
        mandrill_client.inbound.addRoute({
            "domain": domain,
            "pattern": pattern,
            "url": url
        }, function (result) {
            resolve(result)
        }, function (e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            reject(e)
        })
    })
};

var createSubAccountIfNotExist = function createSubAccountIfNotExist(company, tenant) {
    return new Promise(function (resolve, reject) {
        var uid = uuid.v4();
        try {

            Mandrill.findOne({ // check if Mandrill subaccount already created
                company: company,
                tenant: tenant
            }, function (err, mandrillAcc) {
                if (err) {
                    reject(err);
                } else {
                    if (mandrillAcc) {
                        resolve(mandrillAcc)
                    } else {
                        mandrill_client.subaccounts.add({
                            "id": uid,
                            "name": company + ':' + tenant,
                            "custom_quota": 40
                        }, function (result) {
                            var mandrill = Mandrill({
                                company: company,
                                tenant: tenant,
                                sub_account_id: result.id,
                                created_at: Date.now(),
                                updated_at: Date.now(),
                                status: true
                            });
                            mandrill.save(function (err, result) {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(result)

                                }
                            })

                        }, function (e) {
                            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                            reject(e)
                        })
                    }

                }

            });
        } catch (e) {
            reject(e)
        }

    })
};

var getSubAccount = function (company, tenant) {

    return new Promise(function (resolve, reject) {
        try {

            Mandrill.findOne({
                company: company,
                tenant: tenant
            }, function (err, mandrillAcc) {
                if (err) {
                    reject(err);
                } else {
                    if (mandrillAcc) {
                        resolve(mandrillAcc)
                    } else {
                        reject("No Subaccounts found")
                    }
                }

            });
        } catch (e) {
            reject(e)
        }
    })
};

var whitelistEmail = function whitelistEmail(email, company, tenant) {
    return new Promise(function (resolve, reject) {
        mandrill_client.whitelists.add({"email": email, "comment": company + ":" + tenant}, function (res) {
            resolve(res)
        }, function (err) {
            reject(err)
        })
    })
};

var verifySendersDomain = function verifySendersDomain(domain, mailbox) {
    return new Promise(function (resolve, reject) {
        mandrill_client.senders.verifyDomain({"domain": domain, "mailbox": mailbox}, function (result) {
            console.log(result);
            resolve(result);
        }, function (e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            reject(e)
        });
    })
};

var sendMail = function sendMail(data, org, email) {
    logger.info("Email sending process initiated from Mandrill Handler");
    console.log("Email sending process initiated from Mandrill Handler");

    var async = false;
    //var ip_pool = "Main Pool";
    var send_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    return new Promise(function (resolve, reject) {

        getSubAccount(org.id, org.tenant).then(function (subAcc) {
            var mailOptions = {
                to: [{
                    "email": data.message.to,
                    "type": "to",
                    "send_at": send_at
                }],
                subject: data.message.subject,
                text: data.message.body,
                html: data.message.body,
                ticket: true,
                engagement: data.message.engagement,
                headers: {},
                important: false,
                subaccount: subAcc.sub_account_id
            };

            if (email && email.domain) {
                mailOptions.from_email = format("{0}@{1}", data.message.from, email.domain);
                mailOptions.headers.replyTo = format("{0}@{1}.{2}", data.message.from, org.companyName, email.domain);
            } else {
                mailOptions.from_email = format("{0}@facetone.com", data.message.from);
                mailOptions.headers.replyTo = format("{0}@{1}.facetone.com", data.message.from, org.companyName);
            }

            if (email && email.fromOverwrite) {
                mailOptions.from_email = email.fromOverwrite;
                mailOptions.headers.replyTo = email.fromOverwrite;
                console.log("Overwrite Sender ............");
            }

            var attachments = [];

            if (data.message.attachments && util.isArray(data.message.attachments)) {

                data.message.attachments.forEach(function (item) {

                    if (item.url && item.name) {

                        attachments.push({   // use URL as an attachment
                            filename: item.name,
                            path: item.url
                        });
                    }

                });

            }
            console.log("-------- Step 5 -------------");
            if (util.isArray(attachments) && attachments.length > 0) {
                mailOptions.attachments = attachments;
            }
            if (data.message.template) {
                Template.findOne({
                    name: data.message.template,
                    company: data.message.company,
                    tenant: data.message.tenant
                }, function (errPickTemplate, resPickTemp) {


                    if (!errPickTemplate) {

                        if (resPickTemp && resPickTemp.content && resPickTemp.content.content) {

                            var compileid = uuid.v4();

                            var compiled = dust.compile(resPickTemp.content.content, compileid);
                            dust.loadSource(compiled);
                            dust.render(compileid, data.message.Parameters, function (errRendered, outRendered) {
                                if (errRendered) {
                                    logger.error("Error in rendering " + errRendered);
                                } else {

                                    var renderedTemplate = "";
                                    var juiceOptions = {
                                        applyStyleTags: true
                                    };

                                    if (resPickTemp.styles.length > 0) {
                                        for (var i = 0; i < resPickTemp.styles.length; i++) {
                                            if (i == 0) {
                                                renderedTemplate = outRendered;
                                            }

                                            //console.log(resPickTemp.styles[i].content);
                                            logger.info("Rendering is success " + resPickTemp.styles[i].content);

                                            renderedTemplate = juice.inlineContent(renderedTemplate, resPickTemp.styles[i].content, juiceOptions);
                                            if (i == (resPickTemp.styles.length - 1)) {

                                                if (resPickTemp.filetype.toLowerCase() == 'html') {
                                                    mailOptions.html = renderedTemplate;
                                                } else {
                                                    mailOptions.text = renderedTemplate;
                                                }
                                            }
                                        }
                                    } else {
                                        console.log("Rendering Done");

                                        if (resPickTemp.filetype.toLowerCase() == 'html') {
                                            mailOptions.html = outRendered;
                                        } else {
                                            mailOptions.text = outRendered;
                                        }

                                    }

                                    if (resPickTemp.content.subject) {

                                        var compilesubid = uuid.v4();
                                        var compiledsub = dust.compile(resPickTemp.content.subject, compilesubid);
                                        dust.loadSource(compiledsub);
                                        dust.render(compilesubid, data.message.Parameters, function (errsubRendered, outsubRendered) {
                                            mailOptions.subject = outsubRendered;
                                            mandrill_client.messages.send({
                                                "message": mailOptions,
                                                "async": async
                                            }, function (result) {
                                                if (result[0].status === "rejected") {
                                                    reject(result);
                                                } else {
                                                    result.mailDetails = {
                                                        "from_email": mailOptions.from_email,
                                                        "to_email": mailOptions.to[0].email,
                                                        "engagement": mailOptions.engagement,
                                                        "company": org.id,
                                                        "tenant": org.tenant,
                                                        "messageId": result[0]._id,
                                                        "subject": data.message.subject
                                                    };

                                                    console.log(result);
                                                    resolve(result);
                                                }

                                            }, function (e) {

                                                reject(e);

                                            });
                                        });

                                    } else {

                                        mandrill_client.messages.send({
                                            "message": mailOptions,
                                            "async": async
                                        }, function (result) {
                                            if (result[0].status === "rejected") {
                                                reject(result);
                                            } else {
                                                result.mailDetails = {
                                                    "from_email": mailOptions.from_email,
                                                    "to_email": mailOptions.to[0].email,
                                                    "engagement": mailOptions.engagement,
                                                    "company": org.id,
                                                    "tenant": org.tenant,
                                                    "messageId": result[0]._id,
                                                    "subject": data.message.subject
                                                };

                                                console.log(result);
                                                resolve(result);
                                            }

                                        }, function (e) {
                                            reject(e);
                                        });
                                    }
                                }
                            });
                        } else {
                            logger.error("No template found");
                            reject();
                        }
                    } else {
                        logger.error("Pick template failed ", errPickTemplate);
                        reject();
                    }
                });
            } else {
                mandrill_client.messages.send({
                    "message": mailOptions,
                    "async": async
                }, function (result) {
                    if (result[0].status === "rejected") {
                        reject(result);
                    } else {
                        result.mailDetails = {
                            "from_email": mailOptions.from_email,
                            "to_email": mailOptions.to[0].email,
                            "engagement": mailOptions.engagement,
                            "company": org.id,
                            "tenant": org.tenant,
                            "messageId": result[0]._id,
                            "subject": data.message.subject
                        };

                        console.log(result);
                        resolve(result);
                    }

                }, function (e) {

                    reject(e);

                });

            }
        }).catch(function (err) {
            reject(err)
        });


    })
};


module.exports.addSendersDomain = addSendersDomain;
module.exports.addInboundDomain = addInboundDomain;
module.exports.addRoute = addRoute;
module.exports.createSubAccountIfNotExist = createSubAccountIfNotExist;
module.exports.whitelistEmail = whitelistEmail;
module.exports.verifySendersDomain = verifySendersDomain;
module.exports.sendMail = sendMail;