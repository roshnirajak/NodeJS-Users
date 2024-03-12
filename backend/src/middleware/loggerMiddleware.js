const Logger = require('../logger/logger');
const { v4: uuidv4 } = require('uuid');
const logger = new Logger('path/to/logfile.txt');



const loggerMiddleware = (req, res, next) => {

    console.log("started")
    console.log("body", req.body);
    console.log("rawHeders", req.rawHeaders); //array
    console.log("res", req.res); //object
    console.log("params", req.params); //object 


    const dateTime = new Date().toISOString();
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const requestedUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const uuid = uuidv4();

    console.log("Test Params: ",`${JSON.stringify(req.params)}`) 
    console.log(res)


    const requestBody = { ...req.body };
    let bodyMessage = JSON.stringify(requestBody);

    const requestQuery = { ...req.query };
    let queryMessage = '';
    if (Object.keys(requestQuery).length !== 0) {
        queryMessage = JSON.stringify(requestQuery);
    }   

    // console.log("params: ", paramsMessage);
    // console.log("body: ", requestBody);
    // console.log("query: ", requestQuery);

    // Log the request
    logger.logRequest(dateTime, ipAddress, method, requestedUrl, uuid);
    logger.logInfo(dateTime, uuid, bodyMessage, "paramsMessage", queryMessage, req.method);

    // Log the response
    const originalEnd = res.end;
    res.end = function (...args) {
        const statusCode = res.statusCode;
        logger.logResponse(dateTime, statusCode, uuid);
        return originalEnd.apply(res, args);
    };

    // Log errors
    const originalSend = res.send;
    res.send = function (...args) {
        if (res.statusCode >= 400) {
            const errorMessage = args[0];
            logger.logError(dateTime, errorMessage, uuid);
        }
        return originalSend.apply(res, args);
    };

    // Log warnings
    res.warning = function (warningMessage) {
        logger.logWarning(dateTime, warningMessage, uuid);
    };

    // Log debug messages
    res.debug = function (debugMessage) {
        logger.logDebug(dateTime, debugMessage, uuid);
    };

    next();
};

module.exports = loggerMiddleware;
