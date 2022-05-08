const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, Message } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    async execute(interaction) {
        const button = new MessageButton()
        .setCustomId('primary')
        .setLabel('Primary')
        .setStyle('PRIMARY')
        await interaction.reply({ content: 'pong!', components: [new MessageActionRow().addComponents(button)], ephemeral: true });
        const filter = i => i.customId === 'primary' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'primary') {
                await i.update({ content: 'A button was clicked!', components: [new MessageActionRow().addComponents(button.setDisabled(true))], ephemeral: true });
            }
        });

        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }
}