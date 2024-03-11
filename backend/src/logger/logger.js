const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '.', 'log.txt');

const requestLogger = (req, res, next) => {
    let uuid = '';

    try {
        if (req.body && req.body.login_user && req.body.login_user.uuid) {
            uuid = req.body.login_user.uuid;
        }
    } catch (error) {
        uuid = '';
        console.error('Error getting UUID:', error);
    }

    console.log('uuid: ', uuid)
    
    const dateTime = new Date().toISOString();
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const requestedUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const requestBody = { ...req.body };
    delete requestBody.login_user;
    let bodyMessage = '';
    if (Object.keys(requestBody).length !== 0) {
        bodyMessage = JSON.stringify(requestBody);
    }


    const logMessage = `[REQ] : ${dateTime} ${uuid} | [${method}] URL = ${requestedUrl} | Client Address = ${ipAddress}`;
    const fullLogMessage = bodyMessage ? `${logMessage} | Params: ${bodyMessage}\n` : `${logMessage}\n`;

    console.log(logMessage);

    fs.appendFile(logFilePath, fullLogMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
    next();
};

const responseLogger = (req, res, next) => {
    const dateTime = new Date().toISOString();
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const requestedUrl = req.originalUrl;

    res.on('finish', () => {
        const { statusCode } = res;
        const logMessage = `[RES] : ${dateTime} | [${method}] | Response Status = ${statusCode}\n`;
        console.log(logMessage);
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    });
    next();
};

const errorLogger = (err, req, res, next) => {
    const dateTime = new Date().toISOString();
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const requestedUrl = req.originalUrl;

    const logMessage = `[ERROR] : ${dateTime} | [${method}] URL = ${requestedUrl} | Client Address = ${ipAddress} | Error = ${err.message}\n`;
    console.error(logMessage);

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
    next(err);
};

module.exports = {
    requestLogger,
    responseLogger,
    errorLogger
}