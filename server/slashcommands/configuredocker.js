var client, guild, query, util, self, msc, docker, perms, config;

module.exports = {
    name: `configuredocker`,
    description: `create a server`,
    type: 1,
    dm_permission: false,
    options: [
        {
            name: `curseforge`,
            type: 1,
            description: `Configure a server curseforge docker container`,
            options: [
                {
                    name: `serverid`,
                    description: `What is the id of the server you want to configure`,
                    type: 4,
                    required: true,
                },
                {
                    name: `image`,
                    description: `What is the docker image you want to use for the server`,
                    type: 3,
                    required: true,
                    choices: null,
                },
                {
                    name: `container`,
                    description: `What is the name of the container`,
                    type: 3,
                    required: true,
                },
                {
                    name: `maxram`,
                    description: `how much ram does the server need in GB`,
                    type: 4,
                    required: true,
                },
                {
                    name: `port`,
                    description: `What is the main port for this server`,
                    type: 4,
                    required: true,
                },
                {
                    name: `rconport`,
                    description: `What is the rcon port for this server`,
                    type: 4,
                    required: true,
                },
                {
                    name: `cfslug`,
                    description: `What is the curseforge slug for the modpack`,
                    type: 3,
                    required: true,
                },
                {
                    name: `fileid`,
                    description: `What is the curseforge file id for the version of the modpack`,
                    type: 3,
                    required: true,
                },
                {
                    name: `cpus`,
                    description: `What is the cpu configuration for this server`,
                    type: 3,
                    required: true,
                },
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
        config = scripts.config;
        self = this;

        for (let option of this.options) {
            for (let o of option.options) {
                if (o.name == `image`) {
                    o.choices = await this.getImages();
                }
            }
        }
    },
    getImages: async () => {
        let options = [];
        let images = await new Promise((resolve) => {
            query(`SELECT * FROM \`docker-images\``, [], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results : null);
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

            if (subCommand == `curseforge`) {
                await self.curseforge(interaction, options, user, channel);
                return;
            } else {
                await self.sendErrorReply(interaction, `Command not found please contact <@228573762864283649>`, defered = 1);
            }

        } catch (e) {
            console.error(e);
            await self.sendErrorReply(interaction, `An internal error occured please contact <@228573762864283649>`, defered = 1);
        }
    },
    curseforge: async (interaction, options, user, channel) => {
        let serverid = options.serverid;
        let containername = options.container;
        let image = options.image;
        let maxram = options.maxram;
        let port = options.port;
        let rconport = options.rconport;
        let cfslug = options.cfslug;
        let fileid = options.fileid;
        let cpus = options.cpus;
        let lram = options.maxram + 1;

        let cf_api_key = await new Promise((resolve) => {
            query(`SELECT * FROM \`server-config\` WHERE \`serverid\` = ?`, [config.server.serverid], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        let curseforge = {api_key: cf_api_key, slug: cfslug, file_id: fileid};

        let obj = {
            serverid: serverid,
            image: image,
            containername: containername,
            maxram: maxram,
            esport: port,
            rport: rconport,
            platform: `AUTO_CURSEFORGE`,
            curseforgeconfig: curseforge,
            cpus: cpus,
            lram: lram
        }

        let serverID = await new Promise((resolve) => {
            query(`INSERT INTO \`minecraft-server-docker-config\``
                , [obj], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {

                    resolve(results.insertId);
                }
            });
        });
        await self.sendReply(interaction, `Docker Creator`, `Docker Configuration completed`, defered = 1);
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