const { validationResult } = require('express-validator');

// Every API response has the same envelope:
//   success: { success: true,  message, data? }
//   error:   { success: false, message, errors? }

function sendSuccess(res, { status = 200, message = 'Success', data } = {}) {
    const body = { success: true, message };
    if (data !== undefined) {
        body.data = data;
    }
    return res.status(status).json(body);
}

function sendError(res, { status = 500, message = 'Internal Server Error', errors } = {}) {
    const body = { success: false, message };
    if (errors !== undefined) {
        body.errors = errors;
    }
    return res.status(status).json(body);
}

// Sends a 400 and returns true when the request failed express-validator checks.
function rejectIfInvalid(req, res) {
    const result = validationResult(req);
    if (result.isEmpty()) {
        return false;
    }
    const errors = result.array().map(({ path, msg }) => ({ field: path, message: msg }));
    sendError(res, { status: 400, message: errors[0].message, errors });
    return true;
}

// Logs an unexpected failure and sends a safe error (no internals leaked to the client).
function sendServerError(res, error, message) {
    console.error(message, error);
    if (error && error.code === 11000) {
        return sendError(res, { status: 409, message: 'A record with the same unique value already exists' });
    }
    return sendError(res, { status: 500, message });
}

module.exports = { sendSuccess, sendError, rejectIfInvalid, sendServerError };
