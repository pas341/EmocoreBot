var client, guild, query, util, self, docker, config;
const { Docker } = require('node-docker-api');
const { Volume } = require('node-docker-api/lib/volume');

exports.d = {
    init: async (c, scripts) => {
        client = c;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        query = scripts.sql.query;
        util = scripts.util;
        config = scripts.config;
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
        for (let c of containers) {
            if (c.data.Labels[`com.docker.compose.service`] == containername) {
                return c;
            }

            for (let name of c.data.Names) {
                console.log(`Container: ${name} : match: ${containername}`);
                if (name.includes(containername)) {
                    return c;
                }
            }
        }
        console.error(`Docker Container not found!`);
        return null;
    },
    createContainer: async (servername, mcServerID) => {
        let serverConfigurationDB = await new Promise((resolve) => {
            query(`SELECT * FROM \`server-config\` WHERE \`id\` = ?`, [config.server.serverid], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        console.log(serverConfigurationDB);
        console.log(servername);
        let dbserver = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`name\` = ?`, [servername], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        if (!dbserver && mcServerID != null) {
            dbserver = await new Promise((resolve) => {
                query(`SELECT * FROM \`minecraft-servers\` WHERE \`id\` = ?`, [mcServerID], async (error, results, fields) => {
                    if (error) {
                        console.error(error);
                        resolve(null);
                    } else {
                        resolve(results.length ? results[0] : null);
                    }
                });
            });
        }

        if (!dbserver) {
            console.error(`Server not found in DB`);
            return {code: 2, error: `Server not found in database`};
        }

        let dockerConfig = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-server-docker-config\` WHERE \`serverid\` = ?`, [dbserver.id], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });

        if (await self.getContainer(dockerConfig.containername)) {
            console.error(`There is all ready a container running with this name`);
            return {code: 1, error: `Container is all ready running`};
        }

        if (!dockerConfig) {
            console.error(`Docker config not found in DB`);
            return {code: 3, error: `Docker config not found`};
        }

        let ENV = [`EULA=TRUE`];
        ENV.push(`MEMORY=${dockerConfig.mxram}G`);
        ENV.push(`MAX_MEMORY=${dockerConfig.mxram}G`);

        if (dockerConfig.rconpassword) {
            ENV.push(`RCON_PASSWORD=${dockerConfig.rconpassword}`);
        }
        if (dockerConfig.platform==`AUTO_CURSEFORGE`) {
            let cfconfig = JSON.parse(dockerConfig.curseforgeconfig);
            ENV.push(`MODPACK_PLATFORM=AUTO_CURSEFORGE`);
            ENV.push(`CF_API_KEY=${cfconfig.api_key}`);
            ENV.push(`CF_SLUG=${cfconfig.slug}`);
            ENV.push(`CF_FILE_ID=${cfconfig.file_id}`);
        }

        let container = await docker.container.create({
            Image: dockerConfig.image,
            ExposedPorts: {

            },
            Tty: true,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            name: dockerConfig.containername,
            Env: ENV,
            HostConfig: {
                Binds: [`${serverConfigurationDB[`docker-container-base-location`]}/${dockerConfig.containername}:/data`,],
                PortBindings: {
                    "25577/tcp": [{
                        "HostIp": "",
                        "HostPort": ""+dockerConfig.rport
                    }],
                    "25565/tcp": [{
                        "HostIp": "",
                        "HostPort": ""+dockerConfig.esport
                    }],
                },
                Memory: dockerConfig.lram * 1000000000,
                CpusetCpus: dockerConfig.cpus,
            },
        }).then(con => con.start());
        return {code: 0, error: null};

    }
}