const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Gets info of a specific type')
        .addSubcommand(subcommand => 
            subcommand
                .setName('user')
                .setDescription('Gets info of a specific user')
                .addUserOption(option => option.setName('target').setDescription('The user').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('guild')
                .setDescription('Gets info on the server')
        ),
    async execute(interaction) { 
        if(interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('target');
            await interaction.reply({ content: `User tag: ${user.tag}\nUser ID: ${user.id}`, ephemeral: true });
        }
        else if(interaction.options.getSubcommand() === 'guild') {
            const guild = interaction.message.guild;
            await interaction.reply({ content: `Guild name: ${guild.name}\nGuild ID: ${guild.id}`, ephemeral: true });
        }
    }
}