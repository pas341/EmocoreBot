var client, guild, query, util, self, perms, permsByKey;

exports.perms = {
    init: async (c, scripts) => {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        self = this;
        perms = await self.perms.fetchPerms();
    },
    fetchPerms: async () => {
        let permissions = await new Promise((resolve) => {
            query(`SELECT * FROM \`permissions\``, [], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results : null);
                }
            });
        });

        permsByKey = {};
        for (let p of permissions) {
            permsByKey[p.name] = p;
        }

        perms = permissions;
    },
    hasPermission: async (user, perm, server, debug=false) => {
        // return 0 if permission is not found for user or if there is a problem finding it
        // returns 1 if permission is granted to user for server or permission is defaulted to 1
        if (debug) {
            console.log(`User: ${user.username}`);
            console.log(`Perm: ${perm}`);
            console.log(`Server: ${server}`);
        }

        if (!permsByKey[perm]) {
            console.error(`Permission not found: ${perm}`);
            return 0;
        }

        let p = permsByKey[perm]; // store permission for rest of check execution

        // check if permission is defaulted to 1
        if (p.default == 1) {
            return 1;
        }

        let dbserver = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`name\` = ?`, [server], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        if (!dbserver) {
            console.error(`Server not found! server: ${server}`);
            return 0;
        }

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

        if (!dbuser) {
            console.error(`User not found in DB by discordId: ${user.id}`);
            return 0;
        }

        let userperm = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-server-permissions\` WHERE \`serverid\` = ? AND \`duid\` = ? AND \`permissonid\``, [dbserver.id, dbuser.id, p.id], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        if (userperm) {
            return 1;
        }else{
            return 0;
        }
    }
}