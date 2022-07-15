const { Client, Collection, Intents } = require('discord.js');
const express = require('express');

const { InitCommands, UpdateCommands } = require('./lib/commands.js')

const { BOT_TOKEN, CALLBACK_PORT} = require('./config.json');


//Initialize Dice Sensei
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
client.commands = InitCommands();

client.once('ready', () => { console.log('Let\'s roll!'); });

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


//Initialize express and listen for callbacks
const expressClient = express();
const authorizationRoutes = require('./routes/authorize.js');

expressClient.use('/', authorizationRoutes);
expressClient.listen(CALLBACK_PORT, () => {
    console.log(`Listening for callbacks on port ${CALLBACK_PORT}`)
})

client.login(BOT_TOKEN);