const { sendError } = require('../utils/response');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return sendError(res, { status: 401, message: 'Authentication required' });
}

module.exports = ensureAuthenticated;
