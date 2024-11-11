var client, guild, query, util;



const taskrunner = require(`./taskrunner.js`).t;
const commandHandler = require(`./events/messagecreate-commands.js`).m;
const interactioncreate = require(`./events/interactioncreate.js`).e;
//const phraseguess = require(`./games/phraseguess.js`).guess;
const guildmemberadd = require(`./events/guildmemberadd.js`).e;
const membervoiceupdate = require(`./events/membervoiceupdate.js`).m;

exports.operator = {
	init: async (c, scripts) => {
		client = c;
		guild = client.guilds.cache.find(g => g.name === scripts.guildname);
		util = scripts.util;
		query = scripts.sql.query;
		
		await guildmemberadd.init(c, scripts);
		await taskrunner.init(c, scripts);
		membervoiceupdate.init(c, scripts);
		commandHandler.init(c, scripts);
		interactioncreate.init(c, scripts);
	}
};
