const { body } = require('express-validator');
const passport = require('passport');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

const loginUserValidation = [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

function loginUser(req, res, next) {
    if (rejectIfInvalid(req, res)) return;

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return sendServerError(res, err, 'An error occurred during login');
        }
        if (!user) {
            return sendError(res, { status: 401, message: info.message });
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                return sendServerError(res, loginErr, 'An error occurred during login');
            }
            req.session.userId = user._id;
            req.session.userName = user.name;
            return sendSuccess(res, {
                message: 'Login successful',
                data: { userId: user._id, userName: user.name },
            });
        });
    })(req, res, next);
}

module.exports = { loginUser, loginUserValidation };
