/**
 * Created by a on 7/18/2016.
 */
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var util = require('util');
var Email = require('dvp-mongomodels/model/Email').Email;
var mongomodels = require('dvp-mongomodels');


if (config.Host.smtpsender)
    var smtpconnector = require('./Workers/SMPTConnector');



var util = require('util');
// var mongoip = config.Mongo.ip;
// var mongoport = config.Mongo.port;
// var mongodb = config.Mongo.dbname;
// var mongouser = config.Mongo.user;
// var mongopass = config.Mongo.password;
// var mongoreplicaset = config.Mongo.replicaset;
//
// var mongoose = require('mongoose');
// var connectionstring = '';
// if (util.isArray(mongoip)) {
//
//     mongoip.forEach(function (item) {
//         connectionstring += util.format('%s:%d,', item, mongoport)
//     });
//
//     connectionstring = connectionstring.substring(0, connectionstring.length - 1);
//     connectionstring = util.format('mongodb://%s:%s@%s/%s', mongouser, mongopass, connectionstring, mongodb);
//
//     if (mongoreplicaset) {
//         connectionstring = util.format('%s?replicaSet=%s', connectionstring, mongoreplicaset);
//     }
// } else {
//
//     connectionstring = util.format('mongodb://%s:%s@%s:%d/%s', mongouser, mongopass, mongoip, mongoport, mongodb)
// }
//
//
// mongoose.connect(connectionstring, { server: { auto_reconnect: true } });
//
//
// mongoose.connection.on('error', function (err) {
//     console.error(new Error(err));
//     mongoose.disconnect();
//
// });
//
// mongoose.connection.on('opening', function () {
//     console.log("reconnecting... %d", mongoose.connection.readyState);
// });
//
//
// mongoose.connection.on('disconnected', function () {
//     console.error(new Error('Could not connect to database'));
//     mongoose.connect(connectionstring, { server: { auto_reconnect: true } });
// });
//
// mongoose.connection.once('open', function () {
//     console.log("Connected to db");
//
// });
//
//
// mongoose.connection.on('reconnected', function () {
//     console.log('MongoDB reconnected!');
// });
//
//
//
// process.on('SIGINT', function () {
//     mongoose.connection.close(function () {
//         console.log('Mongoose default connection disconnected through app termination');
//         process.exit(0);
//     });
// });



// --------------------- HTTP listners -----------------------
var restify = require('restify');
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');

var server = restify.createServer({
    name: "DVP Facebook Sender Service"
});

server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({mapParams: false}));
server.use(restify.plugins.queryParser());
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(jwt({secret: secret.Secret}));

restify.CORS.ALLOW_HEADERS.push('authorization');

var config = require('config');

var emailService = require('./Services/mail');
var chatService = require('./Services/chat');


server.post('DVP/API/:version/Social/Email', authorization({
    resource: "social",
    action: "write"
}), emailService.CreateMailAccount);
server.get('DVP/API/:version/Social/Email', authorization({
    resource: "social",
    action: "read"
}), emailService.GetEmailAccount);
server.get('DVP/API/:version/Social/Emails', authorization({
    resource: "social",
    action: "read"
}), emailService.GetEmailAccounts);
server.del('DVP/API/:version/Social/Email/:id', authorization({
    resource: "social",
    action: "delete"
}), emailService.DeleteEmailAccount);
server.put('DVP/API/:version/Social/Email/:id', authorization({
    resource: "social",
    action: "write"
}), emailService.UpdateEmailAccount);

server.get('DVP/API/:version/Social/Emails/Report', authorization({
    resource: "social",
    action: "read"
}), emailService.GetEmailReport);

server.get('DVP/API/:version/Social/Chat/Conversation/:engagementId', authorization({
    resource: "social",
    action: "read"
}), chatService.getConverstation);

var port = config.Host.port || 3000;
server.listen(port, function () {
    logger.info("DVP-LiteTicket.main Server %s listening at %s", server.name, server.url);
});








