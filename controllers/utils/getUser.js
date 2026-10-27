const { sendSuccess } = require('../../utils/response');

function getUser(req, res) {
    return sendSuccess(res, {
        message: 'User fetched successfully',
        data: {
            userId: req.session.userId,
            userName: req.session.userName,
        },
    });
}

module.exports = getUser;
