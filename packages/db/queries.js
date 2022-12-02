/**
 * Store the user hashed passwords
 */
var createPwTable = `
 CREATE TABLE IF NOT EXISTS pw (
    user_id int NOT NULL PRIMARY KEY UNIQUE,
    hashed_password  varchar(100) NOT NULL
 )`;

/**
* Store the user data
*/
var createUserTable = `
CREATE TABLE IF NOT EXISTS user (
    id int PRIMARY KEY AUTO_INCREMENT,  
    first_name  varchar(100) NOT NULL DEFAULT '',
    last_name  varchar(100) NOT NULL DEFAULT '',
    email  varchar(100) NOT NULL DEFAULT '',
    created_at  int(11) NOT NULL DEFAULT 0,
    last_seen  int(11) NOT NULL DEFAULT 0
)`;

/**
* Store the link data
*/
var createLinkTable = `
CREATE TABLE IF NOT EXISTS link (
    id int PRIMARY KEY AUTO_INCREMENT,  
    owner_id int NOT NULL,
    source_id varchar(100) NOT NULL DEFAULT '',
    target_url TEXT NOT NULL,
    created_at int(11) NOT NULL DEFAULT 0
)`;


module.exports = {
    createPwTable,
    createUserTable,
    createLinkTable
}