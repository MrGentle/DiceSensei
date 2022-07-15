const express = require('express');
const router = express.Router();

const { encrypt } = require('../lib/crypto.js');
const { getAccessToken, callEndpoint, endpoints } = require('../lib/oauth2.js');
const { getGrade } = require('../lib/grades.js');
const { getInteraction } = require('../lib/commands.js');

const { keyv } = require('../lib/keyv.js');

router.get('/authorize', async (req, res) => {
    const { code } = req.query;

    if (code) {
        try {
            const tokenData = await getAccessToken(code);

            const userInfo = await callEndpoint(endpoints.identify, tokenData);
            const userConnections = await callEndpoint(endpoints.connections, tokenData);

            const userData = {
                discordID: userInfo.data.id,
                steamID: userConnections.data.find(connection => connection.type === "steam").id,
                tokenData: encrypt(tokenData),
                tokenExpires: Date.now() + (tokenData.expires_in * 1000),
                currentGrade: undefined
            }

            const gradation = await getGrade(userData);
            if (gradation.isNewGrade) userData.currentGrade = gradation.grade;

            const interaction = getInteraction(userData.discordID);
            await interaction.followUp(gradation.message);
            removeInteraction(userData.discordID);
            
            keyv.set(userData.discordID, userData);
        } catch (ex) {
            console.error(ex);
        }
        res.send('Thank you for authorizing Dice Sensei, you can close this now');
    }
})

module.exports = router;