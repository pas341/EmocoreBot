var client, guild, util, self;

const { REST } = require(`@discordjs/rest`);
const { Routes } = require(`discord-api-types/v10`);
const fs = require(`fs`);

const { URLSearchParams } = require('url');
const discordconfig = require(`${__dirname}/config/config.json`)[`discord`];
exports.slashcommander = {
	init: async function (c, scripts, token) {
		client = c;
		client.commands = new Map();
		guild = client.guilds.cache.find(g => g.name === scripts.guildname);
		util = scripts.util;
		self = this;
		await self.slashCommands(scripts, token);
	},
	slashCommands: async (scripts, token) => {
		let rest = new REST({ version: `10` }).setToken(token);
		let commands = await (async (a = []) => {
			let files = fs.readdirSync(`${__dirname}/slashcommands`).filter(f => f.endsWith(`.js`));

			for (let i = 0; i < files.length; i++) {
				const command = require(`${__dirname}/slashcommands/${files[i]}`);
				command.pre && await command.pre(command, scripts);
				if (command.regmode == 1 && scripts.guildname !== `Winter Clan`) {
					continue;
				}
				if (command.regmode == 2 && scripts.guildname !== `Winter Test Server`) {
					continue;
				}
				await command.init(client, scripts);
				if (Object.keys(command).includes(`generateOptions`)) {
					command.options = await command.generateOptions();
				}
				client.commands.set(command.name, command);
				a.push(command);
			}

			return a;
		})();

		let routesForCommands = Routes.applicationCommands(client.user.id);
		let pushDetails = { body: commands };

		await rest.put(routesForCommands, pushDetails).catch(e => console.error(e));
		scripts.logger.info(`Slash Commands Enabled`);
	},
	deleteCommands: async (c, scripts, token) => {
		let rest = new REST({ version: `10` }).setToken(token);
		let guild = client.guilds.cache.find(g => g.name === scripts.guildname);
		rest.put(Routes.applicationGuildCommands(c.user.id, guild.id), { body: [] })
			.then(() => console.log('Successfully deleted all guild commands.'))
			.catch(console.error);

		// for global commands
		rest.put(Routes.applicationCommands(c.user.id,), { body: [] })
			.then(() => console.log('Successfully deleted all application commands.'))
			.catch(console.error);
	}
};