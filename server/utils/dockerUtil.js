var client, guild, query, util, self, docker, config, logger;
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
        logger = scripts.logger;

        docker = new Docker();
    },
    getList: async () => {
        let containers = await docker.container.list();
        return containers;
    },
    getContainer: async (containername) => {
        try {
            let containers = await docker.container.list({all: true});
            for (let c of containers) {
                if (c.data.Labels[`com.docker.compose.service`] == containername) {
                    return c;
                }
    
                for (let name of c.data.Names) {
                    if (name.includes(containername)) {
                        return c;
                    }
                }
            }
            logger.error(`[dockerUtil.js] : [getContainer()] Docker Container not found!`);
            return null;
        }catch (e) {
            logger.error(`[dockerUtil.js] : [getContainer()] Docker is not avalible on the server`);
            return null;
        }
        
    },
    createContainer: async (servername, mcServerID) => {
        let serverConfigurationDB = await new Promise((resolve) => {
            query(`SELECT * FROM \`servers\` WHERE \`token\` = ?`, [config.server.servertoken], async (error, results, fields) => {
                if (error) {
                    console.error(error);
                    resolve(null);
                } else {
                    resolve(results.length ? results[0] : null);
                }
            });
        });
        console.log(config.server.servertoken);
        let dbserver = await new Promise((resolve) => {
            query(`SELECT * FROM \`minecraft-servers\` WHERE \`name\` = ? AND \`servertoken\` = ?`, [servername, config.server.servertoken], async (error, results, fields) => {
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
                query(`SELECT * FROM \`minecraft-servers\` WHERE \`id\` = ? AND \`servertoken\` = ?`, [mcServerID, config.server.servertoken], async (error, results, fields) => {
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
            //error info servername and mcServerID should not both be set so it is normal to see that one is null
            logger.error(`[dockerUtil.js] : [createContainer()] Server not found in DB: ${servername}:${mcServerID} [servername:serverid]`);
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


        if (!dockerConfig) {
            logger.error(`[dockerUtil.js] : [createContainer()] Docker config not found in DB`);
            return {code: 3, error: `Docker config not found`};
        }

        if (await self.getContainer(dockerConfig.containername)) {
            logger.error(`[dockerUtil.js] : [createContainer()] There is all ready a container running with this name: (${dockerConfig.containername})`);
            return {code: 1, error: `Container is all ready running`};
        }


        let ENV = [`EULA=TRUE`];
        ENV.push(`MEMORY=${dockerConfig.mxram}G`);
        ENV.push(`MAX_MEMORY=${dockerConfig.mxram}G`);

        if (dockerConfig.extraenv) {
            let envData = JSON.parse(dockerConfig.extraenv);
            for (let e of envData) {
                let key = e.key;
                let value = e.value;
                ENV.push(`${key}=${value}`);
            }
        }

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

        if (dockerConfig.platform==`CUSTOM`) {
            let configdata = JSON.parse(dockerConfig.configdata);
            if (!configdata) {
                logger.error(`Docker config: configdata is required to use server type custom`);
                return {code: 4, error: `Docker config: configdata is required to use server type custom`};
            }
            ENV.push(`TYPE=CUSTOM`);
            ENV.push(`CUSTOM_SERVER=${configdata.custom_server}`);
        }

        if (dockerConfig.platform==`FORGE`) {
            let configdata = JSON.parse(dockerConfig.configdata);
            if (!configdata) {
                logger.error(`Docker config: configdata is required to use server type custom`);
                return {code: 4, error: `Docker config: configdata is required to use server type custom`};
            }
            ENV.push(`TYPE=FORGE`);
            ENV.push(`VERSION=${dbserver.mcversion}`);
            ENV.push(`FORGE_VERSION=${configdata.forgeversion}`);
        }

        if (dockerConfig.platform==`NEOFORGE`) {
            let configdata = JSON.parse(dockerConfig.configdata);
            if (!configdata) {
                logger.error(`Docker config: configdata is required to use server type custom`);
                return {code: 4, error: `Docker config: configdata is required to use server type custom`};
            }
            ENV.push(`TYPE=NEOFORGE`);
            ENV.push(`VERSION=${dbserver.mcversion}`);
            ENV.push(`NEOFORGE_VERSION=${configdata.neoforgeversion}`);
        }

        if (dockerConfig.configdata) {
            let configdata = JSON.parse(dockerConfig.configdata);
            if (configdata.extra_args) {
                ENV.push(`EXTRA_ARGS=${configdata.extra_args}`);
            }
            if (configdata.jvm_options) {
                ENV.push(`JVM_OPTS=${configdata.jvm_options}`);
            }
            if (configdata.server_port) {
                ENV.push(`SERVER_PORT=${configdata.server_port}`);
            }
        }

        let expPorts = {};
        expPorts["25575/tcp"] = {};
        expPorts["25565/tcp"] = {};

        let container = await docker.container.create({
            Image: dockerConfig.image,
            Tty: true,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            name: dockerConfig.containername,
            Env: ENV,
            ExposedPorts: expPorts,
            HostConfig: {
                Binds: [`${serverConfigurationDB[`docker-container-base-location`]}/${dockerConfig.containername}:/data`,],
                PortBindings: {
                    "25575/tcp": [{
                        "HostPort": ""+dockerConfig.rport
                    }],
                    "25565/tcp": [{
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