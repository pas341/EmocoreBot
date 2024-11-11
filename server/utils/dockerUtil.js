var client, guild, query, util, self, docker;
const {Docker} = require('node-docker-api');

exports.docker = {
    init: async (c, scripts) => {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        self = this;

        docker = new Docker();
    },
    getList: async () => {
        let containers = await docker.container.list();
	    console.log();
        return containers;
    },
    getContainer: async (containername) => {
        let containers = await docker.container.list();
        for (let c of containers) {
            console.log(c);
            for (let n of c.data.Names) {
                if (n == containername) {
                    return c;
                }
            }
        }
        console.error(`Docker Container not found!`);
        return null;
    }
}