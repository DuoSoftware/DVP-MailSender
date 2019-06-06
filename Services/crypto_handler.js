var config = require("config");
var aesjs = require('aes-js');

var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];

function setKeys(){
    try{
        var ids = config.Host.encryptedhex;
        if(ids){
            var key_string_arr = ids.split(",");
            key = key_string_arr.map(function(item){
                return parseInt(item);
            });
        }
        console.log("Set Key ------------------------------");
    }
    catch(ex){
        console.error(ex);
    }

}
setKeys();

function encrypt(text) {
    try {
        console.info("Call Encrypt Method..................");
        var textBytes = aesjs.utils.utf8.toBytes(text);

// The counter is optional, and if omitted will begin at 1
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var encryptedBytes = aesCtr.encrypt(textBytes);

// To print or store the binary data, you may convert it to hex
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        return encryptedHex;
    } catch (ex) {
        console.error(ex);
        return text;
    }
}


function decrypt(encryptedHex) {
    try {
        console.info("Call Decrypt Method..................");
        console.info(encryptedHex);
        var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

// The counter mode of operation maintains internal state, so to
// decrypt a new instance must be instantiated.
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var decryptedBytes = aesCtr.decrypt(encryptedBytes);

// Convert our bytes back into text
        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        return decryptedText;
    }
    catch (ex) {
        console.error(ex);
        return encryptedHex;
    }
}
module.exports.Encrypt = encrypt;
module.exports.Decrypt = decrypt;