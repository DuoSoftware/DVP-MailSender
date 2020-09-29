module.exports = {
  EmailSendMethod: "smpt", // smpt, mandrill

  DB: {
    Type: "postgres",
    User: "",
    Password: "",
    Port: 5432,
    Host: "",
    Database: ""
  },

  Redis: {
    mode: "instance", //instance, cluster, sentinel
    ip: "",
    port: 6389,
    user: "",
    password: "",
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster"
    }
  },

  Security: {
    ip: "",
    port: 6389,
    user: "",
    password: "",
    mode: "instance", //instance, cluster, sentinel
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster"
    }
  },

  Host: {
    ServerType: "SOCIALMEDIACONNECTOR",
    CallbackOption: "GET",
    RequestType: "CALL",
    ServerID: 2,
    resource: "cluster",
    vdomain: "localhost",
    domain: "localhost",
    port: "4648",
    emailQueueName: "EMAILOUT",
    smsQueueName: "SMSOUT",
    defaultMailHost: "facetone.com",
    version: "1.0",
    smtpsender: true,
    smssender: true,
    encryptedhex: "1, 12, 3, 4, 5, 16, 7, 8, 12, 10, 11, 12, 13, 14, 15, 16" // accept only 1-16
  },

  SMSServer: {
    ip: "159.203.109.43",
    port: "1401",
    password: "",
    user: ""
  },

  LBServer: {
    ip: "192.168.0.123",
    port: "4647"
  },

  SMTP: {
    ip: "smtp.mandrillapp.com",
    port: "2525",
    user: "",
    password: ""
  },

  MANDRILL: {
    mandrillAPIKey: ""
  },

  RabbitMQ: {
    ip: "",
    port: 5672,
    user: "",
    password: "",
    vhost: "/"
  },

  Mongo: {
    ip: "",
    port: "",
    dbname: "",
    password: "",
    user: "",
    type: "mongodb"
  },

  IMAP: {
    username: "",
    password: "",
    host: "",
    port: 993,
    secure: true,
    mailbox: "INBOX",
    seen: true,
    company: 103,
    tenant: 1,
    fetch: true
  },

  Services: {
    accessToken:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo",

    resourceServiceHost: "resourceservice.104.131.67.21.xip.io",
    resourceServicePort: "8831",
    resourceServiceVersion: "1.0.0.0",

    interactionurl: "interactions.app.veery.cloud",
    interactionport: "3637",
    interactionversion: "1.0.0.0",

    cronurl: "192.168.0.27",
    cronport: "8080",
    cronversion: "1.0.0.0",

    ticketServiceHost: "liteticket.app.veery.cloud", //liteticket.app.veery.cloud
    ticketServicePort: "3636",
    ticketServiceVersion: "1.0.0.0",

    ardsServiceHost: "ardsliteservice.104.131.67.21.xip.io",
    ardsServicePort: "8831",
    ardsServiceVersion: "1.0.0.0",

    mailReceiverHost: "mailreceiver.app.veery.cloud",
    mailReceiverPort: "0000",
    mailReceiverVersion: "1.0.0.0",

    uploadurl: "fileservice.app.veery.cloud",
    uploadport: "8888",
    uploadurlVersion: "1.0.0.0"
  }
};
