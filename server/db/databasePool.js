const mysql = require(`mysql`);
const cred = require(`../config/config.json`)[`database`];

exports.conn = {
    init: function (s) {
        scripts = s;
        return new Promise((resolve, reject) => {
            let handler = (error, conn) => {
                if (error) {
                    console.log(`[ERROR] ${s.util.prettyDate()}`);
                    reject(error);
                } else {
                    resolve(pool);
                }
            };

            let pool = mysql.createPool(this.serverDetails);
            pool.getConnection(handler);
            console.log(`Database Connected: ${this.serverDetails.database}`);
        });
    },
    serverDetails: {
        connectionLimit: 100,
        host: cred[`database_host`],
        user: cred[`database_user`],
        password: cred[`database_pass`],
        database: cred[`database_schema`],
    },
};

let pool1;

exports.query = {
    bind: p => pool1 = p,
    execute: (statement, details, callback) => {
        if (details) {
            pool1.query(statement, details, function (error, results, fields) {
                callback(error, results, fields);
            });
        } else {
            pool1.query(statement, function (error, results, fields) {
                callback(error, results, fields);
            });
        }
    }
};

exports.con2 = {
    init: function (s) {
        scripts = s;
        return new Promise((resolve, reject) => {
            let handler = (error, conn) => {
                if (error) {
                    console.log(`[ERROR] ${s.util.prettyDate()}`);
                    reject(error);
                } else {
                    resolve(pool);
                }
            };

            let pool = mysql.createPool(this.serverDetails);
            pool.getConnection(handler);
            console.log(`Database Connected: ${this.serverDetails.database}`);
        });
    },
    serverDetails: {
        connectionLimit: 100,
        host: cred[`database_host`],
        user: cred[`database_user`],
        password: cred[`database_pass`],
        database: cred[`database_schema2`],
    },
};

let pool2;

exports.query2 = {
    bind: p => pool2 = p,
    execute: (statement, details, callback) => {
        if (details) {
            pool2.query(statement, details, function (error, results, fields) {
                callback(error, results, fields);
            });
        } else {
            pool2.query(statement, function (error, results, fields) {
                callback(error, results, fields);
            });
        }
    }
};

exports.functions = {
    escape: (value) => {
        return pool1.escape(value);
    }
}