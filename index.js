require('./deploy-commands.js');

const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

client.once('ready', (c) => {
	console.log(`Connected and authorized as ${c.user.tag}`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'submit') {
		await interaction.reply('Test');
	}
});

client.login(token);
