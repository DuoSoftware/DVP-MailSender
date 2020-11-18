module.exports = {
  EmailSendMethod: "SYS_EMAILSENDMETHOD",

  DB: {
    Type: "SYS_DATABASE_TYPE",
    User: "SYS_DATABASE_POSTGRES_USER",
    Password: "SYS_DATABASE_POSTGRES_PASSWORD",
    Port: "SYS_SQL_PORT",
    Host: "SYS_DATABASE_HOST",
    Database: "SYS_DATABASE_NAME"
  },

  Redis: {
    mode: "SYS_REDIS_MODE",
    ip: "SYS_REDIS_HOST",
    port: "SYS_REDIS_PORT",
    user: "SYS_REDIS_USER",
    password: "SYS_REDIS_PASSWORD",
    sentinels: {
      hosts: "SYS_REDIS_SENTINEL_HOSTS",
      port: "SYS_REDIS_SENTINEL_PORT",
      name: "SYS_REDIS_SENTINEL_NAME"
    }
  },

  Security: {
    ip: "SYS_REDIS_HOST",
    port: "SYS_REDIS_PORT",
    user: "SYS_REDIS_USER",
    password: "SYS_REDIS_PASSWORD",
    mode: "SYS_REDIS_MODE",
    sentinels: {
      hosts: "SYS_REDIS_SENTINEL_HOSTS",
      port: "SYS_REDIS_SENTINEL_PORT",
      name: "SYS_REDIS_SENTINEL_NAME"
    }
  },

  Mongo: {
    ip: "SYS_MONGO_HOST",
    port: "SYS_MONGO_PORT",
    dbname: "SYS_MONGO_DB",
    password: "SYS_MONGO_PASSWORD",
    user: "SYS_MONGO_USER"
  },

  RabbitMQ: {
    ip: "SYS_RABBITMQ_HOST",
    port: "SYS_RABBITMQ_PORT",
    user: "SYS_RABBITMQ_USER",
    password: "SYS_RABBITMQ_PASSWORD",
    vhost: "SYS_RABBITMQ_VHOST"
  },

  Host: {
    vdomain: "LB_FRONTEND",
    domain: "HOST_NAME",
    port: "HOST_MAILSENDER_PORT",
    version: "HOST_VERSION",
    smtplistner: "HOST_ENABLE_SMTPLISTNER",
    smtpsender: "HOST_ENABLE_SMTPSENDER",
    smssender: "HOST_ENABLE_SMSSENDER",
    imaplistner: "HOST_ENABLE_IMAPLISTNER",
    defaultMailHost: "HOST_DEFAULT_MAIL_HOST",
    emailQueueName: "HOST_EMAIL_QUEUE_NAME",
    smsQueueName: "HOST_SMS_QUEUE_NAME"
  },

  SMSServer: {
    ip: "SYS_SMSSERVER_HOST",
    port: "SYS_SMSSERVER_PORT",
    password: "SYS_SMSSERVER_PASSWORD",
    user: "SYS_SMSSERVER_USER"
  },

  LBServer: {
    ip: "LB_FRONTEND",
    port: "LB_PORT"
  },

  IMAP: {
    username: "IMAP_USER_NAME",
    password: "IMAP_PASSWORD",
    host: "IMAP_HOST",
    port: "IMAP_PORT",
    secure: "IMAP_SECURITY",
    mailbox: "IMAP_MAILBOX",
    seen: "IMAP_SEEN",
    company: "IMAP_COMPANY",
    tenant: "IMAP_TENAT",
    fetch: "IMAP_FETCH"
  },

  SMTP: {
    ip: "SYS_SMTP_HOST",
    port: "SYS_SMTP_PORT",
    user: "SYS_SMTP_USER_NAME",
    password: "SYS_SMTP_PASSWORD"
  },

  MANDRILL: {
    mandrillAPIKey: "SYS_MANDRILLAPIKEY"
  },

  Services: {
    accessToken: "HOST_TOKEN",
    resourceServiceHost: "SYS_RESOURCESERVICE_HOST",
    resourceServicePort: "SYS_RESOURCESERVICE_PORT",
    resourceServiceVersion: "SYS_RESOURCESERVICE_VERSION",

    uploadurl: "SYS_FILESERVICE_HOST",
    uploadport: "SYS_FILESERVICE_PORT",
    uploadurlVersion: "SYS_FILESERVICE_VERSION",

    interactionurl: "SYS_INTERACTIONS_HOST",
    interactionport: "SYS_INTERACTIONS_PORT",
    interactionversion: "SYS_INTERACTIONS_VERSION",

    cronurl: "SYS_SCHEDULEWORKER_HOST",
    cronport: "SYS_SCHEDULEWORKER_PORT",
    cronversion: "SYS_SCHEDULEWORKER_VERSION",

    mailReceiverHost: "SYS_MAILRECEIVER_HOST",
    mailReceiverPort: "SYS_MAILRECEIVER_PORT",
    mailReceiverVersion: "SYS_MAILRECEIVER_VERSION",

    ticketServiceHost: "SYS_LITETICKET_HOST",
    ticketServicePort: "SYS_LITETICKET_PORT",
    ticketServiceVersion: "SYS_LITETICKET_VERSION",

    ardsServiceHost: "SYS_ARDSLITESERVICE_HOST",
    ardsServicePort: "SYS_ARDSLITESERVICE_PORT",
    ardsServiceVersion: "SYS_ARDSLITESERVICE_VERSION"
  }
};

//NODE_CONFIG_DIR
