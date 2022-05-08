const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const axios = require('axios')
const { key } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('User statistics')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username of the user to get stats for')
                .setRequired(true)
        ),
    async execute(interaction) { 
        
        const username = interaction.options.getString('username');

        var uuid;
        await axios.get(`https://api.minetools.eu/uuid/${username}`)
        .then(response => {
            uuid = response.data.id;
        })
        .catch(error => {
            console.log(error)
            return interaction.reply('User not found');
        });

        var data;
        await axios.get(`https://api.hypixel.net/skyblock/profiles?key=${key}&uuid=${uuid}`)
        .then(response => {
            data = response.data
        })
        .catch(error => {
            console.log(error);
            return interaction.reply('User not found');
        });

        var profiles = data.profiles;

        profiles.filter(profile => profile.hasOwnProperty('last_save'))

        console.log(profiles);

        await interaction.reply(data.profiles[0].cute_name);

    }
}