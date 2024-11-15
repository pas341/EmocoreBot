const { Rcon } = require("rcon-client");

var client, guild, query, util, config, self, logger;


exports.connector = {
    init: async (c, scripts) => {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        logger = scripts.logger;
        config = scripts.config;
        self = this.connector;
    },
    getServerInfo: async (options) => {
        console.log(options);
        if (!options) {
            options = {selector: `local`};
        }
        let selectSTMT = ``;
        if (options.selector == `local`) {
            selectSTMT = `SELECT * FROM \`minecraft-servers\` WHERE \`servertoken\` = ? ORDER BY \`extport\``;
        }else if (options.selector == `all`) {
            selectSTMT = `SELECT * FROM \`minecraft-servers\` ORDER BY \`extport\``;
        }

        console.log(options);

        let servers = await new Promise((resolve) => {
            query(selectSTMT, [config.server.servertoken], async (error, results, fields) => {
                if (error) {
                    logger.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results : null);
                }
            });
        });

        if (servers) {
            for (let s of servers) {
                let dockerinfo = await new Promise((resolve) => {
                    query(`SELECT * FROM \`minecraft-server-docker-config\` WHERE \`serverid\` = ?`, [s.id], async (error, results, fields) => {
                        if (error) {
                            logger.error(error);
                            resolve(null);
                        } else {
                            resolve(results.length ? results[0] : null);
                        }
                    });
                });
                
                if (dockerinfo) {
                    s.dockerConfig = dockerinfo;
                }
            }
        }

        return servers;
    },
    getServer: async (sinfo) => {
        let server = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`id\` = ?`, [sinfo], async (error, results, fields) => {
                if (error) {
                    logger.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });
        if (!server) {
            server = await new Promise((resolve) => {
                query(`SELECT * FROM \`minecraft-servers\` WHERE \`name\` = ?`, [sinfo], async (error, results, fields) => {
                    if (error) {
                        logger.error(error);
                        resolve(null);
                    } else {
                        resolve(results.length ? results[0] : null);
                    }
                });
            });
        }

        if (server) {
            let dockerinfo = await new Promise((resolve) => {
                query(`SELECT * FROM \`minecraft-server-docker-config\` WHERE \`serverid\` = ?`, [server.id], async (error, results, fields) => {
                    if (error) {
                        logger.error(error);
                        resolve(null);
                    } else {
                        resolve(results.length ? results[0] : null);
                    }
                });
            });
            if (dockerinfo) {
                server.dockerConfig = dockerinfo;
            }
        }

        return server;
    },
    getServerByVCCategory: async (categoryId) => {
        let server = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`discordcat\` = ?`, [categoryId], async (error, results, fields) => {
                if (error) {
                    logger.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        return server;
    },
    connect: async (serverinfo) => {
        if (serverinfo == null) {
            logger.error(`Invalid ServerInfo`);
            logger.error(serverinfo);
            return;
        }

        let rconport = serverinfo.dockerConfig ? serverinfo.dockerConfig.rport : serverinfo.rconport;
        let rconpassword = serverinfo.dockerConfig ? serverinfo.dockerConfig.rconpassword : serverinfo.rconpassword;
        let address = serverinfo.domain;

        try {
            let connection = await Rcon.connect({ host: address, port: rconport, password: rconpassword });
            return connection;
        }catch (e) {
            logger.error(`[minecraftServerConnector.js] : [connect()] Server connection is not avalible for this server: ${serverinfo.name}:${serverinfo.id}`);
            return null;
        }
    },
    whitelist_on: async (connection) => {
        return await self.exec(connection, `whitelist on`);
    },
    whitelist_off: async (connection) => {
        return await self.exec(connection, `whitelist off`);
    },
    whitelist_add: async (connection, username, user) => {
        if (username) {
            return await self.exec(connection, `whitelist add ${username}`);
        } else {
            let dbuser = await new Promise((resolve) => {
                query(`SELECT * FROM \`discord-minecraft-accounts\` WHERE \`duid\` = ?`, [user.id], async (error, results, fields) => {
                    if (error) {
                        console.error(error);
                        resolve(null);
                    } else {
                        resolve(results.length ? results[0] : null);
                    }
                });
            });
            return await self.exec(connection, `whitelist add ${dbuser.mname}`);
        }
    },
    whitelist_remove: async (connection, username, user) => {
        if (username) {
                return await self.exec(connection, `whitelist remove ${username}`);
        } else {
            let dbuser = await new Promise((resolve) => {
                query(`SELECT * FROM \`discord-minecraft-accounts\` WHERE \`duid\` = ?`, [user.id], async (error, results, fields) => {
                    if (error) {
                        logger.error(error);
                        resolve(null);
                    } else {
                        resolve(results.length ? results[0] : null);
                    }
                });
            });
            return await self.exec(connection, `whitelist remove ${dbuser.mname}`);
        }
    },
    kick: async (connection, username, user, reason) => {
        if (username) {
            if (reason) {
                return await self.exec(connection, `kick ${username} ${reason}`);
            }else{
                return await self.exec(connection, `kick ${username}`);
            }
        } else {
            let dbuser = await new Promise((resolve) => {
                query(`SELECT * FROM \`discord-minecraft-accounts\` WHERE \`duid\` = ?`, [user.id], async (error, results, fields) => {
                    if (error) {
                        logger.error(error);
                        resolve(null);
                    } else {
                        resolve(results.length ? results[0] : null);
                    }
                });
            });
            if (reason) {
                return await self.exec(connection, `kick ${dbuser.mname} ${reason}`);
            }else{
                return await self.exec(connection, `kick ${dbuser.mname}`);
            }
        }
    },
    exec: async (connection, cmd) => {
        return await connection.send(cmd);
    }
};
