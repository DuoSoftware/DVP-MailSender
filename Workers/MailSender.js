/**
 * Created by a on 7/20/2016.
 */


var amqp = require('amqp');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var mailSender = require('../Workers/MailSenderFactory');
var SMPTTansporter = require('../Workers/SMPTConnector').transporter;
var addressparser = require('addressparser');
var util = require('util');
var config = require('config');
var emailSendMethod = config.EmailSendMethod;
var CreateEngagement = require('dvp-common/ServiceAccess/common').CreateEngagement;
var Org = require('dvp-mongomodels/model/Organisation');
var Email = require('dvp-mongomodels/model/Email').Email;
var EmailSession = require('dvp-mongomodels/model/MailSession').EmailSession;

//var queueHost = format('amqp://{0}:{1}@{2}:{3}',config.RabbitMQ.user,config.RabbitMQ.password,config.RabbitMQ.ip,config.RabbitMQ.port);
var queueName = config.Host.emailQueueName;

var waiting = [];

SMPTTansporter.on('idle', flushWaitingMessages);

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
    queueConnection.queue(queueName, {durable: true, autoDelete: false}, function (q) {
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


function createEngagement(engagementObj) {

    var from = addressparser(engagementObj.from_email);
    var to = addressparser(engagementObj.to_email);

    if (util.isArray(to)) {
        engagementObj.to_email = to[0].address;
    }

    if (util.isArray(from)) {

        engagementObj.from_email = from[0].address;

    }


    CreateEngagement('email', engagementObj.company, engagementObj.tenant, engagementObj.from_email, engagementObj.to_email, 'outbound', engagementObj.messageId, engagementObj.subject, function (done) {
        if (done) {
            logger.debug("engagement created successfully");
        } else {

            logger.error("engagement creation failed");
        }
    })

}

function flushWaitingMessages() {

    var send = function (data) {

        /////////////////////////////////////////////send message(template)/////////////////////////////////////////////
        console.log("-------- Step 1 -------------");
        Org.findOne({tenant: data.message.tenant, id: data.message.company}, function (err, org) {
            console.log("-------- Step 2 -------------");
            if (err) {

                logger.error("Organization didn't found", err);
                data.ack.acknowledge();

            } else {
                if (org) {
                    console.log("-------- Step 3 -------------");
                    Email.findOne({ company: data.message.company, tenant: data.message.tenant, name: data.message.from }, function (err, email) {
                        //Email.findOne({company: data.message.company, tenant: data.message.tenant}, function (err, email) {
                        console.log("-------- Step 4 -------------");
                        console.log(email);
                        console.log("-------- ******** -------------");
                        console.log(data);
                        console.log("-------- ******** -------------");
                        if (err) {

                            logger.error("Organization emails didn't found", err);
                            data.ack.acknowledge();

                        } else {

                                mailSender.mailSenderFactory(emailSendMethod).sendMail(data, org, email).then(function(info){
                                        console.log('Message delivered (%s): %s', data.deliveryTag, info);
                                        console.log("----------------------------");
                                        console.log(info);
                                        data.ack.acknowledge();
                                        if(info.mailDetails.engagement) {
                                            createEngagement(info.mailDetails);
                                        }
                                        else{
                                            logger.debug("No engagement requested to be created");
                                        }

                                        var from = [{address: info.mailDetails.from_email}];
                                        var to = [{address: info.mailDetails.to_email}];
                                        var emailSession = EmailSession({
                                            direction: "outbound",
                                            company: data.message.company,
                                            tenant: data.message.tenant,
                                            created_at: Date.now(),
                                            html: data.message.body,
                                            text: data.message.body,
                                            subject: data.message.subject,
                                            to: to,
                                            from: from,
                                            date: Date.now(),
                                            attachments: data.message.attachments,
                                            messageId: info.mailDetails.messageId

                                        });

                                        emailSession.save(function (err, result) {
                                            if(err){
                                                console.log(err);
                                                logger.error(err);
                                            }
                                            else {
                                                console.log("Email Session saved successfully")
                                            }
                                        });
                                    }

                                ).catch(function (err) {
                                    console.log('Message failed (%s): %s', data.deliveryTag, err);
                                    setTimeout(function () {
                                        data.ack.acknowledge();
                                    }, 1000);
                                });
                            console.log("-------- Done -------------");
                        }
                    });

                } else {

                    logger.error("No Organization found", err);
                    data.ack.acknowledge();
                }
            }
        });
    };

    if(emailSendMethod.toLowerCase() === "smpt") {
        while (SMPTTansporter.isIdle() && waiting.length) {
            send(waiting.shift());
        }
    }
    else if(emailSendMethod.toLowerCase() === 'mandrill'){
        while (waiting.length){
            send(waiting.shift());
        }
    }

}



