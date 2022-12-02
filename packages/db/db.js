var mysql = require('mysql');

var {
    createPwTable,
    createUserTable,
    createLinkTable
} = require('./queries.js');

class databaseHandler {
    /**
     * @constructor
     */
    constructor() {
        this.Description = 'Database Handler for Kecil';
        this.con = null;
    }

    /**
     * start - initialization of database socket
     * @param {object} conf - configurations for database
     * @returns 
     */
    async start(conf, cb) {
        conf.insecureAuth = true;
        this.con = mysql.createConnection(conf);

        this.con.connect(function (err) {
            if (err) {
                console.log(err)
            }
        });
        this.con.query("CREATE DATABASE IF NOT EXISTS kecil", function (err, result) {
            if (err) {
                console.log(err)
            }
        });
        this.con.query("use kecil", function (err, result) {
            if (err) {
                console.log(err)
            }
        });
        this.createTable(createPwTable, "pw");

        this.createTable(createUserTable, "user");

        this.createTable(createLinkTable, "link");
        cb()
    }

    /**
     * createTable - helper function to run query
     * 
     * @param {String} query 
     */
    async createTable(query) {
        this.con.query(query, function (err, result) {
            if (err) {
                console.log(err)
            }
        });
    }
}

module.exports = databaseHandler;
