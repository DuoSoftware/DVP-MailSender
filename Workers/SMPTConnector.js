/**
 * Created by a on 7/20/2016.
 */

var format = require("stringformat");
var amqp = require('amqp');
var config = require('config');
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var Template = require('../Model/Template').Template;
var dust = require('dustjs-linkedin');
var juice = require('juice');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var CreateEngagement = require('dvp-common/ServiceAccess/common').CreateEngagement;
var addressparser = require('addressparser');
var util = require('util');


var Org = require('dvp-mongomodels/model/Organisation');
var Email = require('dvp-mongomodels/model/Email').Email;

//var queueHost = format('amqp://{0}:{1}@{2}:{3}',config.RabbitMQ.user,config.RabbitMQ.password,config.RabbitMQ.ip,config.RabbitMQ.port);
var queueName = config.Host.emailQueueName;

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

var waiting = [];

var transporter = nodemailer.createTransport(smtpHost);

var amqpIPs = [];
if (config.RabbitMQ.ip) {
    amqpIPs = config.RabbitMQ.ip.split(",");
}

var queueConnection = amqp.createConnection({
    host: amqpIPs,
    port: config.RabbitMQ.port,
    login: config.RabbitMQ.user,
    password: config.RabbitMQ.password,
    vhost: config.RabbitMQ.vhost,
    noDelay: true,
    heartbeat: 10
}, {
        reconnect: true,
        reconnectBackoffStrategy: 'linear',
        reconnectExponentialLimit: 120000,
        reconnectBackoffTime: 1000
    });

queueConnection.on('error', function (e) {
    console.log("Error from amqp: ", e);
});

queueConnection.on('ready', function () {
    queueConnection.queue(queueName, { durable: true, autoDelete: false }, function (q) {
        q.bind('#');
        q.subscribe({
            ack: true,
            prefetchCount: 10
        }, function (message, headers, deliveryInfo, ack) {

            //message = JSON.parse(message.data.toString());

            if (!message.from) {

                message.from = "no-reply";
            }

            if (message === undefined || message.to === undefined || message.company === undefined || message.tenant === undefined) {
                console.log('Invalid message, skipping');
                return ack.acknowledge();
            }
            ///////////////////////////create body/////////////////////////////////////////////////


            waiting.push({
                message: message,
                deliveryTag: deliveryInfo.deliveryTag.toString('hex'),
                ack: ack
            });

            flushWaitingMessages();
        });
    });
});

transporter.on('idle', flushWaitingMessages);

function SendMail(mailOptions, data) {
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log('Message failed (%s): %s', data.deliveryTag, err.message);
            setTimeout(function () {
                data.ack.acknowledge();
            }, 1000);
            return;
        }
        console.log('Message delivered (%s): %s', data.deliveryTag, info.response);
        data.ack.acknowledge();


        var from = addressparser(mailOptions.from);
        var to = addressparser(mailOptions.to);

        if (util.isArray(to)) {
            mailOptions.to = to[0].address;
        }

        if (util.isArray(from)) {

            mailOptions.from = from[0].address;

        }

        if (mailOptions.engagement) {
            CreateEngagement('email', data.message.company, data.message.tenant, mailOptions.from, mailOptions.to, 'outbound', info.messageId, data.message.subject, function (done) {
                if (done) {
                    logger.debug("engagement created successfully");
                } else {

                    logger.error("engagement creation failed");
                }
            })
        } else {

            logger.debug("No engagement requested to be created");
        }

    });
}

