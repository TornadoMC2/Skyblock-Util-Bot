const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const axios = require('axios')
const QuickChart = require('quickchart-js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordle')
        .setDescription('Base wordle bot command')
        .addSubcommand(subcommand => 
            subcommand
                .setName('start')
                .setDescription('Starts a random wordle')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('guess')
                .setDescription('Lets you submit a word to guess')
                .addStringOption(option => option.setName('word').setDescription('The word to guess').setRequired(true))
        ),

    async execute(interaction) {

        if(interaction.options.getSubcommand() === "start") {
            let wordleEmbed = new MessageEmbed() 
            .setTitle('Wordle')
            .setColor(0x00AE86)
            .setDescription(`⬛ ⬛ ⬛ ⬛ ⬛\n⬛ ⬛ ⬛ ⬛ ⬛\n⬛ ⬛ ⬛ ⬛ ⬛\n⬛ ⬛ ⬛ ⬛ ⬛\n⬛ ⬛ ⬛ ⬛ ⬛\n⬛ ⬛ ⬛ ⬛ ⬛`)

            await interaction.reply({ embeds: [ wordleEmbed ], ephemeral: true });
        }

        if(interaction.options.getSubcommand() === "guess") {
            
            var data;

            await axios
            .get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly')
            .then(response => {
                console.log(`statusCode: ${response.statusCode}`)
                data = response.data;
                console.log(data);
            })
            .catch(error => {
                console.error(error)
            })

            const chart = new QuickChart();
            await chart
            .setConfig({
                type: 'line',
                data: {
                    labels: data.prices.map(price => {
                        let date = new Date(price[0])
                        return `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() > 12 ? 'PM' : 'AM'}`
                    }),
                    datasets: [{ label: 'Price', data: data.prices.map(price => Math.round((price[1] + Number.EPSILON) * 100) / 100) }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Bitcoin Price - Last 24 Hours'
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                //set min to smallest price in dataset rounded down to nearest 10000
                                min: Math.floor(Math.min(...data.prices.map(price => price[1])) / 10000) * 10000,
                                //set max to largest price in dataset rounded up to nearest 1000
                                max: Math.ceil(Math.max(...data.prices.map(price => price[1])) / 1000) * 1000,
                                //set step size to 1000 or 2000 depending on range
                                stepSize: 1000
                            }
                        }]
                    }
                }
            })
            .setWidth(1000)
            .setHeight(500)
            .setBackgroundColor('White');

            //console.log(chart.getUrl());

            let cryptoPriceEmbed = new MessageEmbed()
            .setTitle('Crypto Price - Bitcoin')
            .setColor(0x00AE86)
            .setDescription(`Price Over Last 24 Hours\nLast Updated: ${new Date(data.prices[data.prices.length - 1][0]).toLocaleString()}`)
            .setImage(chart.getUrl())

            await interaction.reply({ embeds: [ cryptoPriceEmbed ] });

        }


    }
}