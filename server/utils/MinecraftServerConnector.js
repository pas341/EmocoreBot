const { Rcon } = require("rcon-client");

var client, guild, query, util, self;


exports.connector = {
    init: async (c, scripts) => {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        self = this.connector;
    },
    getServerInfo: async () => {
        let servers = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\``, [], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results : null);
                }
            });
        });
        return servers;
    },
    getServer: async (sinfo) => {
        let server = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`id\` = ?`, [sinfo], async (error, results, fields) => {
                if (error) {
                    console.error(error);
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
                        console.error(error);
                        resolve(null);
                    } else {
                        resolve(results.length ? results[0] : null);
                    }
                });
            });
        }

        return server;
    },
    getServerByVCCategory: async (categoryId) => {
        let server = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`discordcat\` = ?`, [categoryId], async (error, results, fields) => {
                if (error) {
                    console.error(error);
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
            console.error(`Invalid ServerInfo`);
            console.error(serverinfo);
            return;
        }

        let rconport = serverinfo.rconport;
        let address = serverinfo.domain;
        let rconpassword = serverinfo.rconpassword;


        let connection = await Rcon.connect({ host: address, port: rconport, password: rconpassword });
        return connection;
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
                        console.error(error);
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
                        console.error(error);
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