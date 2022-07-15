const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const path = require('node:path');
const { CLIENT_ID, STADIUM_GUILD_ID, BOT_TOKEN } = require('../config.json');

const commands = new Collection();
const storedInteractions = new Map();

const InitCommands = (update = false) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        commands.set(command.data.name, command);
    }

    UpdateCommands();
    return commands;
}


const UpdateCommands = () => {
    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

    rest.put(Routes.applicationGuildCommands(CLIENT_ID, STADIUM_GUILD_ID), { body: commands.map(command => command.data.toJSON()) })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}

const storeInteraction = (interaction) => {
    console.log(interaction);
    storedInteractions.set(interaction.user.id, interaction);
}

const getInteraction = (userid) => {
    console.log(userid);
    return storedInteractions.get(userid);
}

const removeInteraction = (userid) => {
    storedInteractions.delete(userid);
}

module.exports = {
    InitCommands,
    UpdateCommands,
    storeInteraction,
    getInteraction,
    removeInteraction
}