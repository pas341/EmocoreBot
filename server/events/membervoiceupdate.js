var client, guild, query, util, self, voice, channels, minecraft_servers, msc;

exports.m = {
	init: async function(c, scripts){
		client = c;
		guild = client.guilds.cache.find(g => g.name === scripts.guildname);
		query = scripts.sql.query;
		util = scripts.util;
		self = this;
		voice = self.voice;
		msc = scripts.utils.minecraftServerConnector;

		minecraft_servers = await msc.getServerInfo();

		client.on(`voiceStateUpdate`, self.event);
	},
	event: async (oldState, newState) => {
		// monitoring voice channel participants
		// let oldMember = oldState.member;
		let member = newState.member;
		let memberId = member.user.id;
		let oldVoiceChannelId = oldState.channelId;
		let newVoiceChannelId = newState.channelId;
		let joinedVC = !oldVoiceChannelId && newVoiceChannelId;
		let leftVC = oldVoiceChannelId && !newVoiceChannelId;
		let changeVC = oldVoiceChannelId && newVoiceChannelId && (oldVoiceChannelId !== newVoiceChannelId);
		let isStreaming = member.voice.streaming ? true : false;
		let wasStreaming = false;

		if (joinedVC) {
			let channel = await guild.channels.cache.find(c => c.id === newVoiceChannelId);
			let channelCategoryId = channel.parentId;
			let minecraftServer = await msc.getServerByVCCategory(channelCategoryId);

			
			if (minecraftServer.voicewhitelist) {
				let dbuser = await util.getDBUserByDiscordUser(query, member.user);
				if (dbuser) {
					let connection = await msc.connect(minecraftServer);
					let cmdAction = await msc.whitelist_add(connection, null, member.user);
					connection.end();
				}
			}
		}


		if (leftVC) {
			let channel = await guild.channels.cache.find(c => c.id === oldVoiceChannelId);
			let channelCategoryId = channel.parentId;
			let minecraftServer = await msc.getServerByVCCategory(channelCategoryId);

			if (minecraftServer.voicewhitelist) {
				let connection = await msc.connect(minecraftServer);
                let cmdAction = await msc.whitelist_remove(connection, null, member.user);
				cmdAction = await msc.kick(connection, null, member.user, `Left Voice Chat`);
				connection.end();
			}
		}


	},
	v: {
		streamers: {},
	},
}
