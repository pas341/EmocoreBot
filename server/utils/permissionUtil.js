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

        let found = 0;

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

        let permissiongroups = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-server-permission-groups\` WHERE \`serverid\` = ? AND \`playerid\` = ?`, [dbserver.id, dbuser.id], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results : null);
                }
            });
        });

        let pgroups = [];

        let pgroupsDB = await new Promise((resolve) => {
            query(`SELECT * FROM \`permission-groups\``, [], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results : null);
                }
            });
        });

        if (permissiongroups) {

            let groupids = [];
            for (let g of permissiongroups) {
                groupids.push(g.groupid);
            }
            
            for (let g of pgroupsDB) {
                if (groupids.includes(g.id)) {
                    pgroups.push(g);
                }
            }

            if (!found) {
                for (let g of pgroups) {
                    console.log(`Required Permission ID: ${p.id}`);
                    console.log(g);
                    let sp = g.permissions.split(`,`);
                    console.log(`Permission Found: ${sp.includes(p.id)}`);
                    if (sp.includes(p.id)) {
                        found = 1;
                        break;
                    }
                }
            }
        }


        if (userperm && !found) {
            found = 1;
        }

        

        return found;
    }
}