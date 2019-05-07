const uuid = require('node-uuid');
const mandrill = require('mandrill-api/mandrill');
let mandrill_client;


mandrill_client = new mandrill.Mandrill('');


module.exports.MandrillHandler = class MandrillHandler {

    addDomain(domain) {
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
    }

    createSubAccount(company, tenant) {
        return new Promise(function (resolve, reject) {
            var uid = uuid.v4();

            mandrill_client.subaccounts.add({
                "id": uid,
                "name": company + ':' + tenant,
                "custom_quota": 40
            }, function (result) {
                resolve(result)
            }, function (e) {
                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                reject(e)
            })

        })
    }

    whitelistEmail(email, company, tenant) {
        return new Promise(function (resolve, reject) {
            mandrill_client.whitelists.add({"email": email, "comment": company + ":" + tenant}, function (res) {
                resolve(res)
            }, function (err) {
                reject(err)
            })
        })
    }

};