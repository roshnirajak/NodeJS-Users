const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '..', 'logger', 'log.txt');

dotenv.config();

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']

    console.log(authHeader);

    let token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        res.status(402).send({ error: true, message: "Token not found" }) // Token doesn't exist
        return res.end()
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        const dateTime = `${new Date().toISOString()}`
        if (err) {
            res.status(401).send({ error: true, message: "Authorization failed!" }) // Token is expired
            if (err) {
                let logMessage = `[ERROR] ${dateTime}\n`;
                fs.appendFile(logFilePath, logMessage, (err) => {
                    if (err) {
                        console.error('Error writing to log file:', err);
                    }
                });
            }
            return res.end();
        }
        if (user != undefined) {
            req.body.login_user = user;
            req.params.login_user = user;
            console.log(user)
        }


        // console.log(req)
        // let ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();
        let ipAddress =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        if (ipAddress.includes(',')) {
            ipAddress = ipAddress.split(',')[0];
        }
        console.log("ipaddress", ipAddress)
        const requestBody = { ...req.body };
        delete requestBody.login_user;

        
        const admin_uuid = `${user.uuid}`
        const method = `${req.method}`
        const requestedUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

        let logMessage = `[REQ] : ${dateTime} ${admin_uuid} | [${method}] URL = ${requestedUrl} | Client Address = ${ipAddress}`;


        let bodyMessage = '';
        if (Object.keys(requestBody).length !== 0) {
            bodyMessage = JSON.stringify(requestBody);
        }

        // Add Request Body section only if requestBody is not empty
        const fullLogMessage = bodyMessage ? `${logMessage} | Request Body: ${bodyMessage}\n` : `${logMessage}\n`;

        // let message = `${this.colors.fg.red}[REQ]${this.colors.RESET} :${this.colors.fg.yellow} ${request['__id']} | Client-Address = ${ipAddress},Request URL = ${requestedUrl}\n${this.colors.RESET}`;

        return next();
    })
};
