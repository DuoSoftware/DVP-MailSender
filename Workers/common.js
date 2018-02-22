var request = require("request");
var format = require("stringformat");
var validator = require('validator');
var config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var async = require('async');
var fs = require('fs');
var Attachment = require('dvp-mongomodels/model/Attachment').Attachment;


function AddToRequest(company, tenant,session_id, priority, otherInfo, attributes, cb){


    if (config.Services && config.Services.ardsServiceHost && config.Services.ardsServicePort && config.Services.ardsServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/ARDS/request", config.Services.ardsServiceHost, config.Services.ardsServiceVersion);
        if (validator.isIP(config.Services.ardsServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/ARDS/request", config.Services.ardsServiceHost, config.Services.ardsServicePort, config.Services.ardsServiceVersion);


        var data = {

            SessionId: session_id,
            RequestType: "SOCIAL",
            Priority: priority,
            ResourceCount: 1,
            OtherInfo: otherInfo,
            Attributes: attributes,
            RequestServerId: serverID,
            ServerType: serverType

        };


        request({
            method: "POST",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully registered");
                    return cb(true);
                } else {

                    logger.error("Registration Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Registration Failed "+excep);
                return cb(false);
            }

        });

    }

};

function CreateComment(channel, channeltype,company, tenant, engid, engagement, cb){

    //http://localhost:3636/DVP/API/1.0.0.0/TicketByEngagement/754236638146859008/Comment

    if (config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/TicketByEngagement/{2}/Comment", config.Services.ticketServiceHost, config.Services.ticketServiceVersion,engid);
        if (validator.isIP(config.Services.ticketServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/TicketByEngagement/{3}/Comment", config.Services.ticketServiceHost, config.Services.ticketServicePort,config.Services.ticketServiceVersion, engid);



        logger.debug("Enagagement is ",engagement);

        var data = {

            body: engagement.body,
            body_type: "text",
            type: channeltype,
            public: "public",
            channel: channel,
            channel_from: engagement.channel_from,
            engagement_session: engagement.engagement_id,
            author_external: engagement.profile_id


        };


        request({
            method: "PUT",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {


            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully registered");
                    return cb(true);
                } else {

                    logger.error("Registration Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Registration Failed "+excep);
                return cb(false);
            }

        });

    }

};

function CreateCommentWithAttachments(channel, channeltype,company, tenant, engid, engagement, attachments, cb){

    //http://localhost:3636/DVP/API/1.0.0.0/TicketByEngagement/754236638146859008/Comment

    if (config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/TicketByEngagement/{2}/Comment", config.Services.ticketServiceHost, config.Services.ticketServiceVersion,engid);
        if (validator.isIP(config.Services.ticketServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/TicketByEngagement/{3}/Comment", config.Services.ticketServiceHost, config.Services.ticketServicePort,config.Services.ticketServiceVersion, engid);



        logger.debug("Enagagement is ",engagement);

        var data = {

            body: engagement.body,
            body_type: "text",
            type: channeltype,
            public: "public",
            channel: channel,
            channel_from: engagement.channel_from,
            engagement_session: engagement.engagement_id,
            author_external: engagement.profile_id,
            attachments: attachments


        };


        request({
            method: "PUT",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {


            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully registered");
                    return cb(true);
                } else {

                    logger.error("Registration Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Registration Failed "+excep);
                return cb(false);
            }

        });

    }

};

function CreateCommentByReference(channel, channeltype,company, tenant, ref, engagement, cb){

    //http://localhost:3636/DVP/API/1.0.0.0/TicketByEngagement/754236638146859008/Comment

    if (config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/TicketByReference/{2}/Comment", config.Services.ticketServiceHost, config.Services.ticketServiceVersion,ref);
        if (validator.isIP(config.Services.ticketServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/TicketByReference/{3}/Comment", config.Services.ticketServiceHost, config.Services.ticketServicePort,config.Services.ticketServiceVersion, ref);



        logger.debug("Enagagement is ",engagement);

        var data = {

            body: engagement.body,
            body_type: "text",
            type: channeltype,
            public: "public",
            channel: channel,
            channel_from: engagement.channel_from,
            engagement_session: engagement.engagement_id,
            author_external: engagement.profile_id


        };


        request({
            method: "PUT",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {


            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully registered");
                    return cb(true);
                } else {

                    logger.error("Registration Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Registration Failed "+excep);
                return cb(false);
            }

        });

    }

};

function CreateCommentByReferenceWithAttachments(channel, channeltype,company, tenant, ref, engagement,attachments, cb){

    //http://localhost:3636/DVP/API/1.0.0.0/TicketByEngagement/754236638146859008/Comment

    if (config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/TicketByReference/{2}/Comment", config.Services.ticketServiceHost, config.Services.ticketServiceVersion,ref);
        if (validator.isIP(config.Services.ticketServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/TicketByReference/{3}/Comment", config.Services.ticketServiceHost, config.Services.ticketServicePort,config.Services.ticketServiceVersion, ref);



        logger.debug("Enagagement is ",engagement);

        var data = {

            body: engagement.body,
            body_type: "text",
            type: channeltype,
            public: "public",
            channel: channel,
            channel_from: engagement.channel_from,
            engagement_session: engagement.engagement_id,
            author_external: engagement.profile_id,
            attachmets: attachments


        };


        request({
            method: "PUT",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {


            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully registered");
                    return cb(true);
                } else {

                    logger.error("Registration Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Registration Failed "+excep);
                return cb(false);
            }

        });

    }

};

function CreateCommentByReferenceForUserWithAttachments(channel, channeltype,company, tenant, ref, from, body, user, attachments, cb){

    //http://localhost:3636/DVP/API/1.0.0.0/TicketByEngagement/754236638146859008/Comment

    if (config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/TicketByReference/{2}/Comment", config.Services.ticketServiceHost, config.Services.ticketServiceVersion,ref);
        if (validator.isIP(config.Services.ticketServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/TicketByReference/{3}/Comment", config.Services.ticketServiceHost, config.Services.ticketServicePort,config.Services.ticketServiceVersion, ref);



        //logger.debug("Enagagement is ",engagement);

        var data = {

            body: body,
            body_type: "text",
            type: channeltype,
            public: "internal",
            channel: channel,
            channel_from: from,
            author: user.id,
            attachments: attachments


        };


        request({
            method: "PUT",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully registered");
                    return cb(true);
                } else {

                    logger.error("Registration Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Registration Failed "+excep);
                return cb(false);
            }

        });

    }

};

function ChangeTicketStatusByUser(company, tenant, ref, user, status, cb){

    //http://localhost:3636/DVP/API/1.0.0.0/TicketByEngagement/754236638146859008/Comment

    if (config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/TicketByReference/{2}/StatusByUser", config.Services.ticketServiceHost, config.Services.ticketServiceVersion,ref);
        if (validator.isIP(config.Services.ticketServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/TicketByReference/{3}/StatusByUser", config.Services.ticketServiceHost, config.Services.ticketServicePort,config.Services.ticketServiceVersion, ref);



        //logger.debug("Enagagement is ",engagement);

        var data = {

            status: status,
            user: user._id

        };


        request({
            method: "PUT",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully update status");
                    return cb(true);
                } else {

                    logger.error("Update Status Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Update Status Failed "+excep);
                return cb(false);
            }

        });

    }

};

function CreateCommentByReferenceForUser(channel, channeltype,company, tenant, ref, from, body, user, cb){

    //http://localhost:3636/DVP/API/1.0.0.0/TicketByEngagement/754236638146859008/Comment

    if (config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion) {

        var url = format("http://{0}/DVP/API/{1}/TicketByReference/{2}/Comment", config.Services.ticketServiceHost, config.Services.ticketServiceVersion,ref);
        if (validator.isIP(config.Services.ticketServiceHost))
            url = format("http://{0}:{1}/DVP/API/{2}/TicketByReference/{3}/Comment", config.Services.ticketServiceHost, config.Services.ticketServicePort,config.Services.ticketServiceVersion, ref);



        //logger.debug("Enagagement is ",engagement);

        var data = {

            body: body,
            body_type: "text",
            type: channeltype,
            public: "internal",
            channel: channel,
            channel_from: from,
            author: user.id


        };


        request({
            method: "PUT",
            url: url,
            headers: {
                authorization: "Bearer " + config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: data
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200) {

                    logger.debug("Successfully registered");
                    return cb(true);
                } else {

                    logger.error("Registration Failed "+_error);
                    return cb(false);

                }
            }
            catch (excep) {

                logger.error("Registration Failed "+excep);
                return cb(false);
            }

        });

    }

};

function CreateEngagement(channel, company, tenant, from, to, direction, session, data,cb){

    if((config.Services && config.Services.interactionurl && config.Services.interactionport && config.Services.interactionversion)) {


        var engagementURL = format("http://{0}/DVP/API/{1}/EngagementSessionForProfile", config.Services.interactionurl, config.Services.interactionversion);
        if (validator.isIP(config.Services.interactionurl))
            engagementURL = format("http://{0}:{1}/DVP/API/{2}/EngagementSessionForProfile", config.Services.interactionurl, config.Services.interactionport, config.Services.interactionversion);

        var engagementData =  {
            engagement_id: session,
            channel: channel,
            direction: direction,
            channel_from:from,
            channel_to: to,
            body: data
        };

        logger.debug("Calling Engagement service URL %s", engagementURL);
        request({
            method: "POST",
            url: engagementURL,
            headers: {
                authorization: "bearer "+config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: engagementData
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200, _response.body && _response.body.IsSuccess) {

                    return cb(true,_response.body.Result);

                }else{

                    logger.error("There is an error in  create engagements for this session "+ session);
                    return cb(false,{});


                }
            }
            catch (excep) {

                return cb(false,{});

            }
        });
    }
};

function CreateTicket(channel,session,profile, company, tenant, type, subjecct, description, priority, tags, cb){

    if((config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion)) {


        var ticketURL = format("http://{0}/DVP/API/{1}/Ticket", config.Services.ticketServiceHost, config.Services.ticketServiceVersion);
        if (validator.isIP(config.Services.ticketServiceHost))
            ticketURL = format("http://{0}:{1}/DVP/API/{2}/Ticket", config.Services.ticketServiceHost, config.Services.ticketServicePort, config.Services.ticketServiceVersion);

        var ticketData =  {

            "type": type,
            "subject": subjecct,
            "reference": session,
            "description": description,
            "priority": priority,
            "status": "new",
            "requester":profile,
            "engagement_session": session,
            "channel": channel,
            "tags": tags,
        };



        logger.debug("Calling Ticket service URL %s", ticketURL);
        request({
            method: "POST",
            url: ticketURL,
            headers: {
                authorization: "bearer "+config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: ticketData
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200 && _response.body && _response.body.IsSuccess) {

                    return cb(true, _response.body.reference);

                }else{

                    logger.error("There is an error in  create ticket for this session "+ session);

                    return cb(false, "");


                }
            }
            catch (excep) {

                return cb(false, "");

            }
        });
    }
}

function CreateTicketWithAttachments(channel,session,profile, company, tenant, type, subjecct, description, priority, tags, attachments, cb){

    if((config.Services && config.Services.ticketServiceHost && config.Services.ticketServicePort && config.Services.ticketServiceVersion)) {


        var ticketURL = format("http://{0}/DVP/API/{1}/Ticket", config.Services.ticketServiceHost, config.Services.ticketServiceVersion);
        if (validator.isIP(config.Services.ticketServiceHost))
            ticketURL = format("http://{0}:{1}/DVP/API/{2}/Ticket", config.Services.ticketServiceHost, config.Services.ticketServicePort, config.Services.ticketServiceVersion);

        var ticketData =  {

            "type": type,
            "subject": subjecct,
            "reference": session,
            "description": description,
            "priority": priority,
            "status": "new",
            "requester":profile,
            "engagement_session": session,
            "channel": channel,
            "tags": tags,
            attachments: attachments
        };



        logger.debug("Calling Ticket service URL %s", ticketURL);
        request({
            method: "POST",
            url: ticketURL,
            headers: {
                authorization: "bearer "+config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: ticketData
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200 && _response.body && _response.body.IsSuccess) {

                    return cb(true, _response.body.reference);

                }else{

                    logger.error("There is an error in  create ticket for this session "+ session);

                    return cb(false, "");


                }
            }
            catch (excep) {

                return cb(false, "");

            }
        });
    }
}

function RegisterCronJob(company, tenant, time, id, cb){

    if((config.Services && config.Services.cronurl && config.Services.cronport && config.Services.cronversion)) {


        var cronURL = format("http://{0}/DVP/API/{1}/Cron", config.Services.cronurl, config.Services.cronversion);
        if (validator.isIP(config.Services.cronurl))
            cronURL = format("http://{0}:{1}/DVP/API/{2}/Cron", config.Services.cronurl, config.Services.cronport, config.Services.cronversion);


        var mainServer = format("http://{0}/DVP/API/{1}/Social/Twitter/{2}/directmessages", config.LBServer.ip, config.Host.version,id);

        if (validator.isIP(config.LBServer.ip))
            mainServer = format("http://{0}:{1}/DVP/API/{2}/Social/Twitter/{3}/directmessages", config.LBServer.ip, config.LBServer.port, config.Host.version,id);



        var engagementData =  {

            Reference: id,
            Description: "Direct message twitter",
            CronePattern: format( "*/{0} * * * * *",time),
            CallbackURL: mainServer,
            CallbackData: ""

        };

        logger.debug("Calling cron registration service URL %s", cronURL);
        request({
            method: "POST",
            url: cronURL,
            headers: {
                authorization: "bearer "+config.Services.accessToken,
                companyinfo: format("{0}:{1}", tenant, company)
            },
            json: engagementData
        }, function (_error, _response, datax) {

            try {

                if (!_error && _response && _response.statusCode == 200, _response.body && _response.body.IsSuccess) {

                    return cb(true,_response.body.Result);

                }else{

                    logger.error("There is an error in  cron registration for this");
                    return cb(false,{});


                }
            }
            catch (excep) {

                return cb(false,{});

            }
        });
    }

};

function UploadAttachments(session_id, attachments, tenant, company, callback ){

    if(config.Services && config.Services.uploadurl  && config.Services.uploadport) {


        var urloadurl = format("http://{0}/DVP/API/{1}/FileService/File/Upload", config.Services.uploadurl, config.Services.uploadurlVersion);


        if (validator.isIP(config.Services.uploadurl))
            urloadurl = format("http://{0}:{1}/DVP/API/{2}/FileService/File/Upload", config.Services.uploadurl, config.Services.uploadport, config.Services.uploadurlVersion);


        logger.debug("File Upload to " + urloadurl);

        if(attachments && attachments.length > 0) {

            var calls = [];

            attachments.forEach(function (att) {
                calls.push(function (callback) {


                        var contentArray = att.contentType.split('/');
                        var mediatype = "text";
                        var filetype = "plain";
                        if (contentArray.length > 1) {
                            mediatype = contentArray[0];
                            filetype = contentArray[1];

                        }

                        var FormData = {
                            sessionid: session_id,
                            file: fs.createReadStream(att["path"]),
                            //att.stream.toString('base64'),
                            filename: att.fileName,
                            display: att.fileName,
                            class: "EMAILSERVER",
                            type: "EMAIL",
                            category: "VOICEMAIL",
                            referenceid: att.contentId,
                            mediatype: mediatype,
                            filetype: filetype
                        }


                        var r = request.post({
                            url: urloadurl,
                            formData: FormData,
                            headers: {
                                'authorization': "bearer " + config.Services.accessToken,
                                'companyinfo': format("{0}:{1}", tenant, company)
                            }
                        }, function (error, response, body) {
                            if (error) {

                                callback(error);

                            } else {


                                if (response) {

                                    logger.debug("Response recived", response.body);
                                    response.body = JSON.parse(response.body);
                                    logger.debug("Response recived", response.body["IsSuccess"]);
                                    if (response.body["IsSuccess"] && response.body["Result"]) {

                                        var attachment = Attachment({
                                            file: att.fileName,
                                            url: response.body["Result"],
                                            type: att.contentType,
                                            size: att.length
                                        });
                                        attachment.save(function (err, obj) {
                                            if (err) {

                                                callback(err);

                                            } else {

                                                if (obj && obj._id) {

                                                    callback(null, obj._id);

                                                } else {
                                                    callback(new Error("Error in save"));
                                                }
                                            }
                                        });

                                    } else {

                                        callback(new Error("Error in save"));
                                    }
                                } else {
                                    callback(new Error("Error in save"));
                                }
                            }
                        });

                    }
                )
            });

            async.parallel(calls, function (err, result) {

                if (err)
                    return console.log(err);
                console.log(result);

                callback(result);
            });
        }else{

            callback([]);
        }


    }
}




module.exports.AddToRequest = AddToRequest;
module.exports.CreateComment = CreateComment;
module.exports.CreateEngagement = CreateEngagement;
module.exports.CreateTicket = CreateTicket;
module.exports.RegisterCronJob = RegisterCronJob;
module.exports.CreateCommentByReference = CreateCommentByReference;
module.exports.CreateCommentByReferenceForUser = CreateCommentByReferenceForUser;
module.exports.CreateCommentByReferenceForUserWithAttachments = CreateCommentByReferenceForUserWithAttachments;
module.exports.CreateCommentByReferenceWithAttachments = CreateCommentByReferenceWithAttachments;
module.exports.CreateTicketWithAttachments = CreateTicketWithAttachments;
module.exports.CreateCommentWithAttachments = CreateCommentWithAttachments;
module.exports.ChangeTicketStatusByUser = ChangeTicketStatusByUser;



module.exports.UploadAttachments = UploadAttachments;
