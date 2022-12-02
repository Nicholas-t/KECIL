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

    /**
    * getXbyY - a filtering function for mysql to make process easier
    * 
    * @param {String} X 
    * @param {String} Y 
    * @param {Value} value 
    */
    getXbyY(X, Y, value, cb) {
        const query = `SELECT * FROM ${X} WHERE ${Y} = '${value}'`;
        this.con.query(query, cb);
    }

    /**
    * add - add object to database
    * 
    * @param {String} item 
    * @param {Object} object
    * @param {Function} cb
    */
    add(item, object, cb) {
        let query = this._formatObjectToAddQuery(item, object);
        this.con.query(query, cb);
    }

    /**
    * remove - remove object to database
    * 
    * @param {String} item 
    * @param {String} key
    * @param {Number / String} value 
    * @param {Function} cb
    */
    remove(item, key, value, cb) {
        let v = this._formatValueForQuery(value)
        let query = `DELETE FROM ${item} WHERE ${key} = ${v}`
        this.con.query(query, cb);
    }

    /**
    * modify - modify object to database
    * 
    * @param {String} item 
    * @param {Object} newRow
    * @param {String} whereKey
    * @param {Number / String} whereValue 
    * @param {Function} cb
    */
    modify(item, newRow, whereKey, whereValue, cb) {
        let setCommands = [];
        let keys = Object.keys(newRow)
        for (let i = 0; i < keys.length; i++) {
            if (newRow[keys[i]]) {
                setCommands.push(`${keys[i]} = ${this._formatValueForQuery(newRow[keys[i]])}`)
            }
        }
        if (setCommands.length !== 0) {
            let whereV = this._formatValueForQuery(whereValue)
            let query = `UPDATE ${item} SET ${setCommands.join(", ")} where ${whereKey} = ${whereV}`;
            this.con.query(query, cb);
        } else {
            cb("Nothing has changed", [])
        }
    }

    /**
    * getRowCount - get row count of a table
    * @param {String} item - name of item / table
    * @param {Function} cb 
    */
    getRowCount(item, cb) {
        let query = `SELECT COUNT(*) FROM ${item};`
        this.con.query(query, cb);
    }

    /**
    * getRowCountWhereY - get row count of a table with a filter
    * @param {String} item - name of item / table
    * @param {String} Y - name of column
    * @param {String/Number} value
    * @param {Function} cb 
    */
    getRowCountWhereY(item, Y, value, cb) {
        let query = `SELECT COUNT(*) as count FROM ${item} WHERE ${Y}=${this._formatValueForQuery(value)};`
        this.con.query(query, cb);
    }

    /**
    * getRowCountWhereYGroupBy - get row count of a table with a filter and grouped
    * @param {String} item - name of item / table
    * @param {String} Y - name of column
    * @param {String/Number} value
    * @param {String} groupBy - columns to group by
    * @param {Function} cb 
    */
    getRowCountWhereYGroupBy(item, Y, value, groupBy, cb) {
        let query = `SELECT COUNT(*) as count FROM ${item} WHERE ${Y}=${this._formatValueForQuery(value)} GROUP BY ${groupBy};`
        this.con.query(query, cb);
    }

    /**
    * getUserByEmailWithPw - get user by email with password
    * @param {email} email 
    * @param {function} cb 
    */
    getUserByEmailWithPw(email, cb) {
        let query = `SELECT user.*, pw.hashed_password 
        FROM user 
        LEFT JOIN pw
        ON  user.id = pw.user_id
        WHERE user.email='${email}'`
        this.con.query(query, cb);
    }


    //HELPER FUNCTION
    /**
    * _formatObjectToAddQuery - formatting object to become an add SQL Query
    * @param {String} item - name of object / table in db
    * @param {Object} object - object that wants to be added to the db
    * @returns string query for add SQL
    */
    _formatObjectToAddQuery(item, object) {
        var values = Object.values(object)
        var valuesList = []
        var keyList = []
        for (let i = 0; i < values.length; i++) {
            if (typeof (values[i]) == 'number') {
                valuesList.push(`${values[i]} `)
                keyList.push(Object.keys(object)[i])
            } else if (typeof (values[i]) == 'boolean') {
                valuesList.push(`${values[i]} `)
                keyList.push(Object.keys(object)[i])
            } else if (typeof (values[i]) == 'string') {
                valuesList.push(`'${values[i].split("'").join("\"").split("`").join("\`")}'`)
                keyList.push(Object.keys(object)[i])
            } else {
                console.error(`invalid type of object : ${values[i]} (${typeof (values[i])})`)
                //valuesList.push(`NULL`)
            }
        }
        var valuesString = valuesList.join(", ")
        var keysString = keyList.join(", ")
        return `INSERT INTO ${item} (${keysString}) 
        VALUES(${valuesString})`;
    }

    /**
    * _formatValueForQuery - format value to make sure it is coherent with the string format of SQL query
    * @param {*} value - any arbitrary value 
    * @returns 
    */
    _formatValueForQuery(value) {
        if (typeof (value) == 'number') {
            return `${value}`
        } else if (typeof (value) == 'string') {
            return `'${value.replace("'", "\"")}'`
        } else {
            console.error(`invalid type of object : ${value} (${typeof (value)})`)
            return value
        }
    }
}

module.exports = databaseHandler;
