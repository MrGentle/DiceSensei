const axios = require('axios');
const { encrypt, decrypt } = require('./crypto.js');

const { CLIENT_ID, CLIENT_SECRET, OAUTH2_SCOPE } = require('../config.json');
const { keyv } = require('./keyv.js');

const baseURL = 'https://discord.com/api/';
const endpoints = {
    identify: 'users/@me',
    connections: 'users/@me/connections',
    guilds: 'users/@me/guilds',
    rooftopMember: '/users/@me/guilds/798383083375951952/member'
}

const getAccessToken = async (authorizationCode, userData = null) => {
    let tokenData = null;

    if (userData) {
        tokenData = decrypt(userData.tokenData);
        if (Date.now() < userData.tokenExpires) return decrypt(userData.tokenData);
        console.log("Access token invalid, fetching new");
    }

    
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
        new URLSearchParams(tokenData ? {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: tokenData.refreshToken
        } : {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: authorizationCode,
            grant_type: 'authorization_code',
            redirect_uri: `http://localhost:3001/authorize`,
            scope: OAUTH2_SCOPE
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    );

    if (userData) {
        userData.tokenData = encrypt(tokenResponse.data);
        userData.tokenExpires = Date.now() + (tokenResponse.data.expires_in * 1000),
        keyv.set(userData.discordID, userData);
    }

    return tokenResponse.data;
}

const callEndpoint = async (endpoint, tokenData) => {
    console.log(`${baseURL + endpoint}`);
    const endpointData = await axios.get(`${baseURL + endpoint}`, {
        headers: {
            authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        }
    });

    return endpointData;
}


module.exports = {
    getAccessToken,
    callEndpoint,
    endpoints
}