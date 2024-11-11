var client, guild, query, ranksinfo, scripts, util, memberDatabaseHelper, self, logger;

exports.e = {
	init: async function (c, s) {
		client = c;
		scripts = s;
		guild = client.guilds.cache.find(g => g.name === s.guildname);
		query = scripts.sql.query;
		util = scripts.util;
		logger = scripts.logger;
		self = this;

		client.on(`guildMemberAdd`, self.event);
	},
	event: async (member) => {

	}
};
