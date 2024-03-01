const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']

    let token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        res.status(401).send({ error: true, message: "Token not found" }) // if there isn't any token
        return res.end()
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
        if (err) {
            res.status(401).send({ error: true, message: "Authorization failed!" })
            return res.end();
        }
        if (user != undefined) {
            // req.body.login_user = user;
            // req.params.login_user = user;
            console.log(user)
        }
        // return next();
    })
};
