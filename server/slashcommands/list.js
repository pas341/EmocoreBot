var client, guild, query, util, self, msc, perms;



module.exports = {
    name: `list`,
    description: `Execute the list command on a server`,
    type: 1,
    dm_permission: false,
    options: [
        {
            name: `server`,
            description: `Target Server`,
            type: 3,
            required: true,
            choices: null
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
        self = this;
        for (let option of this.options) {
            if (option.name == `server`) {
                option.choices = await this.getServers();
            }
        }
    },
    getServers: async () => {
        let options = [];
        let servers = await msc.getServerInfo();
        for (let i of servers) {
            let obj = {name: i.name, value: i.name};
            options.push(obj);
        }
        return options;
    },
    execute: async (interaction, options, user, gameid, guild) => {
        try {
            if (await perms.hasPermission(user, `list`, options.server)) {
                let connection = await msc.connect(await msc.getServer(servername = options.server));
                let response = await connection.send(`list`);
                let e = { title: `Online Players`, description: response, color: util.color.accent};
                interaction.reply({ ephemeral: true, embeds: [e] });
                await connection.end();
            }else{
                await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute raw commands on this server`);
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
};