function flushWaitingMessages() {

    var send = function (data) {

        /////////////////////////////////////////////send message(template)/////////////////////////////////////////////
        console.log("-------- Step 1 -------------");
        Org.findOne({ tenant: data.message.tenant, id: data.message.company }, function (err, org) {
            console.log("-------- Step 2 -------------");
            if (err) {

                logger.error("Organization didn't found", err);
                data.ack.acknowledge();

            } else {
                if (org) {
                    console.log("-------- Step 3 -------------");
                    Email.findOne({ company: data.message.company, tenant: data.message.tenant, name: data.message.from }, function (err, email) {
                        console.log("-------- Step 4 -------------");
                         if (err) {

                            logger.error("Organization emails didn't found", err);
                            data.ack.acknowledge();

                        } else {

                            var mailOptions = {
                                to: data.message.to,
                                subject: data.message.subject,
                                text: data.message.body,
                                html: data.message.body,
                                ticket: true,
                                engagement: data.message.engagement,
                                headers: {
                                    "X-MC-Subaccount": "veery"
                                }
                            };

                            mailOptions.from = format("{0}@facetone.com", data.message.from);
                            mailOptions.replyTo = format("{0}@{1}.facetone.com", data.message.from, org.companyName);

                            if (email && email.fromOverwrite) {
                                mailOptions.from = email.fromOverwrite;
                                mailOptions.replyTo = email.fromOverwrite;
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

                            if (util.isArray(attachments) && attachments.length > 0) {
                                mailOptions.attachments = attachments;
                            }
                            if (data.message.template) {
                                Template.findOne({ name: data.message.template, company: data.message.company, tenant: data.message.tenant }, function (errPickTemplate, resPickTemp) {


                                    if (!errPickTemplate) {

                                        if (resPickTemp && resPickTemp.content && resPickTemp.content.content) {

                                            var compileid = uuid.v4();

                                            var compiled = dust.compile(resPickTemp.content.content, compileid);
                                            dust.loadSource(compiled);
                                            dust.render(compileid, data.message.Parameters, function (errRendered, outRendered) {
                                                if (errRendered) {
                                                    logger.error("Error in rendering " + errRendered);
                                                }
                                                else {

                                                    var renderedTemplate = "";
                                                    var juiceOptions = {
                                                        applyStyleTags: true
                                                    }

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
                                                    }
                                                    else {
                                                        console.log("Rendering Done");

                                                        if (resPickTemp.filetype.toLowerCase() == 'html') {
                                                            mailOptions.html = outRendered;
                                                        } else {
                                                            mailOptions.text = outRendered;
                                                        }

                                                        //SendMail(mailOptions, data);
                                                    }

                                                    if (resPickTemp.content.subject) {

                                                        var compilesubid = uuid.v4();
                                                        var compiledsub = dust.compile(resPickTemp.content.subject, compilesubid);
                                                        dust.loadSource(compiledsub);
                                                        dust.render(compilesubid, data.message.Parameters, function (errsubRendered, outsubRendered) {
                                                            mailOptions.subject = outsubRendered;
                                                            SendMail(mailOptions, data);
                                                        });

                                                    } else {

                                                        SendMail(mailOptions, data);
                                                    }
                                                }
                                            });
                                        } else {
                                            logger.error("No template found");
                                            data.ack.acknowledge();
                                        }
                                    } else {
                                        logger.error("Pick template failed ", errPickTemplate);
                                        data.ack.acknowledge();
                                    }
                                });
                            } else {
                                SendMail(mailOptions, data);
                            }
                        }
                    });



                    /* var mailOptions = {
                         to: data.message.to,
                         subject: data.message.subject,
                         text: data.message.body,
                         html: data.message.body,
                         ticket: true,
                         engagement: data.message.engagement,
                         headers: {
                             "X-MC-Subaccount": "veery"
                         }
                     };
 
                     ///thins to do/////////// get root from deployment/////////////////////////////////////
 
                     var attachments = [];
 
                     if(data.message.attachments && util.isArray(data.message.attachments)){
 
                         data.message.attachments.forEach(function(item){
 
                             if(item.url && item.name){
 
                                 attachments.push({   // use URL as an attachment
                                     filename: item.name,
                                     path: item.url
                                 });
                             }
 
                         });
 
                     }
 
                     if(util.isArray(attachments) && attachments.length > 0) {
                         mailOptions.attachments = attachments;
                     }
 
                     mailOptions.from= format("{0}@veery.cloud", data.message.from);
 
                     mailOptions.replyTo = format("{0}@{1}.veery.cloud", data.message.from, org.companyName);
 
                     if(data.message.template){
                         Template.findOne({name:data.message.template,company:data.message.company,tenant:data.message.tenant},function (errPickTemplate,resPickTemp) {
 
 
                             if(!errPickTemplate){
 
                                 if(resPickTemp && resPickTemp.content &&resPickTemp.content.content){
 
                                     var compileid = uuid.v4();
 
                                     var compiled = dust.compile(resPickTemp.content.content, compileid);
                                     dust.loadSource(compiled);
                                     dust.render(compileid, data.message.Parameters, function(errRendered, outRendered) {
                                         if(errRendered)
                                         {
                                             logger.error("Error in rendering "+ errRendered);
                                         }
                                         else {
 
                                             var renderedTemplate = "";
                                             var juiceOptions = {
                                                 applyStyleTags: true
                                             }
 
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
                                             }
                                             else {
                                                 console.log("Rendering Done");
 
                                                 if (resPickTemp.filetype.toLowerCase() == 'html') {
                                                     mailOptions.html = outRendered;
                                                 } else {
                                                     mailOptions.text = outRendered;
                                                 }
 
                                                 //SendMail(mailOptions, data);
                                             }
 
                                             if (resPickTemp.content.subject) {
 
                                                 var compilesubid = uuid.v4();
                                                 var compiledsub = dust.compile(resPickTemp.content.subject, compilesubid);
                                                 dust.loadSource(compiledsub);
                                                 dust.render(compilesubid, data.message.Parameters, function (errsubRendered, outsubRendered) {
                                                     mailOptions.subject = outsubRendered;
                                                     SendMail(mailOptions, data);
                                                 });
 
                                             } else {
 
                                                 SendMail(mailOptions, data);
                                             }
                                         }
                                     });
                                 }else{
                                     logger.error("No template found");
                                     data.ack.acknowledge();
                                 }
                             }else{
                                 logger.error("Pick template failed ",errPickTemplate);
                                 data.ack.acknowledge();
                             }
                         });
                     }else{
                         SendMail(mailOptions,data);
                     }*/
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                } else {

                    logger.error("No Organization found", err);
                    data.ack.acknowledge();
                }
            }
        });
    };


    while (transporter.isIdle() && waiting.length) {
        send(waiting.shift());
    }
}



