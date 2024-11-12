var client, guild, query, util, self, docker;
const { Docker } = require('node-docker-api');

exports.d = {
    init: async (c, scripts) => {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        self = this.d;

        docker = new Docker();
    },
    getList: async () => {
        let containers = await docker.container.list();
        return containers;
    },
    getContainer: async (containername) => {
        console.log(`Container: ${containername} requested!`);
        let containers = await docker.container.list();
        console.log(containers);
        for (let c of containers) {
            console.log(c.data.Labels[`com.docker.compose.service`]);
            if (c.data.Labels[`com.docker.compose.service`] == containername) {
                return c;
            }
        }
        console.error(`Docker Container not found!`);
        return null;
    }
}