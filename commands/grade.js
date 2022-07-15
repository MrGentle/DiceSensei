const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { GRANT_PERMISSIONS_URL } = require('../config.json');
const { keyv } = require('../lib/keyv.js');
const { getGrade } = require('../lib/grades');
const { storeInteraction } = require('../lib/commands.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('grade')
		.setDescription('Let Dice Sensei grade you')
        .addStringOption(option =>
            option
                .setName('top10')
                .setDescription('Assign the Cyan belts')
                .setRequired(false)
                .addChoices(
                    { name: 'Grade', value: 'grade' },
                    { name: 'Degrade', value: 'degrade' }
                )
        ),
	async execute(interaction) {
        if (keyv) {
            let userData = await keyv.get(interaction.user.id);
            
            if (!userData) {
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel('Click to grant permissions')
                        .setStyle('LINK')
                        .setURL(GRANT_PERMISSIONS_URL)
                );

                storeInteraction(interaction);
                await interaction.reply({ content: 'Dice Sensei needs permissions to continue', components: [row], ephemeral: true });
            } else {
                const grade = await getGrade(userData);
                if (grade.isNewGrade) {
                    userData.currentGrade = grade.grade;
                    keyv.set(userData.discordID, userData);
                } else {
                    await interaction.reply({ content: grade.message });
                }
            }
        }
	}
};

