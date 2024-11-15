var client, guild, query, util, self, logger, msc, perms;



module.exports = {
    name: `op`,
    description: `Execute the op command on a server`,
    type: 1,
    dm_permission: false,
    options: [
        {
            name: `server`,
            description: `Target Server`,
            type: 3,
            required: true,
            autocomplete: true
        },
        {
            name: `target`,
            description: `Target player`,
            type: 3,
            required: false,
        }
    ],
    default_member_permissions: 1,
    regmode: 0, //Regmode 0 means on all servers, 1 means only on winter clan server, 2 means only on the test server
    init: async function (c, scripts) {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        msc = scripts.utils.minecraftServerConnector;
        perms = scripts.utils.permissionUtil;
        query = scripts.sql.query;
        util = scripts.util;
        logger = scripts.logger;
        self = this;
    },
    execute: async (interaction, options, user, gameid, guild) => {
        try {
            if (!(await util.getDBUserByDiscordUser(query, user))) {
                await self.sendFaultReply(interaction, `Account Issue`, `You have to register your minecraft account to perform this command in discord`);
                return;
            }

            if (await perms.hasPermission(user, `op`, options.server)) {
                let connection = await msc.connect(await msc.getServer(servername = options.server));
                let target = options.target ? options.target : (await util.getDBUserByDiscordUser(query, user)).mname;
                if (target != (await util.getDBUserByDiscordUser(query, user)).mname) {
                    if (!await perms.hasPermission(user, `op.others`, options.server)) {
                        await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute this commands on others on this server`);
                        return;
                    }
                }
                let response = await connection.send(`op ${target}`);
                let e = { title: `Command: OP`, description: response, color: util.color.accent};
                interaction.reply({ ephemeral: true, embeds: [e] });
                await connection.end();
            }else{
                await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute op commands on this server`);
                return;
            }

        } catch (e) {
            console.error(e);
            self.sendErrorReply(interaction, `An internal error occured please contact <@228573762864283649>`);
        }
    },
	sendErrorReply: async (interaction, error, title = `Internal Error`, defered = 0) => {
		let e = { title: title, description: error, color: util.color.error };
		if (defered) {
			await interaction.followUp({ ephemeral: true, embeds: [e] });
		} else {
			await interaction.reply({ embeds: [e], ephemeral: true });
		}
	},
	sendFaultReply: async (interaction, title, error, defered = 0) => {
		let e = { title: title, description: error, color: util.color.warning };
		if (defered) {
			await interaction.followUp({ ephemeral: true, embeds: [e] });
		} else {
			await interaction.reply({ embeds: [e], ephemeral: true });
		}
	},
    autocomplete: async (interaction, options, field, user) => {
        let suggestions = [];
        if (field.name==`server`) {
            let servers = await msc.getServerInfo();
            if (servers) {
                for (let i of servers) {
                    if (i.name.toLowerCase().startsWith(field.value.toLowerCase())) {
                        let obj = {name: i.name, value: i.name};
                        suggestions.push(obj);
                    }
                }
            }
        }
        interaction.respond(suggestions);
    },
};