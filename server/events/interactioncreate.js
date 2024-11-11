var client, gamesinfo, guild, platformsinfo, query, ranksinfo, scripts, util, self;

exports.e = {
	init: async function (c, s){
		client = c;
		scripts = s;
		guild = client.guilds.cache.find(g => g.name === s.guildname);
		query = scripts.sql.query;
		util = scripts.util;
		self = this;

		client.on(`interactionCreate`, self.event);
	},
	event: async (interaction) => {
		let user = interaction.user;
		let memberData = await self.f.getMemberByDiscordId(user.id);
		let channelGameId = -1;

		if(interaction.isAutocomplete()){
			let field = interaction.options.getFocused(true);
			let options = interaction.options;
			let optionsData = options && options.data;
			let optionsDataFirst = optionsData && optionsData.length && optionsData[0];
			let optionsDataFirstValue = optionsDataFirst && optionsDataFirst.value;
			let optionsDataFirstOptions = optionsDataFirst.options && optionsDataFirst.options[0];
			let optionsDataFirstOptionsValue = optionsDataFirstOptions && optionsDataFirstOptions.value;
			let input = optionsDataFirstValue || optionsDataFirstOptionsValue;

			if(field.name === `ping`){
				let isAuthorized = memberData && memberData.mgmt > 3;

				let response = ((a = []) => {
					if(isAuthorized){
						a.push({
							name: `true`,
							value: `true`
						},
						{
							name: `false`,
							value: `false`,
						});
					}else{
						a.push({
							name: `false`,
							value: `false`,
						});
					}

					return a;
				})();

				await interaction.respond(response);
			}else if(field.name === `game`){
				let isAuthorized = memberData && memberData.mgmt > 1;
				let gamesList = isAuthorized ? gamesinfo.games.listByName : [gamesinfo.games.idMap[channelGameId]];
				
				let response = ((a = []) => {
					for(let i = 0; i < gamesList.length; i++){
						let game = gamesList[i];
						let name = game && game.name && game.name.toLowerCase();
						let inputValue = (input || ``).toLowerCase();
						let includesInput = name && name.includes(inputValue);
						
						if(includesInput && !game.stop && a.length <= 24){
							a.push({name: game.name, value: `${game.id}`});
						}
					}
					
					return a.length ? a : [{name: `No Matching Games`, value: `null`}];
				})();

				interaction.respond(response);
			}else if(field.name === `platform`){
				let selectedGame = interaction.options.data[0].value;
				let game = selectedGame !== `null` ? gamesinfo.games.idMap[selectedGame] : false;
				let systems = game && game.system.split(`, `);

				let response = ((a = []) => {
					if(systems && systems.length){
						for(let i = 0; i < systems.length; i++){
							let system = systems[i];
							let platformName = platformsinfo.platforms.abbrevMap[system].platdiscordlc;
	
							if(a.length <= 24){
								a.push({name: platformName, value: system});
							}
						}
					}
					
					return a.length ? a : [{name: `No Matching Systems`, value: `null`}];
				})();
				
				interaction.respond(response);
			}else if(field.name === `existing`){
				let gamesList = gamesinfo.games.listByName;
				
				let response = ((a = []) => {
					for(let i = 0; i < gamesList.length; i++){
						let game = gamesList[i];
						let name = game && game.name && game.name.toLowerCase();
						let inputValue = (input || ``).toLowerCase();
						let includesInput = name && name.includes(inputValue);
						
						if(includesInput && game.stop && a.length <= 24){
							a.push({name: game.name, value: `${game.id}`});
						}
					}
					
					return a ? a : [{name: `No Matching Games`, value: `null`}];
				})();

				interaction.respond(response);
			}
		}

		if(interaction.isCommand()){
			let command = client.commands.get(interaction.commandName);
			let options = {};
			
			for(let i = 0; i < interaction.options.data.length; i++){
				let option = interaction.options.data[i];
				if(option.type === `SUB_COMMAND` || option.type === 1){
					option.name && (options[option.name] = true);
					
					for(let o of option.options){
						options[o.name] = o.value;
					}
				}else if(option.value){
					options[option.name] = option.value;
				}
			}
			
			try{
				command.execute(interaction, options, user, channelGameId);
			}catch(error){
				console.log(error);

				guild.members.cache.get(guild.ownerId).send({
					content: `${user.username} attempted to use the ${command.commandName} command and it errored.`,
				});

				return interaction.reply({
					content: `There was an error while executing this command! Please make <@${guild.ownerId}> aware of this issue.`,
					ephemeral: true,
				}).catch((err) => console.log(`interaction fail.`));
			}

			await self.f.discordParticipationCredit(user, `command`);
		}

		if(interaction.isModalSubmit()){
			let modal = require(`../modals/${interaction.customId}.js`).m;

			if(modal){
				try{
					await modal.init(client, scripts, interaction, channelGameId);
				}catch(error){
					console.log(error);

					return interaction.reply({
						content: `There was an error while executing this command! Please make <@${guild.ownerId}> aware of this issue.`,
						ephemeral: true,
					}).catch((err) => console.log(`interaction fail.`));
				}
			}
		}

	},
	f: {
		discordParticipationCredit: async (user, type) => {
			return new Promise(async (resolve) => {
				// how much should using interactions be worth...
				let botCommandsWeight = 1;
				let botRelationsWeight = 5;
				let messageCountWeight = 1;
				let textCharacterWeight = 10;

				if(type === `button`){ // other type is "command," which is worth more than "button"
					botRelationsWeight = 3;
					messageCountWeight = 0;
					textCharacterWeight = 0;
				}

				let set1 = `\`dla\` = NOW(), \`botcommands\` = \`botcommands\` + ${botCommandsWeight},`;
				let set2 = `\`botrelations\` = \`botrelations\` + ${botRelationsWeight},`;
				let set3 = `\`messagecount\` = \`messagecount\` + ${messageCountWeight},`;
				let set4 = `\`mlength\` = \`mlength\` + ${textCharacterWeight}`;
				let set = `${set1} ${set2} ${set3} ${set4}`;
				let sql = `UPDATE \`members-discord\` SET ${set} WHERE \`discorduid\` = ${user.id}`;
				
				query(sql, (e, r, f) => resolve(!e));
			});
		},
		getGameIdForChannel: async (channel) => {
			let channelName = channel.name.toLowerCase().split(`_bot`).join(``) || ``;
			let channelNameNoGameSuffix = channelName.replace(/_[^_]+$/, ``);
			let channelGameId = ((id) => {
				for(let game of gamesinfo.games.list){
					if(!game.stop && game.channel && channelNameNoGameSuffix && game.channel.includes(channelNameNoGameSuffix)){
						id = game.id;
					}
				}

				return id;
			})();

			return channelGameId;
		},
		getMemberByDiscordId: async (discorduid) => {
			return new Promise(async (resolve) => {
				query(`SELECT * FROM \`members-discord\` WHERE \`discorduid\` = "${discorduid}"`, (e, r, f) => resolve(r && r.length && r[0] || 0));
			});
		},
	},
};
