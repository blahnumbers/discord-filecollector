require('./deploy-commands.js');

const { Client, GatewayIntentBits } = require('discord.js');
const { token, fileSubmitName, fileSubmitFiletype, fileSubmitContentPrefix, submitReportChannel } = require('./config.json');
const crypto = require('crypto');
const Mongo = require('./mongodb-module.js');

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

client.once('ready', (c) => {
	console.log(`Connected and authorized as ${c.user.tag}`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'submit') {
		await interaction.deferReply({ ephemeral: true });
		const fileAttachment = interaction.options.getAttachment(fileSubmitName);
		const user = interaction.member ? interaction.member.user : interaction.user;

		if (!fileAttachment.name.endsWith(fileSubmitFiletype)) {
			await interaction.editReply(`Please upload a ${fileSubmitFiletype} file`);
			return;
		}
		const fileData = await import('node-fetch').then(({ default: fetch }) => fetch(fileAttachment.url));
		if (!fileData.ok) {
			await interaction.editReply('Something went wrong. Please try again.');
			return;
		}

		const fileContent = await fileData.text();
		if (fileSubmitContentPrefix != null && !fileContent.startsWith(fileSubmitContentPrefix)) {
			await interaction.editReply('Uh-oh, please upload a valid file :exploding_head:');
			return;
		}

		const fileHash = crypto.createHash('md5').update(fileContent).digest("hex");
		const fileDataDatabase = await Mongo.findFile(fileHash, interaction.guild_id);
		if (fileDataDatabase) {
			var options = { year: 'numeric', month: 'long', day: 'numeric' };
			var uploadTime = new Intl.DateTimeFormat('en-US', options).format(fileDataDatabase.date);
			options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
			uploadTime += " at " + new Intl.DateTimeFormat('en-US', options).format(fileDataDatabase.date);

			if (fileDataDatabase.user == user) {
				await interaction.editReply(`You have already uploaded this file on ${uploadTime} :thinking:`);
			}
			else {
				await interaction.editReply(`This file has already been submitted by ${fileDataDatabase.username} on ${uploadTime} :skull:`);
			}
			return;
		}

		const fileAddResult = await Mongo.addFile(fileAttachment, fileHash, user, interaction.guild_id);
		if (fileAddResult) {
			if (submitReportChannel != null) {
				const channel = client.channels.cache.get(submitReportChannel);
				if (channel) {
					channel.send({
						embeds: [{
							description: `New ${fileSubmitName} submission: ${fileAttachment.name}`,
							fields: [{
								name: "Download link:",
								value: fileAttachment.url
							}],
							author: {
								name: `${user.username}#${user.discriminator}`,
								icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
							},
							footer: {
								text: new Date().toLocaleString()
							}
						}]
					});
				}
			}
			await interaction.editReply(`You have successfully submitted your ${fileAttachment.name} file! :tada:`);
			return;
		}
	}
});

client.login(token);
