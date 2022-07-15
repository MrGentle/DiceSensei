const { MONGODB_URI } = require('../config.json');
const Keyv = require('keyv');
const keyv = new Keyv(MONGODB_URI);

const crypto = require('crypto');


const storeUserData = (userData) => {

}

module.exports = {
    keyv
}