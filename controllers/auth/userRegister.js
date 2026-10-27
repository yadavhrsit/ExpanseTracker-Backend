const { body } = require('express-validator');
const UserModel = require('../../models/user');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

const registerUserValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

async function registerUser(req, res) {
    if (rejectIfInvalid(req, res)) return;

    try {
        let { name, email, password } = req.body;
        name = name.split(/\s+/)
            .filter(Boolean)
            .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(' ');
        email = email.toLowerCase();

        if (await UserModel.exists({ email })) {
            return sendError(res, { status: 409, message: 'User already registered with this email' });
        }

        const hash = await bcrypt.hash(password, 10);
        const googleId = uuidv4();

        const user = new UserModel({
            name,
            email,
            password: hash,
            googleId,
        });

        await user.save();
        return sendSuccess(res, { status: 201, message: 'User registered successfully' });
    } catch (error) {
        return sendServerError(res, error, 'An error occurred during user registration');
    }
}

module.exports = { registerUser, registerUserValidation };
