const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '.', 'log.txt');
class Logger {
    

    logRequest(dateTime, ipAddress, method, requestedUrl, uuid) {
        const logMessage = `${dateTime}: [REQ] : ${uuid} | Client Address = ${ipAddress}, Request URL= ${requestedUrl}\n`;
        this.writeLogs(logMessage);
    }

    logResponse(dateTime, statusCode, uuid) {
        const logMessage = `${dateTime}: [RES] : ${uuid} | Response Status = ${statusCode}\n`;
        this.writeLogs(logMessage);
    }

    logError(dateTime, errorMessage, uuid) {
        const logMessage = `${dateTime}: [ERR] : ${uuid} | Message = ${errorMessage}\n`;
        this.writeLogs(logMessage);
    }

    logWarning(dateTime, warningMessage, uuid) {
        const logMessage = `${dateTime}: [WAR] : ${uuid} | Message = ${warningMessage}\n`;
        this.writeLogs(logMessage);
    }

    logDebug(dateTime, debugMessage, uuid = '') {
        const logMessage = `${dateTime}; [DEB] : ${uuid} | Message = ${debugMessage}\n`;
        this.writeLogs(logMessage);
    }

    logInfo(dateTime, uuid, body, params, query, method) {
        const logMessage = `${dateTime}: [INF] : ${uuid} | Method = ${method}| Body = ${body} | Params = ${params} | Query = ${query}\n`;
        this.writeLogs(logMessage);
    }

    logStartServer() {
        const logMessage = `Server started`;
        this.writeLogs(logMessage);
    }

    writeLogs(logMessage) {
        fs.appendFile(logFilePath, `${logMessage}\n`, (err) => {
            if (err) {
                console.error('Error writing log:', err);
            }
        });
    }
}

module.exports = Logger;
