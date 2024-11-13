var client, guild, query, util, self, msc, docker, perms;

module.exports = {
    name: `createserver`,
    description: `create a server`,
    type: 1,
    dm_permission: false,
    options: [
        {
            name: `configure`,
            type: 1,
            description: `Configure a server`,
            options: [
                {
                    name: `name`,
                    description: `What is the name of the server you want to create`,
                    type: 3,
                    required: true,
                },
                {
                    name: `iconurl`,
                    description: `A Url to an icon for the server`,
                    type: 3,
                    required: true,
                },
                {
                    name: `modpackurl`,
                    description: `A Url to the modpack you want to create a server for`,
                    type: 3,
                    required: true,
                },
                {
                    name: `modpackversion`,
                    description: `The Version of the modpack`,
                    type: 3,
                    required: true,
                },
                {
                    name: `minecraftversion`,
                    description: `The minecraft version the modpack runs on`,
                    type: 3,
                    required: true,
                }
            ],
            default_member_permissions: 0,
        },
    ],
    default_member_permissions: 0,
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
                if (o.name == `image`) {
                    o.choices = await this.getServers();
                }
            }
        }
    },
    getServers: async () => {
        let options = [];
        let servers = await msc.getServerInfo();
        for (let i of servers) {
            let obj = { name: i.name, value: "" + i.id };
            options.push(obj);
        }
        return options;
    },
    getServers: async () => {
        let options = [];
        let images = await new Promise((resolve) => {
            query(`SELECT * FROM \`docker-images\``, [], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });
        for (let i of images) {
            let obj = { name: i.name, value: i.name };
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

            if (subCommand == `configure`) {
                await self.configure_server(interaction, options, user);
                return;
            } else {
                await self.sendErrorReply(interaction, `Command not found please contact <@228573762864283649>`, defered = 1);
            }

        } catch (e) {
            console.error(e);
            await self.sendErrorReply(interaction, `An internal error occured please contact <@228573762864283649>`, defered = 1);
        }
    },
    configure_server: async (interaction, options, user) => {

    },
    sendReply: async (interaction, title, message, defered = 0) => {
        let e = { title: title, description: message, color: util.color.accent };
        if (defered) {
            interaction.followUp({ ephemeral: true, embeds: [e] });
        }else{
            interaction.reply({ ephemeral: true, embeds: [e] });
        }
    },
    sendErrorReply: async (interaction, error, title = `Internal Error`, defered = 0, icon = null) => {
        let e = { title: title, description: error, color: util.color.error };
        if (icon != null) {
            e.thumbnail = { url: icon };
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