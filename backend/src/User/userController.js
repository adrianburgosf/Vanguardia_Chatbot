const User = require('./userModel');

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

// Login user
const loginUserControllerFn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        res.status(200).json({ msg: 'Login successful' }); // No token or session is being generated
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
    loginUserControllerFn,
    getAllUsersControllerFn,
    getUserByIdControllerFn,
};