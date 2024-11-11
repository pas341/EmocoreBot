var client, query, scripts, guild, logger;

const errorCodeTag = `1fx02`;
const commandFormat = `status`;

// error codes any thing that start with 2x is a sql error,
// any thing that start with 3x is in the main function normaly a syntax error,
// any thing that start with 1x or 2x is normaly an user input error
exports.c = {
    commandTag: `status`,
    managementOnly: 0,
    aliases: [],
    active: true,
    init: async (c, s) => {
        client = c;
        scripts = s;
        self = this;
        query = scripts.sql.query;
        guild = client.guilds.cache.find(guild => guild.name === scripts.guildname);
        logger = scripts.logger;
    },
    runCommand: async (msg, message, args) => {
        msg.channel.send(`Status: OK, ID: ${process.pid}`);
    }
}