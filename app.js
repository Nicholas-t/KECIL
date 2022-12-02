require('dotenv').config();

let db = null

const databaseHandler = require('./packages/db/db');
db = new databaseHandler();
const sqlConf = {
    "host": process.env.MY_SQL_HOST || "CHANGE YOUR HOST IN .env",
    "user": process.env.MY_SQL_USER || "CHANGE YOUR USER IN .env",
    "password": process.env.MY_SQL_PWD || "CHANGE YOUR PW IN .env",
    connectTimeout: 30000,
    charset: 'utf8mb4'
}
db.start(sqlConf, () => {
    console.log("SUCCESS CONNECT TO DB")
})

