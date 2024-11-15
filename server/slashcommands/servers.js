var client, guild, query, util, self, msc, docker, logger;

module.exports = {
    name: `servers`,
    description: `Show a List of servers`,
    type: 1,
    dm_permission: false,
    options: [
    ],
    default_member_permissions: 1,
    regmode: 0, //Regmode 0 means on all servers, 1 means only on winter clan server, 2 means only on the test server
    init: async function (c, scripts) {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        msc = scripts.utils.minecraftServerConnector;
        docker = scripts.utils.docker;
        logger = scripts.logger;
        self = this;
    },
    execute: async (interaction, options, user, gameid, guild) => {
        try {
            let response = { ephemeral: false };
            let servers = await msc.getServerInfo();

            let embeds = [];

            for (let i of servers) {
                let e = {title: i.name};
                let desc = ``;
                let serverPort = i.dockerConfig ? i.dockerConfig.esport : i.extport;
                desc += `Address: **${i.domain}:${serverPort}**`;
                if (i.mcversion) {
                    desc+=`\nMinecraft Version: **${i.mcversion}**`;
                }
                if (i.modpackurl) {
                    desc+=`\nModpack: **${i.modpackurl}**`;
                }

                if (i.modpackversion) {
                    desc+=`\nPack version: **${i.modpackversion}**`;
                }

                if (i.dockerConfig) {
                    let container = await docker.getContainer(i.dockerConfig.containername);
                    if (container) {
                        let status = await container.status();
                        //console.log(status.data.Config);
                        desc += `\nServer Status: **${status.data.State.Status}**`;
                    }
                }
                
                if (i.iconurl != null) {
                    e.thumbnail = {url: i.iconurl};
                }
                
                e.description = desc;
                embeds.push(e);
            }

			//response.ephemeral = true;
			response.embeds = embeds;
            interaction.reply(response);
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