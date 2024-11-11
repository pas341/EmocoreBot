var client, query, scripts, self, guild, logger;

const fs = require(`fs`);

// Register no response commands
const commands = [];
exports.m = {
	init: function (c, s) {
		client = c;
		scripts = s;
		self = this;
		query = scripts.sql.query;
		logger = scripts.logger;
		guild = client.guilds.cache.find(guild => guild.name === scripts.guildname);

		let commandfiles = fs.readdirSync("./server/chatcommands").filter(file => true);
		for (let file of commandfiles) {
			const command = require(`../chatcommands/${file}`).c;
			if (command.active) {
				command.init(c, s);
				commands.push(command);
			}
		}

		client.on(`messageCreate`, self.event);
	},
	event: async (message) => {
		let attachments = [...message.attachments.values()];
		let hasContent = message.cleanContent.length || !!attachments;
		
		if (message.author.bot || !hasContent) { return false; } // if the message was from a bot or the message has no content, do nothing
		
		let msg = { // important object properties/values for easy access
			attachments: attachments,
			author: message.author,
			mentions: [...message.mentions.users.values()],
			channel: message.channel,
			cleanContent: message.cleanContent.toLowerCase().trim(),
			content: message.content.toLowerCase().trim(),
			inDM: message.channel.type === `DM`,
			raw: message.content,
			arguments: message.content.replace(/<[^>]*>/g, ``).trim().split(` `),
			_message: message, // needed for deleting messages (like after a ban)
		};
		
		msg.plainText = msg.cleanContent.replace(new RegExp(`@` + client.user.username.toLowerCase(), `g`), ``).replace(/[^\w\s]/g, ``).trim();
		msg.textNoTags = msg.content.replace(/<[^>]*>/g, ``).trim();
		msg.textNoTagsNoSpaces = msg.textNoTags.replace(/\s/g, ``);
		msg.talkingToBot = msg.cleanContent.replace(/[^-@\w]/g, ``).indexOf(`@` + client.user.username.toLowerCase()) === 0;
		msg.talkingAboutBot = msg.mentions.find(m => m.id === client.user.id) && !msg.talkingToBot;
		
		if (msg.talkingToBot) {
			const isUserManagementMember = this.m.checkForManagementRole(msg);
			for (let command of commands) {
				if (command.managementOnly) {
					if (isUserManagementMember) {
						if (command.commandTag.toLowerCase() === msg.arguments[0].toLowerCase()) {
							command.runCommand(msg, message, msg.arguments);
							break;
						}
						if (command.aliases) {
							if (command.aliases.includes(msg.arguments[0].toLowerCase())) {
								command.runCommand(msg, message, msg.arguments);
								break;
							}
						}
					}
				} else {
					if (command.commandTag.toLowerCase() === msg.arguments[0].toLowerCase()) {
						command.runCommand(msg, message, msg.arguments);
						break;
					}
					if (command.aliases) {
						if (command.aliases.includes(msg.arguments[0].toLowerCase())) {
							command.runCommand(msg, message, msg.arguments);
							break;
						}
					}
				}
			}
		}

	},
	checkForManagementRole: async (msg) => {
		let memberInfo = guild.members.cache.find(m => m.user.id === msg.author.id);
		let checkRoles = [`lieutenant`, `captain`, `marshal`, `legate`, `officer`]
		let hasARole = false;
		for (let r of memberInfo.roles.cache) {
			if (checkRoles.includes(r[1].name.toLowerCase())) {
				hasARole = true;
				break;
			}
		}

		return hasARole;
	}

};
