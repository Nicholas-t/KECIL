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


var express = require('express');
var bodyParser = require('body-parser');

var app = express()

app.use('/pages', express.static(__dirname + '/public/pages'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/partials', express.static(__dirname + '/public/partials'));
app.use('/scss', express.static(__dirname + '/public/scss'));
app.use('/vendors', express.static(__dirname + '/public/vendors'));
app.use('/images', express.static(__dirname + '/public/images'));

// FOR LOGGING
app.use((req, res, next) => {
    console.log(`[${(new Date()).toISOString()}] ${req.path} - IP : ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`)
    next()
})

const urlencodedParser = bodyParser.urlencoded({ extended: true })

app.engine('html', require('ejs').renderFile);
app.use(urlencodedParser)
app.use(express.urlencoded({ extended: false }))


app.get('/', function (req, res) {
    res.render(__dirname + '/public/pages/home.html')
})

app.get('/login', function (req, res) {
    res.render(__dirname + '/public/pages/auth/login.html')
})

app.get('/forgot-password', function (req, res) {
    res.render(__dirname + '/public/pages/auth/forgot-password.html')
})

app.get('/register', function (req, res) {
    res.render(__dirname + '/public/pages/auth/register.html')
})

app.get('/setting', function (req, res) {
    res.render(__dirname + '/public/pages/setting.html')
})

app.get('/error', function (req, res) {
    res.render(__dirname + '/public/pages/error.html')
})

app.get('/logout', function (req, res) {
    res.redirect("/login")
})

const server = app.listen(7000, () => {
    console.log('Express listening at ', 7000);
})