const axios = require('axios');
const { getAccessToken, callEndpoint, endpoints } = require('../lib/oauth2.js');
const { BLAZELB_URL } = require('../config.json');
const grade = require('../commands/grade.js');

const grades = {
    white: '936795111323484160',
    green: '936795237798539325',
    blue: '936795311408574555',
    purple: '936795441415225364',
    red: '936795536625913856',
    gold: '936795595123871754',
    cyan: '957801727900385340'
}

const MMP = "824696389970821133";


const getGrade = async (userData, tokenData = null) => {
    try {
        const currentGrade = userData.currentGrade;
        //User already cyan?
        if (currentGrade === grades.cyan) return grading(grades.cyan, "You humble me great sensei. You're already a master", false);

        const divisionThresholdsCall = await axios.get(`${BLAZELB_URL}/api/leaderboards/division_thresholds/current`);
        const blazeLBUserCall = await axios.get(`${BLAZELB_URL}/api/leaderboards/entries/${userData.steamID}`);

        if (!divisionThresholdsCall.status === 200) 
            throw new Error("Failed to get division thresholds from BlazeLB");
        if (!blazeLBUserCall.status === 200)
            throw new Error("Failed to get user from BlazeLB")
        
        const divThresholds = divisionThresholdsCall.data;
        const liveEntry = blazeLBUserCall.data.data.leaderboardEntries.find(entry => entry.seasonalData.isCurrentSeason === true);

        const score = liveEntry.score;

        if (!tokenData) tokenData = await getAccessToken(null, userData);
        const userGuilds = await callEndpoint(endpoints.guilds, tokenData);

        const userIsInRooftop = userGuilds.data.find(guild => guild.id === '798383083375951952') != undefined;
        if (userIsInRooftop) {
            const userGuildMemberCall = await callEndpoint(endpoints.rooftopMember, tokenData);

            if (userGuildMemberCall.data.roles.includes(MMP)) {
                return currentGrade !== grades.gold ? 
                    grading(grades.gold, "The council has spoken. ```ansi\nDice Sensei humbly present you with a \u001B[0;33mGold Belt```", true) : 
                    grading(grades.gold, "You must prove yourself in the tournament of champions to be granted the ultimate belt...", false);
            } else {
                return currentGrade !== grades.red ? 
                    grading(grades.red, "I see you have bested the gatekeepers and ascended to the rooftop.```ansi\nDice Sensei present you with a \u001B[0;31mRed Belt```", true) :
                    grading(grades.red, "You must face the council and be accepted as a champion to be granted the next belt...", false);
            }
        }

        if (score >= divThresholds.two) {
            return currentGrade !== grades.purple ? 
                grading(grades.purple, "Your so called equals are grasping at your feet as you climb to the top, but they can't reach you...\nThe gatekeepers await! ```ansi\nDice Sensei hands you a \u001B[0;35mPurple Belt```", true) :
                grading(grades.purple, "You have yet to open the gates to the rooftop. Best the gatekeepers and i shall grant you the next belt...", false);
        }
        else if (score >= divThresholds.four && score < divThresholds.two) {
            return currentGrade !== grades.purple ? 
                grading(grades.blue, "You have escaped the shackles of the everyday man. ```ansi\nDice Sensei hands you a \u001B[0;34mBlue Belt```" , true) :
                grading(grades.blue, "You must climb to second division to be granted the next belt", false);
        }
        else if (score >= divThresholds.six && score < divThresholds.four) {
            return currentGrade !== grades.purple ? 
                    grading(grades.green, "Your show immense growth. ```ansi\nDice Sensei hands you a \u001B[0;32mGreen Belt```", true) :
                    grading(grades.green, "You must climb to fourth division to be gratned the next belt", false);
        }
        else {
            return currentGrade ? 
                    grading(grades.white, "Welcome new student. Your path towards greatness starts here. Put this on and get ready for battle ```Dice Sensei hands you a White Belt```", true) :
                    grading(grades.white, "You must climb to sixth division to be gratned the next belt", false);
        }
    } catch (err) {
        console.error(err);
        return userData.currentGrade ? undefined : grades.white;
    }
}

const grading = (grade, message, isNewGrade) => {
    return {
        grade: grade,
        message: message,
        isNewGrade: isNewGrade
    }
}


module.exports = {
    getGrade
}