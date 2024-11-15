const util = require(`./server/util.js`).util;
const logger = require(`./server/logger.js`).logger;
const config = require(`${__dirname}/server/config/config.json`);
logger.init(config);
// const discordjs = require(`discord.js`);
const { Client, GatewayIntentBits, Partials } = require(`discord.js`);

const discordconfig = require(`${__dirname}/server/config/config.json`)[`discord`];
const remoteconfig = require(`${__dirname}/server/config/config.json`)[`remotes`];
// const discord = {
// 	token: discordconfig[`token`],
// 	client: new discordjs.Client(),
// };


const conn = require(`./server/db/databasePool.js`).conn;
const query = require(`./server/db/databasePool.js`).query;
const debugConn = require(`./server/db/databasePool.js`).debugConn;
const debugQuery = require(`./server/db/databasePool.js`).debugQuery;

const slashcommander = require(`./server/slashcommander.js`).slashcommander;
const operator = require(`./server/operator.js`).operator;
const myArgs = process.argv.slice(2);

const msc = require(`./server/utils/minecraftServerConnector.js`).connector;
const permissionUtil = require(`./server/utils/permissionUtil.js`).perms;
const dockerUtil = require(`./server/utils/dockerUtil.js`).d;
const settings = {
	skipMemberFix: myArgs.includes("smf"),
	testingDB: myArgs.includes("testing"),
}

const discord = {
	token:  discordconfig[`token`],
	client: new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildEmojisAndStickers,
			GatewayIntentBits.GuildModeration,
			GatewayIntentBits.GuildIntegrations,
			GatewayIntentBits.GuildWebhooks,
			GatewayIntentBits.GuildInvites,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.MessageContent,
		],
		partials: [
			Partials.Channel,
			Partials.Reaction,
			Partials.Message
		]
	}),
};

const scripts = {
	sql: {
		conn: conn,
		query: query,
	},
	connectionDate: util.prettyDate(),
	util: util,
	guildname: discordconfig[`guildname`],
	utils: {
		minecraftServerConnector: msc,
		permissionUtil: permissionUtil,
		docker: dockerUtil,
	},
	logger: logger,
	settings: settings,
	config: config
};


const interactions = {
	databaseConnect: async () => {
		if (settings.testingDB) {
			await new Promise(async (resolve) => debugConn.init(scripts).then((debugConn) => {
				scripts.sql.conn = debugConn;
				scripts.sql.query = debugQuery.bind(debugConn) && debugQuery.execute;
				logger.info(`testing database connected at: ${util.prettyDate()}`);
				resolve();
			}));
		}else{
			await new Promise(async (resolve) => conn.init(scripts).then((conn) => {
				scripts.sql.conn = conn;
				scripts.sql.query = query.bind(conn) && query.execute;
				logger.info(`database connected at: ${util.prettyDate()}`);
				resolve();
			}));
		}
	},
	discordClientLogin: async () => {
		await new Promise(async (resolve) => discord.client.login(discord.token).then(resolve()));
		logger.info(`discord connected at: ${util.prettyDate()}`);
	},
	discordClientReady: async () => {
		await new Promise(async (resolve) => discord.client.on(`ready`, () => resolve()));
		logger.info(`discord client ready at: ${util.prettyDate()}`);
	}
};


(async () => {
	//Temp SSL VERIFICATION BYPASS REMOVE THIS!!!
	//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	logger.raw(`\n`, 0);
	logger.info(`node version: ${process.version}`,);
	logger.info(`app started at: ${util.prettyDate()}`);
	logger.info(`node enviroment: ${process.env.NODE_ENV}`);
	// establish external service connections/interactions
	await interactions.discordClientLogin();
	await interactions.discordClientReady();
	await interactions.databaseConnect();


	// initializing processes
	await msc.init(discord.client, scripts);
	await permissionUtil.init(discord.client, scripts);
	await dockerUtil.init(discord.client, scripts);
	// bot configuration processes
	await slashcommander.init(discord.client, scripts, discord.token);
	
	
	
	// initialize the event and command handlers
	await operator.init(discord.client, scripts);
	logger.info(`Startup Complete: ${util.prettyDate()}`);

	
	// add new members
})();
