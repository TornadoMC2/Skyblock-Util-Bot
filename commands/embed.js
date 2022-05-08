const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('embed test')
        .addStringOption(option => option.setName('title').setDescription('title of embed')),
    async execute(interaction) { 
        const embed = new MessageEmbed()
            .setTitle('embed test')
            .setColor(0x00AE86)
            .setDescription('This is a test embed')
        await interaction.reply({ embeds: [ embed ] });
    }
}