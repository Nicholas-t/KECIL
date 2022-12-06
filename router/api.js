require('dotenv').config();

const {
    makeId, getCurrentTime,
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

var express = require('express');
var router = express.Router()

router.get("/user/links", (req, res) => {
    db.getXbyY("link", "owner_id", req.user[0].id, (err, result) => {
        res.json({
            error: err,
            result
        })
    })
})


router.post("/link/add", (req, res) => {
    db.getXbyY("link", "source_id", req.body.source_id, (err, result) => {
        if (result.length == 0) {
            let linkToAdd = req.body
            linkToAdd.owner_id = req.user[0].id
            linkToAdd.created_at = getCurrentTime()
            db.add("link", linkToAdd, (err, result) => {
                if (err) {
                    res.redirect("/error")
                } else {
                    res.redirect("/")
                }
            })
        } else {
            res.redirect("/error")
        }
    })
})

router.post("/link/delete/:link_id", (req, res) => {
    db.getXbyY("link", "id", req.params.link_id, (err, result) => {
        if (result.length == 1) {
            if (req.user[0].id == result[0].owner_id) {
                db.remove("link", "id", req.params.link_id, (err, result) => {
                    if (err) {
                        res.redirect("/error")
                    } else {
                        res.redirect("/")
                    }
                })
            } else {
                res.redirect("/error")
            }
        } else {
            res.redirect("/error")
        }
    })
})

router.get("/free-link", (req, res) => {
    let uniqueId = makeId(6)
    db.getXbyY("link", "id", uniqueId, (err, result) => {
        if (!err) {
            res.json({
                uniqueId,
                inDb: result.length > 0
            })
        } else {
            res.json({
                error: err
            })
        }
    })
})

module.exports = router