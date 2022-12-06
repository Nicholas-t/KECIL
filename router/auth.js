require('dotenv').config();
var bcrypt = require('bcrypt');

const {
    getCurrentTime
} = require('../packages/util')

let db = null

const databaseHandler = require('../packages/db/db');
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


const passport = require('passport');


const initializePassport = require("../packages/passport-config")
initializePassport(
    passport,
    (email, cb) => db.getUserByEmailWithPw(email, cb),
    (id, cb) => db.getUserById(id, cb)
)


var express = require('express');
var router = express.Router()


router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, users, info) {
        if (err) {
            return next(err);
        } else if (!users) {
            return res.redirect(`/login/?error=${info.message}`)
        } else {
            const user = users[0]
            return req.login(user, loginErr => {
                if (loginErr) {
                    return next(loginErr);
                } else {
                    db.modify("user", {
                        last_seen: getCurrentTime()
                    }, "id", user.id, () => {
                        res.redirect(`/`)
                    })
                }
            });
        }
    })(req, res, next);
});

router.post('/register', function (req, res, next) {
    db.getXbyY("user", "email", req.body.email, (err, result) => {
        if (result.length != 0) {
            res.redirect(`/login`)
        } else {
            let newUser = {}
            newUser.first_name = req.body.first_name
            newUser.last_name = req.body.last_name
            newUser.email = req.body.email
            newUser.created_at = getCurrentTime()
            db.add("user", newUser, async (err, result) => {
                if (err) {
                    console.log(err)
                    res.redirect("/error")
                } else {
                    db.getXbyY("user", "email", newUser.email, async (err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            let hashedPassword = await bcrypt.hash(req.body.password, 10)
                            let userPw = {}
                            userPw.user_id = result[0].id
                            userPw.hashed_password = hashedPassword
                            db.add("pw", userPw, (err, result) => {
                                if (err) {
                                    res.redirect("/error")
                                } else {
                                    res.redirect(`/login`)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/reset-password', async function (req, res, next) {
    if (!req.user) {
        res.redirect('/error')
    } else {
        let userId = req.user[0].id
        db.getXbyY("pw", "user_id", userId, async (err, result) => {
            if (await bcrypt.compare(req.body.cur_pw, result[0].hashed_password)) {
                let hashedPassword = await bcrypt.hash(req.body.new_pw, 10)
                db.modify("pw", {
                    hashed_password: hashedPassword
                }, "user_id", userId, async (err, result) => {
                    if (err) {
                        console.log(err)
                        res.redirect("/error")
                    } else {
                        res.redirect(`/setting`)
                    }
                })
            } else {
                res.redirect("/error")
            }
        })
    }
})

router.post('/modify', async function (req, res, next) {
    if (!req.user) {
        res.redirect('/error')
    } else {
        let userId = req.user[0].id
        let newUserData = { ...req.body, last_seen: getCurrentTime() }
        db.modify("user", newUserData, "id", userId, async (err, result) => {
            if (err) {
                res.redirect("/error")
            } else {
                res.redirect(`/setting`)
            }
        })
    }
})


module.exports = router