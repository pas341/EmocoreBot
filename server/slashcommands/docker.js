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
        },
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
            for (let o of option.options) {
                if (o.name == `server`) {
                    o.choices = await this.getServers();
                }
            }
        }
    },
    getServers: async () => {
        let options = [];
        let servers = await msc.getServerInfo();
        for (let i of servers) {
            let obj = { name: i.name, value: ""+i.id };
            options.push(obj);
        }
        return options;
    },
    execute: async (interaction, options, user, gameid, guild) => {
        try {
            await interaction.deferReply({ ephemeral: true });
            if (!(await util.getDBUserByDiscordUser(query, user))) {
                await self.sendFaultReply(interaction, `Account Issue`, `You have to register your minecraft account to perform this command in discord`, defered = 1);
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
                await self.sendErrorReply(interaction, `Command not found please contact <@228573762864283649>`, defered = 1);
            }

        } catch (e) {
            console.error(e);
            await self.sendErrorReply(interaction, `An internal error occured please contact <@228573762864283649>`, defered = 1);
        }
    },
    docker_start: async (interaction, options, user) => {
        if (await perms.hasPermission(user, `docker.start`, options.server)) {
            let serverinfo = await msc.getServer(servername = options.server);
            if (!serverinfo.dockerConfig) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `docker container name is not set in DB!`);
                return;
            }

            let start_event = await docker.createContainer(serverinfo.dockerConfig.containername, options.server);
            if (start_event.code != 0) {
                console.error(`Docker container failed to start errorcode: ${start_event.code}`);
                if (serverinfo.iconurl) {
                    await self.sendErrorReply(interaction, title = start_event.error,`Error durring container startup`, defered = 1, icon = serverinfo.iconurl);
                }else{
                    await self.sendErrorReply(interaction, title = start_event.error,`Error durring container startup`, defered = 1);
                }
                return;
            }else{
                let response = `Starting Minecraft Server: **${serverinfo.name}**`;
                let e = { title: `Docker`, description: response, color: util.color.accent };
                interaction.followUp({ ephemeral: true, embeds: [e] });
            }
        } else {
            await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute docker start commands on this server`, defered = 1);
            return;
        }
    },
    docker_stop: async (interaction, options, user) => {
        if (await perms.hasPermission(user, `docker.stop`, options.server)) {
            let serverinfo = await msc.getServer(servername = options.server);
            if (!serverinfo.dockerConfig) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `docker container name is not set in DB!`, defered = 1);
                return;
            }
            let container = await docker.getContainer(serverinfo.dockerConfig.containername, options.server);
            if (!container) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `Unable to find docker container on server`, defered = 1);
                return;
            }
            await interaction.followUp({embeds: [{title: `Command Status`, description: `Server shutdown started`, color: util.color.accent}]});
            await container.stop();
            await container.delete();
            let response = `Stopping Minecraft Server: **${serverinfo.name}**`;
            let e = { title: `Docker`, description: response, color: util.color.accent };
            interaction.followUp({ ephemeral: true, embeds: [e] });
        } else {
            await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute raw commands on this server`, defered = 1);
            return;
        }
    },
    docker_restart: async (interaction, options, user) => {
        if (await perms.hasPermission(user, `docker.restart`, options.server)) {
            let serverinfo = await msc.getServer(servername = options.server);
            if (!serverinfo.dockerConfig) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `docker container name is not set in DB!`, defered = 1);
                return;
            }

            let container = await docker.getContainer(serverinfo.dockerConfig.containername);
            if (!container) {
                await self.sendErrorReply(interaction, `Invalid Server Configuration`, title = `Unable to find docker container on server`, defered = 1);
                return;
            }
            await container.restart();
            let response = `Restarting Minecraft Server: **${serverinfo.name}**`;
            let e = { title: `Docker`, description: response, color: util.color.accent };
            interaction.followUp({ ephemeral: true, embeds: [e] });
        } else {
            await self.sendFaultReply(interaction, `Permission Issue`, `You do not have permisssion to execute raw commands on this server`, defered = 1);
            return;
        }
    },
    sendErrorReply: async (interaction, error, title = `Internal Error`, defered = 0, icon = null) => {
        let e = { title: title, description: error, color: util.color.error };
        if (icon != null) {
            e.thumbnail = {url: icon};
        }
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