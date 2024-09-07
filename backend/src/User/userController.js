const User = require('./userModel');
const auth = require('../../middleware/auth.js');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client('556072889645-crfml8nhdb89lvitidhvaqad8v2oe3o6.apps.googleusercontent.com');

//Create new user
const createUserControllerFn = async (req, res) => {
    try {
        const { email, password, profilePicture, authMethod } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password,
            profilePicture,
            authMethod: authMethod || 'email' // Default for email/password registration
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createGoogleUserControllerFn = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '556072889645-crfml8nhdb89lvitidhvaqad8v2oe3o6.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const profilePicture = payload['picture'];

        let existingUser = await User.findOne({ email: email });
        if (existingUser) {
            // Check if the existing user's auth method is different
            if (existingUser.authMethod !== 'gmail') {
                //console.log("Ya existe");
                return res.status(400).json({
                    message: `An account already exists with this e-mail address. Please sign in via normal login or use a different email.`
                });
            } else {
                // If the user exists and the auth method is 'gmail', proceed with Google login
                const tokenClient = await existingUser.generateAuthToken();
                return res.status(200).json({ user: existingUser, tokenClient });
            }
        }
        else { //Create a new user 
            const user = new User({
                email: email,
                gmailId: googleId,
                profilePicture: profilePicture,
                authMethod: 'gmail'
            });
            await user.save();
            const tokenClient = await user.generateAuthToken();
            return res.status(200).json({ user: user, tokenClient });
        }
    } catch (err) {
        res.status(500).json({ message: 'Google token verification failed' });
    }
}

// Login user
const loginUserControllerFn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'No account found with this email' });
        }
        if (user.authMethod === 'gmail') {
            return res.status(400).json({
                msg: 'This email has already been used to sign in via Google. Please log in using Google.'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }
        //Create token
        const token = await user.generateAuthToken();
        res.status(200).json({ user, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all users
const getAllUsersControllerFn = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user by ID
const getUserByIdControllerFn = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createUserControllerFn,
    createGoogleUserControllerFn,
    loginUserControllerFn,
    getAllUsersControllerFn,
    getUserByIdControllerFn,
};