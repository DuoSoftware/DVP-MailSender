#FROM ubuntu
#RUN apt-get update
#RUN apt-get install -y git nodejs npm nodejs-legacy
#RUN git clone git:////github.com/DuoSoftware/DVP-MailReceiver.git /usr/local/src/mailreceiver
#RUN cd /usr/local/src/mailreceiver; npm install
#CMD ["nodejs", "/usr/local/src/mailreceiver/app.js"]

#EXPOSE 8872

FROM node:9.9.0
ARG VERSION_TAG
RUN git clone -b $VERSION_TAG https://github.com/DuoSoftware/DVP-MailSender.git /usr/local/src/mailsender
RUN cd /usr/local/src/mailsender;
WORKDIR /usr/local/src/mailsender
RUN npm install
EXPOSE 8878
CMD [ "node", "/usr/local/src/mailsender/app.js" ]
