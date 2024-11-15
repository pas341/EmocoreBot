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
                {
                    name: `extra_args`,
                    description: `Extra server arguments`,
                    type: 3,
                    required: false,
                },
                {
                    name: `jvm_options`,
                    description: `Extra jvm settings`,
                    type: 3,
                    required: false,
                },
            ],
            default_member_permissions: 0,
        },
        {
            name: `custom`,
            type: 1,
            description: `Configure a server custom modpack docker container`,
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
                    name: `customserver`,
                    description: `What is the local filepath of the jarfile`,
                    type: 3,
                    required: true,
                },
                {
                    name: `cpus`,
                    description: `What is the cpu configuration for this server`,
                    type: 3,
                    required: true,
                },
                {
                    name: `extra_args`,
                    description: `Extra server arguments`,
                    type: 3,
                    required: false,
                },
                {
                    name: `jvm_options`,
                    description: `Extra jvm settings`,
                    type: 3,
                    required: false,
                },
            ],
            default_member_permissions: 0,
        },
        {
            name: `forge`,
            type: 1,
            description: `Configure a forge server docker container`,
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
                    name: `forgeversion`,
                    description: `What is the version of forge you want to install`,
                    type: 3,
                    required: true,
                },
                {
                    name: `cpus`,
                    description: `What is the cpu configuration for this server`,
                    type: 3,
                    required: true,
                },
                {
                    name: `extra_args`,
                    description: `Extra server arguments`,
                    type: 3,
                    required: false,
                },
                {
                    name: `jvm_options`,
                    description: `Extra jvm settings`,
                    type: 3,
                    required: false,
                },
            ],
            default_member_permissions: 0,
        },
        {
            name: `neoforge`,
            type: 1,
            description: `Configure a neoforge server docker container`,
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
                    name: `neoforgeversion`,
                    description: `What is the version of neoforge you want to install`,
                    type: 3,
                    required: true,
                },
                {
                    name: `cpus`,
                    description: `What is the cpu configuration for this server`,
                    type: 3,
                    required: true,
                },
                {
                    name: `extra_args`,
                    description: `Extra server arguments`,
                    type: 3,
                    required: false,
                },
                {
                    name: `jvm_options`,
                    description: `Extra jvm settings`,
                    type: 3,
                    required: false,
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
            } else if (subCommand == `custom`) {
                await self.custom(interaction, options, user);
                return;
            } else if (subCommand == `forge`) {
                await self.forge(interaction, options, user);
                return;
            } else if (subCommand == `neoforge`) {
                await self.neoforge(interaction, options, user);
                return;
            } else {
                await self.sendErrorReply(interaction, `Command not found please contact <@228573762864283649>`, defered = 1);
            }

        } catch (e) {
            console.error(e);
            await self.sendErrorReply(interaction, `An internal error occured please contact <@228573762864283649>`, defered = 1);
        }
    },
    neoforge: async (interaction, options, user, channel) => {
        if (!(await self.checkForServerConfig(options.serverid))) {
            await self.sendErrorReply(interaction, `Invalid ServerID`, title = `Invalid Form Input`, defered = 1);
            return;
        }
        let dockerConfig = await self.generateDockerConfigBase(interaction, options, user, channel);

        let neoforgeversion = options.neoforgeversion;

        let configdata = {neoforgeversion: neoforgeversion};
        
        if (options.extra_args) {
            configdata.extra_args = options.extra_args;
        }
        if (options.jvm_options) {
            configdata.jvm_options = options.jvm_options;
        }

        dockerConfig.platform = `FORGE`;
        dockerConfig.configdata = JSON.stringify(configdata);

        let insertData = await self.insertDockerConfigInDB(interaction, options, user, channel, dockerConfig);
        if (insertData.code != 0) {
            await self.sendErrorReply(interaction, `${insertData.error}.\nPlease contact <@228573762864283649>`, defered = 1);
            return;
        }else{
            await self.sendReply(interaction, `Docker Creator`, `Docker Configuration completed`, defered = 1);
            return;
        }
    },
    forge: async (interaction, options, user, channel) => {
        if (!(await self.checkForServerConfig(options.serverid))) {
            await self.sendErrorReply(interaction, `Invalid ServerID`, title = `Invalid Form Input`, defered = 1);
            return;
        }
        let dockerConfig = await self.generateDockerConfigBase(interaction, options, user, channel);

        let forgeversion = options.forgeversion;

        let configdata = {forgeversion: forgeversion};
        
        if (options.extra_args) {
            configdata.extra_args = options.extra_args;
        }
        if (options.jvm_options) {
            configdata.jvm_options = options.jvm_options;
        }

        dockerConfig.platform = `FORGE`;
        dockerConfig.configdata = JSON.stringify(configdata);

        let insertData = await self.insertDockerConfigInDB(interaction, options, user, channel, dockerConfig);
        if (insertData.code != 0) {
            await self.sendErrorReply(interaction, `${insertData.error}.\nPlease contact <@228573762864283649>`, defered = 1);
            return;
        }else{
            await self.sendReply(interaction, `Docker Creator`, `Docker Configuration completed`, defered = 1);
            return;
        }
    },
    custom: async (interaction, options, user, channel) => {
        if (!(await self.checkForServerConfig(options.serverid))) {
            await self.sendErrorReply(interaction, `Invalid ServerID`, title = `Invalid Form Input`, defered = 1);
            return;
        }
        let dockerConfig = await self.generateDockerConfigBase(interaction, options, user, channel);

        let custom_server = options.customserver;

        let configdata = {custom_server: custom_server};
        
        if (options.extra_args) {
            configdata.extra_args = options.extra_args;
        }
        if (options.jvm_options) {
            configdata.jvm_options = options.jvm_options;
        }

        dockerConfig.platform = `CUSTOM`;
        dockerConfig.configdata = JSON.stringify(configdata);

        let insertData = await self.insertDockerConfigInDB(interaction, options, user, channel, dockerConfig);
        if (insertData.code != 0) {
            await self.sendErrorReply(interaction, `${insertData.error}.\nPlease contact <@228573762864283649>`, defered = 1);
            return;
        }else{
            await self.sendReply(interaction, `Docker Creator`, `Docker Configuration completed`, defered = 1);
            return;
        }
    },
    curseforge: async (interaction, options, user, channel) => {
        if (!(await self.checkForServerConfig(options.serverid))) {
            await self.sendErrorReply(interaction, `Invalid ServerID`, title = `Invalid Form Input`, defered = 1);
            return;
        }
        let dockerConfig = await self.generateDockerConfigBase(interaction, options, user, channel);

        let cfslug = options.cfslug; // Curseforge only
        let fileid = options.fileid; // Curseforge only
        let cf_api_key = await new Promise((resolve) => {
            query(`SELECT * FROM \`server-config\` WHERE \`id\` = ?`, [config.server.serverid], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0][`curseforge-api-key`] : null);
                }
            });
        });

        let curseforge = {api_key: cf_api_key, slug: cfslug, file_id: fileid};

        let configdata = {};
        
        if (options.extra_args) {
            configdata.extra_args = options.extra_args;
        }
        if (options.jvm_options) {
            configdata.jvm_options = options.jvm_options;
        }

        dockerConfig.platform = `AUTO_CURSEFORGE`;
        dockerConfig.curseforgeconfig = JSON.stringify(curseforge);
        dockerConfig.configdata = JSON.stringify(configdata);
        let insertData = await self.insertDockerConfigInDB(interaction, options, user, channel, dockerConfig);
        if (insertData.code != 0) {
            await self.sendErrorReply(interaction, `${insertData.error}.\nPlease contact <@228573762864283649>`, defered = 1);
            return;
        }else{
            await self.sendReply(interaction, `Docker Creator`, `Docker Configuration completed`, defered = 1);
            return;
        }
    },
    checkForServerConfig: async (id) => {
        let dbserver = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`id\` = ?`, [id], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        return dbserver != null;
    },
    insertDockerConfigInDB: async (interaction, options, user, channel, dockerConfig) => {
        let serverID = await new Promise((resolve) => {
            query(`INSERT INTO \`minecraft-server-docker-config\` SET ?`
                , [dockerConfig], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {

                    resolve(results.insertId);
                }
            });
        });

        let updateInfo = await new Promise((resolve) => {
            query(`UPDATE \`minecraft-servers\` SET \`rconpassword\` = ?, \`extport\` = ?, \`rconport\` = ? WHERE id = ?`, [dockerConfig.rconpassword, dockerConfig.esport, dockerConfig.rport, dockerConfig.serverid], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results);
                }
            });
        });

        if (!serverID && !updateInfo) {
            return {code: 1, error: `Database error durring insert`}
        }else{
            return {code: 0, error: null}
        }
    },
    generateDockerConfigBase: async (interaction, options, user, channel) => {
        let serverid = options.serverid;
        let containername = options.container;
        let image = options.image;
        let maxram = options.maxram;
        let port = options.port;
        let rconport = options.rconport;
        let cpus = options.cpus;
        let lram = options.maxram + 1;

        let configBase = {
            serverid: serverid,
            image: image,
            containername: containername,
            mxram: maxram,
            esport: port,
            rport: rconport,
            rconpassword: util.cookieGenerator.lettersAndNumbers({ lowercase: true, uppercase: true, quantity: 32 }),
            cpus: cpus,
            lram: lram
        }

        return configBase;
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