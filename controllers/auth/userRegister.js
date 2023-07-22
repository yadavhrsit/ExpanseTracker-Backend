const UserModel = require('../../models/user');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Import uuidv4 from uuid

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already registered with this email" });
        }

        const hash = await bcrypt.hash(password, 10);

        // Generate a unique ID for googleId using uuidv4()
        const googleId = uuidv4();

        const user = new UserModel({
            name,
            email,
            password: hash,
            googleId,
        });

        await user.save();
        return res.status(201).json({ success: "User Registration Successful" });
    } catch (error) {
        return res.status(500).json({ error: "An error occurred during user registration", error });
    }
}

module.exports = registerUser;
