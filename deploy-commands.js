const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { token, clientId, guildId } = require('./config.json');

const commands = [
	new SlashCommandBuilder()
		.setName('submit')
		.setDescription('Submit a replay to the Collector')
		.addAttachmentOption(option =>
			option.setName(`replay`)
				.setDescription('.rpl file you want to submit')
				.setRequired(true)
		)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} app commands`))
	.catch(console.error);
