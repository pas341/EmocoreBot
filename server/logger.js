var self, logger;

const config = {
    appname: "DEFAULT APP NAME",
    appnameset: 0,
    debug: 1,
    startup: 1,
    info: 1
}

const util = {
    console: {
        codes: {
            blue: `\x1b[34m`,
            blue2: `\x1b[94m`,
            bold: `\x1b[1m`,
            cyan: `\x1b[36m`,
            cyan2: `\x1b[96m`,
            green: `\x1b[92m`,
            green2: `\x1b[42m`,
            italic: `\x1b[3m`,
            magenta: `\x1b[35m`,
            magenta2: `\x1b[95m`,
            normal: `\x1b[0m`,
            red: `\x1b[91m`,
            red2: `\x1b[41m`,
            underscore: `\x1b[4m`,
            white: `\x1b[37m`,
            white2: `\x1b[97m`,
            yellow: `\x1b[33m`,
            yellow2: `\x1b[93m`,
        },
        colorend: `\x1b[0m`,
        colorify: (text = ``, code = ``) => {
            return `${util.console.codes[code] || util.console.codes[`normal`]}${text}${util.console.colorend}`
        },
    },
}


exports.logger = {
    init: (c = null, appname = null) => {
        self = this;
        logger = this.logger;
        if (c) {
            if (c.appinfo) {
                config.appname = c.appinfo.name;
                config.appnameset = 1;
            }else if (appname) {
                config.appname = appname;
                config.appnameset = 1;
            }
        }else if (appname) {
            config.appname = appname;
            config.appnameset = 1;
        }
    },
    log: (out, tag, tagcolor = `normal`, textcolor = `normal`) => {
        let output = out;
        if (tag) {
            if (config.appnameset) {
                output = `${util.console.colorify(`::`, `cyan`)} ${util.console.colorify(`[${config.appname}]`, textcolor)} ${util.console.colorify(`:`, `cyan`)} ${util.console.colorify(`${tag}`, tagcolor)} ${util.console.colorify(`:`, `cyan`)} ${util.console.colorify(out, textcolor)}`;
            }else{
                output = `${util.console.colorify(`::`, `cyan`)} ${util.console.colorify(`${tag}`, tagcolor)} : ${util.console.colorify(out, textcolor)}`;
            }
        }
        console.log(output);
    },
    debug: (out) => {
        if (config.debug) {
            logger.log(out, `[DEBUG]`, tagcolor = `magenta2`, textcolor = `green`);
        }
    },
    startup: (out) => {
        if (config.startup) {
            logger.log(out, `[STARTUP]`, tagcolor = `white`, textcolor = `green`);
        }
    },
    info: (out) => {
        if (config.info) {
            logger.log(out, `[INFO]`, tagcolor = `green`, textcolor = `green`);
        }
    },
    warn: (out) => {
        logger.log(out, `[WARN]`, tagcolor = `yellow2`, textcolor = `yellow2`);
    },
    error: (out) => {
        logger.log(out, `[ERROR]`, tagcolor = `red`, textcolor = `red`);
    },
    fatal: (out) => {
        logger.log(out, `[FATAL]`, tagcolor = `red2`, textcolor = `red2`);
    },
    raw: (out) => {
        console.log(out);
    },
}



