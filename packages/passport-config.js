require('dotenv').config();

const localStrategy = require('passport-local').Strategy // using email and password

const bcrypt = require('bcrypt')


/**
 * initialization for passport library for login, and logout
 */
function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        await getUserByEmail(email, async (err, user) => {
            try {
                if (user.length === 0) {
                    return done(null, null, { message: 'user_not_found' })
                } else {
                    let possibleUsers = []
                    for (let i = 0; i < user.length; i++) {
                        if (await bcrypt.compare(password, user[i].hashed_password)) {
                            possibleUsers.push(user[i])
                        }
                    }
                    if (possibleUsers.length) {
                        return done(null, possibleUsers)
                    } else {
                        return done(null, null, { message: 'incorrect_password' })
                    }
                }
            } catch (e) {
                return done(e, null, { message: 'internal_error' })
            }
        })
    }

    passport.use(new localStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => getUserById(id, (err, result) => {
        done(err, result)
    }))
}

module.exports = initialize