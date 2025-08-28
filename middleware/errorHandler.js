const { constants } = require("./constants");
const logger = require("../logger");

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : constants.SERVER_ERROR;
    next(err);
    logger.error(`[${req.method}] ${req.url} ${statusCode} ${err.message}`);

    // Informational (1xx) Status Codes
    if (statusCode >= 100 && statusCode < 200) {
        // 100 Continue: The server has received the initial part of the request, and the client should continue with the request
    }

    // Successful (2xx) Status Codes
    else if (statusCode >= 200 && statusCode < 300) {
        // 200 OK: The request was successful, and the server has returned the requested data.
        // 201 Created: The request has been fulfilled, resulting in the creation of a new resource.
        // 204 No Content: The request was successful, but there is no data to return (often used for updates or deletes).
    }

    // Redirection (3xx) Status Codes
    else if (statusCode >= 300 && statusCode < 400) {
        // 301 Moved Permanently: The requested resource has been permanently moved to a different URL.
        // 302 Found (Temporary Redirect): The requested resource can be found under a different URL temporarily.
        // 304 Not Modified: The client's cached copy is up-to-date, and there's no need to send a new response.
        // 307 Temporary Redirect: Similar to 302, but the request method should not change when redirected.
        // 308 Permanent Redirect: Similar to 301, indicating a permanent redirect
        switch (statusCode) {
            case constants.MOVED_PERMANENTLY:
                res.json({
                    Status: constants.MOVED_PERMANENTLY,
                    title: "Redirection: Moved permanently",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            case constants.FOUND:
                res.json({
                    Status: constants.FOUND,
                    title: "Redirection: Moved to new URL temporarily",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            default:
                // all is good...
                console.log("All is good")
        }
    }

    // Client Error (4xx) Status Codes
    else if (statusCode >= 400 && statusCode < 500) {
        switch (statusCode) {
            case constants.VALIDATION_ERROR:
                res.json({
                    Status: constants.VALIDATION_ERROR,
                    title: "Error: Validation failed",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            case constants.NOT_FOUND:
                res.json({
                    Status: constants.NOT_FOUND,
                    title: "Error: Not found",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            case constants.UNAUTHORIZED:
                res.json({
                    Status: constants.UNAUTHORIZED,
                    title: "Error: Unauthorized",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            case constants.FORBIDDEN:
                res.json({
                    Status: constants.FORBIDDEN,
                    title: "Error: Forbidden",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            default:                    
                // all is good...
                console.log("All is good")
        }
    }

    // Server Error (5xx) Status Codes
    else if (statusCode >= 500 && statusCode < 600) {
        switch (statusCode) {
            case constants.SERVER_ERROR:
                res.json({
                    Status: constants.SERVER_ERROR,
                    title: "Error: Internal Server Error",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            case constants.BAD_GATEWAY:
                res.json({
                    Status: constants.BAD_GATEWAY,
                    title: "Error: Bad Gateway",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            case constants.SERVICE_UNAVAILABLE:
                res.json({
                    Status: constants.SERVICE_UNAVAILABLE,
                    title: "Error: Service Unavailable",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            case constants.GATEWAY_TIMEOUT:
                res.json({
                    Status: constants.GATEWAY_TIMEOUT,
                    title: "Error: Gateway Timeout",
                    message: err.message
                    // stackTrace: err.stack
                });
                break;
            default:
                // all is good...
                console.log("All is good")
        }
    } else {
        console.log("No error, All is good");
    }
};

module.exports = errorHandler;