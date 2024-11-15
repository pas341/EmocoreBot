var client, guild, query, util, self, logger;

module.exports = {
    name: `register`,
    description: `Register Your Minecraft name`,
    type: 1,
    dm_permission: false,
    options: [
        {
            name: `username`,
            description: `Ingame name?`,
            type: 3,
            required: true,
        }
    ],
    default_member_permissions: 1 << 11,
    regmode: 0, //Regmode 0 means on all servers, 1 means only on winter clan server, 2 means only on the test server
    init: async function (c, scripts) {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        logger = scripts.logger;
        self = this;
    },
    execute: async (interaction, options, user, gameid, guild) => {
        try {
            let username = options.username;
            let mojangUserData = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`).then((json) => json.json());

            let insert = await new Promise((resolve) => {
                query(`INSERT INTO \`discord-minecraft-accounts\` (\`mname\`, \`dname\`, \`muid\`, \`duid\`, \`admin\`) VALUES (?, ?, ?, ?, ?)`, [username, user.username, mojangUserData.id, user.id, 0], async (error, results, fields) => {
                    if (error) {
                        logger.error(error);
                        resolve(0);
                    } else {
                        resolve(1);
                    }
                });
            });

            if (insert) {
                let e = { title: `Minecraft Registration`, description: `Your account has been registered!`, color: util.color.accent };
                interaction.reply({ embeds: [e], ephemeral: true });
            }else{
                self.sendErrorReply(interaction, `SQL database error durring command execution`);
            }

        } catch (e) {
            logger.error(e);
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