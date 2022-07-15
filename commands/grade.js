const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { GRANT_PERMISSIONS_URL } = require('../config.json');
const { keyv } = require('../lib/keyv.js');
const { getGrade, assignGrade } = require('../lib/grades');
const { storeInteraction } = require('../lib/commands.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('grade')
		.setDescription('Let Dice Sensei grade you'),
	async execute(interaction) {
        if (keyv) {
            let userData = await keyv.get(interaction.user.id);
            
            if (!userData) {
                storeInteraction(interaction);

                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel('Click to grant permissions')
                        .setStyle('LINK')
                        .setURL(GRANT_PERMISSIONS_URL)
                );

                await interaction.reply({ content: 'Dice Sensei needs permissions to continue', components: [row], ephemeral: true });
            } else {
                const grading = await getGrade(userData);
                if (grading.isNewGrade) {
                    assignGrade(interaction.member, userData, grading);
                } 
                await interaction.reply({ content: grading.message });
            }
        }
	}
};

