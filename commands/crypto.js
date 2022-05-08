const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const axios = require('axios');
const QuickChart = require('quickchart-js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Base command for crypto related commands')
        .addSubcommand(subcommand => 
            subcommand
                .setName('price')
                .setDescription('Gets the price of a specific crypto')
                .addStringOption(option =>
                    option.setName('currency')
                        .setDescription('The crypto to get the price of')
                        .setRequired(true)
                        .addChoice('Bitcoin', 'bitcoin')
                        .addChoice('Ethereum', 'ethereum')
                        .addChoice('Litecoin', 'litecoin')
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('price_graph')
                .setDescription('Gets the price of a specific crypto')
                .addStringOption(option =>
                    option.setName('currency')
                        .setDescription('The crypto to get the price of')
                        .setRequired(true)
                        .addChoice('Bitcoin', 'bitcoin')
                        .addChoice('Ethereum', 'ethereum')
                        .addChoice('Litecoin', 'litecoin')
                )
                .addStringOption(option =>
                    option.setName('range')
                        .setDescription('The range of data to get')
                        .setRequired(true)
                        .addChoice('1 Day', '1')
                        .addChoice('1 Week', '7')
                        .addChoice('1 Month', '30')
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('marketcap')
                .setDescription('Gets the market cap of a specific crypto')
                .addStringOption(option =>
                    option.setName('currency')
                        .setDescription('The crypto to get the market cap of')
                        .setRequired(true)
                        .addChoice('Bitcoin', 'bitcoin')
                        .addChoice('Ethereum', 'ethereum')
                        .addChoice('Litecoin', 'litecoin')
                )
                .addStringOption(option =>
                    option.setName('range')
                        .setDescription('The range of data to get')
                        .setRequired(true)
                        .addChoice('1 Day', '1')
                        .addChoice('1 Week', '7')
                        .addChoice('1 Month', '30')
                )
        ),
    async execute(interaction) {

        if(interaction.options.getSubcommand() === 'price') {
            
            const crypto = interaction.options.getString('currency');

            var data;

            await axios
            .get(`https://api.coingecko.com/api/v3/coins/${crypto}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`)
            .then(response => {
                data = response.data;
            })
            .catch(error => {
                console.log(error);
            });

            let embed = new MessageEmbed()
                .setTitle(`${(data.name)} Info`)
                .addField('Price', `$${(data.market_data.current_price.usd)}`)
                .addField('Price Change 24h', `${Math.floor(data.market_data.price_change_24h * 100) / 100} (${Math.floor(data.market_data.price_change_percentage_24h * 100) / 100}%)`)
            await interaction.reply({ embeds: [ embed ], ephemeral: true });

        }

        if(interaction.options.getSubcommand() === "price_graph") {

            const crypto = interaction.options.getString('currency');
            const range = interaction.options.getString('range');

            var data;

            await axios
            .get(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=${range}&interval=${range === '30' ? 'daily' : 'hourly'}`)
            .then(response => {
                data = response.data;
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
                        return `${(range == "30") ? (date.getMonth() + " " + date.getDay()) : (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())}:${(range == "30") ? "" : (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())} ${(range == "30") ? "" : (date.getHours() > 12 ? 'PM' : 'AM')}`
                    }),
                    datasets: [{ label: 'Price', data: data.prices.map(price => Math.round((price[1] + Number.EPSILON) * 100) / 100) }]
                },
                options: {
                    title: {
                        display: true,
                        text: `${crypto} Price - Last ${range} Days`
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                //set min to smallest price in dataset rounded down to nearest amount of digits in smallest number
                                min: Math.floor(Math.min(...data.prices.map(price => price[1])) / (Math.pow(10, (Math.floor(Math.min(...data.prices.map(price => price[1]))).toString().length)-2))) * (Math.pow(10, (Math.floor(Math.min(...data.prices.map(price => price[1]))).toString().length)-2)),
                                //set max to largest price in dataset rounded up to nearest 1000
                                max: Math.ceil(Math.max(...data.prices.map(price => price[1])) / (Math.pow(10, (Math.ceil(Math.max(...data.prices.map(price => price[1]))).toString().length)-2))) * (Math.pow(10, (Math.ceil(Math.max(...data.prices.map(price => price[1]))).toString().length)-2)),
                                //set step size to 1000 or 2000 depending on range
                                stepSize: (Math.pow(10, (Math.ceil(Math.min(...data.prices.map(price => price[1]))).toString().length)-2))
                            }
                        }]
                    }
                }
            })
            .setWidth(1000)
            .setHeight(500)
            .setBackgroundColor('White');

            let cryptoPriceEmbed = new MessageEmbed()
            .setTitle(`Crypto Price - ${crypto}`)
            .setColor(0x00AE86)
            .setDescription(`Price Over Last ${range} Day${range == '1' ? '' : 's'}\nLast Updated: ${new Date(data.prices[data.prices.length - 1][0]).toLocaleString()}`)
            .setImage(await chart.getShortUrl())

            await interaction.reply({ embeds: [ cryptoPriceEmbed ] });

        }

        if(interaction.options.getSubcommand() == "marketcap") {

            const crypto = interaction.options.getString('currency');
            const range = interaction.options.getString('range')

            var data;

            await axios
            .get(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=${range}&interval=${range === '30' ? 'daily' : 'hourly'}`)
            .then(response => {
                data = response.data;
            })
            .catch(error => {
                console.error(error)
            })

            const chart = new QuickChart();
            await chart
            .setConfig({
                type: 'line',
                data: {
                    labels: data.market_caps.map(price => {
                        let date = new Date(price[0])
                        return `${(range == "30") ? (date.getMonth() + " " + date.getDay()) : (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())}:${(range == "30") ? "" : (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())} ${(range == "30") ? "" : (date.getHours() > 12 ? 'PM' : 'AM')}`
                    }),
                    datasets: [{ label: 'Price', data: data.market_caps.map(price => Math.round((price[1] + Number.EPSILON) * 100) / 100) }]
                },
                options: {
                    title: {
                        display: true,
                        text: `${crypto} Market Cap - Last ${range} Days`
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                //set min to smallest price in dataset rounded down to nearest amount of digits in smallest number
                                min: Math.floor(Math.min(...data.market_caps.map(price => price[1])) / (Math.pow(10, (Math.floor(Math.min(...data.market_caps.map(price => price[1]))).toString().length)-2))) * (Math.pow(10, (Math.floor(Math.min(...data.market_caps.map(price => price[1]))).toString().length)-2)),
                                //set max to largest price in dataset rounded up to nearest 1000
                                max: Math.ceil(Math.max(...data.market_caps.map(price => price[1])) / (Math.pow(10, (Math.ceil(Math.max(...data.market_caps.map(price => price[1]))).toString().length)-2))) * (Math.pow(10, (Math.ceil(Math.max(...data.market_caps.map(price => price[1]))).toString().length)-2)),
                                //set step size to 1000 or 2000 depending on range
                                stepSize: (Math.pow(10, (Math.ceil(Math.min(...data.market_caps.map(price => price[1]))).toString().length)-2))
                            }
                        }]
                    }
                }
            })
            .setWidth(1000)
            .setHeight(500)
            .setBackgroundColor('White');

            let cryptoPriceEmbed = new MessageEmbed()
            .setTitle(`Crypto Price - ${crypto}`)
            .setColor(0x00AE86)
            .setDescription(`Market Caps Over Last ${range} Day${range == '1' ? '' : 's'}\nLast Updated: ${new Date(data.market_caps[data.market_caps.length - 1][0]).toLocaleString()}`)
            .setImage(await chart.getShortUrl())

            await interaction.reply({ embeds: [ cryptoPriceEmbed ] });
        }
    }
}