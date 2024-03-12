const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '..', 'logger', 'log.txt');

dotenv.config();

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']

    let token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        res.status(402).send({ error: true, message: "Token not found" }) // Token doesn't exist
        return res.end()
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        const dateTime = `${new Date().toISOString()}`
        if (err) {
            res.status(401).send({ error: true, message: "Authorization failed!" }) // Token is expired
            return res.end();
        }
        if (user != undefined) {
            req.body.login_user = user;
            req.params.login_user = user;
        }

        // let message = `${this.colors.fg.red}[REQ]${this.colors.RESET} :${this.colors.fg.yellow} ${request['__id']} | Client-Address = ${ipAddress},Request URL = ${requestedUrl}\n${this.colors.RESET}`;

        return next();
    })
};
