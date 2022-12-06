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
const session = require('express-session');
const passport = require('passport');
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

// FOR SESSION
app.use(
    session({
        secret: process.env.SESSION_SECRET
            ? process.env.SESSION_SECRET
            : "secret",
        resave: false,
        saveUninitialized: false,
        cookie: { expires: new Date(253402300000000) }
    })
)
app.use(passport.initialize())
app.use(passport.session())


app.use('/api', require("./router/api"))
app.use('/auth', require("./router/auth"))

app.use('/', (req, res, next) => {
    if (req.path.split("/").length == 2
        && ![
            "login", "register", "setting", "error", "logout"
        ].includes(req.path.split("/")[1])) {
        let source_id = req.path.split("/")[1]
        if (source_id !== "") {
            db.getXbyY("link", "source_id", source_id, (err, result) => {
                if (result.length != 0) {
                    res.redirect(result[0].target_url)
                } else {
                    next()
                }
            })
        } else {
            next()
        }
    } else {
        next()
    }
})

app.get('/', function (req, res) {
    if (!req.user) {
        res.redirect("/login")
    } else {
        let userId = req.user[0].id
        res.render(__dirname + '/public/pages/home.html', {
            userId
        })
    }
})

app.get('/login', function (req, res) {
    if (req.user) {
        res.redirect("/")
    } else {
        res.render(__dirname + '/public/pages/auth/login.html')
    }
})

app.get('/forgot-password', function (req, res) {
    res.render(__dirname + '/public/pages/auth/forgot-password.html')
})

app.get('/register', function (req, res) {
    if (req.user) {
        res.redirect("/")
    } else {
        res.render(__dirname + '/public/pages/auth/register.html')
    }
})

app.get('/setting', function (req, res) {
    if (!req.user) {
        res.redirect("/login")
    } else {
        res.render(__dirname + '/public/pages/setting.html', {
            ...req.user[0]
        })
    }
})

app.get('/error', function (req, res) {
    res.render(__dirname + '/public/pages/error.html')
})

app.get('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
})

const server = app.listen(7000, () => {
    console.log('Express listening at ', 7000);
})