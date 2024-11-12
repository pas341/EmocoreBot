var client, guild, query, util, self, msc, docker, perms;

module.exports = {
    name: `docker`,
    description: `Handle docker commands`,
    type: 1,
    dm_permission: false,
    options: [
        {
            name: `start`,
            type: 1,
            description: `Start a server`,
            options: [
                {
                    name: `server`,
                    description: `What is the name of the server you want to start`,
                    type: 3,
                    required: true,
                    choices: null
                }
            ],
            default_member_permissions: 1,
        },
        {
            name: `stop`,
            type: 1,
            description: `Stop a server`,
            options: [
                {
                    name: `server`,
                    description: `What is the name of the server you want to stop`,
                    type: 3,
                    required: true,
                    choices: null
                }
            ],
            default_member_permissions: 1,
        },
        {
            name: `restart`,
            type: 1,
            description: `Restart a server`,
            options: [
                {
                    name: `server`,
                    description: `What is the name of the server you want to restart`,
                    type: 3,
                    required: true,
                    choices: null
                }
            ],
            default_member_permissions: 1,
        }
    ],
    default_member_permissions: 1,
    regmode: 0, //Regmode 0 means on all servers, 1 means only on winter clan server, 2 means only on the test server
    init: async function (c, scripts) {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        msc = scripts.utils.minecraftServerConnector;
        docker = scripts.utils.docker;
        perms = scripts.utils.permissionUtil;
        query = scripts.sql.query;
        util = scripts.util;
        self = this;

        for (let option of this.options) {
            for (let o of option) {
                if (o.name == `server`) {
                    o.choices = await this.getServers();
                }
            }
        }
    },
    execute: async (interaction, options, user, gameid, guild) => {
        try {

            if (!(await util.getDBUserByDiscordUser(query, user))) {
                await self.sendFaultReply(interaction, `Account Issue`, `You have to register your minecraft account to perform this command in discord`);
                return;
            }

            let channel = interaction.member.guild.channels.cache.find(c => c.id === interaction.channelId);
            let subCommand = interaction.options._subcommand;

            if (subCommand == `start`) {
                await self.docker_start(interaction, options, user);
                return;
            } else if (subCommand == `stop`) {
                await self.docker_stop(interaction, options, user);
                return;
            } else if (subCommand == `restart`) {
                await self.docker_restart(interaction, options, user);
                return;
            } else {
                await self.sendErrorReply(interaction, `Command not found please contact <@228573762864283649>`);
            }

        } catch (e) {
            console.error(e);
            self.sendErrorReply(interaction, `An internal error occured please contact <@228573762864283649>`);
        }
    },
    docker_start: async (interaction, options, user) => {
        if (await perms.hasPermission(user, `docker.start`, options.server)) {
            let serverinfo = await msc.getServer(servername = options.server);
            if (!serverinfo[`docker-volume`]) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `docker container name is not set in DB!`);
                return;
            }
            let container = await docker.getContainer(serverinfo[`docker-volume`]);
            if (!container) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `Unable to find docker container on server`);
                return;
            }

            
            await container.start();
            let response = `Starting Minecraft Server: **${serverinfo.name}**`;
            let e = { title: `Docker`, description: response, color: util.color.accent};
            interaction.reply({ ephemeral: true, embeds: [e] });
        }else{
            await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute raw commands on this server`);
            return;
        }
    },
    docker_stop: async (interaction, options, user) => {
        if (await perms.hasPermission(user, `docker.stop`, options.server)) {
            let serverinfo = await msc.getServer(servername = options.server);
            if (!serverinfo[`docker-volume`]) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `docker container name is not set in DB!`);
                return;
            }
            let container = await docker.getContainer(serverinfo[`docker-volume`]);
            if (!container) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `Unable to find docker container on server`);
                return;
            }
            await container.stop();
            let response = `Stopping Minecraft Server: **${serverinfo.name}**`;
            let e = { title: `Docker`, description: response, color: util.color.accent};
            interaction.reply({ ephemeral: true, embeds: [e] });
        }else{
            await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute raw commands on this server`);
            return;
        }
    },
    docker_restart: async (interaction, options, user) => {
        if (await perms.hasPermission(user, `docker.restart`, options.server)) {
            let serverinfo = await msc.getServer(servername = options.server);
            if (!serverinfo[`docker-volume`]) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `docker container name is not set in DB!`);
                return;
            }
            let container = await docker.getContainer(serverinfo[`docker-volume`]);
            if (!container) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `Unable to find docker container on server`);
                return;
            }
            await container.restart();
            let response = `Restarting Minecraft Server: **${serverinfo.name}**`;
            let e = { title: `Docker`, description: response, color: util.color.accent};
            interaction.reply({ ephemeral: true, embeds: [e] });
        }else{
            await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute raw commands on this server`);
            return;
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