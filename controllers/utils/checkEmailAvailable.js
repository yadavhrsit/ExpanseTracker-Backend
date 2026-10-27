const UserModel = require('../../models/user');
const { sendSuccess, sendServerError } = require('../../utils/response');

async function checkEmailAvailability(req, res) {
    const email = req.params.email.toLowerCase();
    try {
        const existingUser = await UserModel.exists({ email });
        return sendSuccess(res, {
            message: existingUser ? 'Email is already registered' : 'Email is available',
            data: { available: !existingUser },
        });
    } catch (error) {
        return sendServerError(res, error, 'An error occurred while checking email availability');
    }
}

module.exports = checkEmailAvailability;
