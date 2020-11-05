var format = require("stringformat");
var uuid = require("node-uuid");
var Template = require("./Model/Template").Template;
var dust = require("dustjs-linkedin");
var juice = require("juice");
var logger = require("dvp-common-lite/LogHandler/CommonLogHandler.js").logger;
var util = require("util");
var SMPTTansporter = require("./Workers/SMPTConnector").transporter;
var config = require("config");
let mailHost = config.Host.defaultMailHost;

function sendMail(data, org, email) {
  console.log("------------------------ SendMail SMPT----------------------");
  console.log(data);
  return new Promise(function(resolve, reject) {
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

    mailOptions.from = mailHost ? format("{0}@{1}", data.message.from, mailHost) : data.message.from;
    mailOptions.replyTo = format(
      "{0}@{1}.{2}",
      data.message.from,
      org.companyName,
      mailHost
    );

    if (email && email.fromOverwrite) {
      mailOptions.from = email.fromOverwrite;
      mailOptions.replyTo = email.fromOverwrite;
      console.log("Overwrite Sender ............");
    }

    if (email && email.replytoOverwrite) {
      mailOptions.replyTo = email.replytoOverwrite;
    }

    var attachments = [];

    if (data.message.attachments && util.isArray(data.message.attachments)) {
      data.message.attachments.forEach(function(item) {
        if (item.url && item.name) {
          attachments.push({
            // use URL as an attachment
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
      Template.findOne(
        {
          name: data.message.template,
          company: data.message.company,
          tenant: data.message.tenant
        },
        function(errPickTemplate, resPickTemp) {
          if (!errPickTemplate) {
            if (
              resPickTemp &&
              resPickTemp.content &&
              resPickTemp.content.content
            ) {
              var compileid = uuid.v4();

              var compiled = dust.compile(
                resPickTemp.content.content,
                compileid
              );
              dust.loadSource(compiled);
              dust.render(compileid, data.message.Parameters, function(
                errRendered,
                outRendered
              ) {
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
                      logger.info(
                        "Rendering is success " + resPickTemp.styles[i].content
                      );

                      renderedTemplate = juice.inlineContent(
                        renderedTemplate,
                        resPickTemp.styles[i].content,
                        juiceOptions
                      );
                      if (i == resPickTemp.styles.length - 1) {
                        if (resPickTemp.filetype.toLowerCase() == "html") {
                          mailOptions.html = renderedTemplate;
                        } else {
                          mailOptions.text = renderedTemplate;
                        }
                      }
                    }
                  } else {
                    console.log("Rendering Done");

                    if (resPickTemp.filetype.toLowerCase() == "html") {
                      mailOptions.html = outRendered;
                    } else {
                      mailOptions.text = outRendered;
                    }

                    //SendMail(mailOptions, data);
                  }

                  if (resPickTemp.content.subject) {
                    var compilesubid = uuid.v4();
                    var compiledsub = dust.compile(
                      resPickTemp.content.subject,
                      compilesubid
                    );
                    dust.loadSource(compiledsub);
                    dust.render(compilesubid, data.message.Parameters, function(
                      errsubRendered,
                      outsubRendered
                    ) {
                      mailOptions.subject = outsubRendered;
                      SMPTTansporter.sendMail(mailOptions, function(err, info) {
                        if (err) {
                          reject(err);
                        } else {
                          info.mailDetails = {
                            from_email: mailOptions.from,
                            to_email: mailOptions.to,
                            engagement: mailOptions.engagement,
                            company: org.id,
                            tenant: org.tenant,
                            messageId: info.messageId,
                            subject: data.message.subject
                          };
                          resolve(info);
                        }
                      });
                    });
                  } else {
                    SMPTTansporter.sendMail(mailOptions, function(err, info) {
                      if (err) {
                        reject(err);
                      } else {
                        info.mailDetails = {
                          from_email: mailOptions.from,
                          to_email: mailOptions.to,
                          engagement: mailOptions.engagement,
                          company: org.id,
                          tenant: org.tenant,
                          messageId: info.messageId,
                          subject: data.message.subject
                        };
                        resolve(info);
                      }
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
        }
      );
    } else {
      SMPTTansporter.sendMail(mailOptions, function(err, info) {
        if (err) {
          reject(err);
        } else {
          info.mailDetails = {
            from_email: mailOptions.from,
            to_email: mailOptions.to,
            engagement: mailOptions.engagement,
            company: org.id,
            tenant: org.tenant,
            messageId: info.messageId,
            subject: data.message.subject
          };
          resolve(info);
        }
      });
    }
  });
}

module.exports.sendMail = sendMail;
