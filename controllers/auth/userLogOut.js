const { sendSuccess, sendServerError } = require('../../utils/response');

function userLogout(req, res) {
    const finish = (err) => {
        if (err) {
            return sendServerError(res, err, 'An error occurred during logout');
        }
        if (!req.session) {
            return sendSuccess(res, { message: "You've been signed out" });
        }
        req.session.destroy((destroyErr) => {
            if (destroyErr) {
                return sendServerError(res, destroyErr, 'An error occurred during logout');
            }
            return sendSuccess(res, { message: "You've been signed out" });
        });
    };

    if (typeof req.logout === 'function') {
        return req.logout(finish);
    }
    return finish();
}

module.exports = userLogout;
