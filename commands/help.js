const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, Message } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help Command'),
    async execute(interaction) { 

        const general = new MessageButton()
        .setCustomId('general')
        .setLabel('General')
        .setStyle('PRIMARY')
        
        const utility = new MessageButton()
        .setCustomId('utility')
        .setLabel('Utility')
        .setStyle('PRIMARY')

        const game = new MessageButton()
        .setCustomId('game')
        .setLabel('Game')
        .setStyle('PRIMARY')

        const back = new MessageButton()
        .setCustomId('back')
        .setLabel('Back')
        .setStyle('PRIMARY')

        const categoriesEmbed = new MessageEmbed()
            .setTitle('Wordle Bot - Categories')
            .setColor(0x00AE86)
            .setDescription(`\`General\`\n\`Utility\`\n\`Game\``)
            .setFooter({ text: `Categories` })

        const generalEmbed = new MessageEmbed()
            .setTitle('Wordle Bot - General')
            .setColor(0x00AE86)
            .setDescription(`\`info\`\n\`ping\`\n\`embed\``)
            .setFooter({ text: `General` })

        const utilityEmbed = new MessageEmbed()
            .setTitle('Wordle Bot - Utility')
            .setColor(0x00AE86)
            .setDescription(`\`help\`\n\`ping\`\n\`embed\``)
            .setFooter({ text: `Utility` })
        
        const gameEmbed = new MessageEmbed()
            .setTitle('Wordle Bot - Game')
            .setColor(0x00AE86)
            .setDescription(`\`wordle\`\n\`wordle-start\`\n\`wordle-stop\``)
            .setFooter({ text: `Game` })
        
        await interaction.reply({ embeds: [ categoriesEmbed ], components: [new MessageActionRow().addComponents(general, utility, game)], ephemeral: true });

        const filter = i => i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 4000 });

        collector.on('collect', async i => {
            if (i.customId === 'general') {
                await i.update({ embeds: [ generalEmbed ], components: [new MessageActionRow().addComponents(back)], ephemeral: true });
            }
            if (i.customId === 'utility') {
                await i.update({ embeds: [ utilityEmbed ], components: [new MessageActionRow().addComponents(back)], ephemeral: true });
            }
            if (i.customId === 'game') {
                await i.update({ embeds: [ gameEmbed ], components: [new MessageActionRow().addComponents(back)], ephemeral: true });
            }
            if (i.customId === 'back') {
                await i.update({ embeds: [ categoriesEmbed ], components: [new MessageActionRow().addComponents(general, utility, game)], ephemeral: true });
            }
        });

        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} items`);
            //after timeout update message
            //update({ content: 'Done!', embeds: [], components: [], ephemeral: true });
        });

    }
}