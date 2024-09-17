const User = require('./userModel');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client('556072889645-crfml8nhdb89lvitidhvaqad8v2oe3o6.apps.googleusercontent.com');

//Delete FaceID
const deleteFacialIdControllerFn = async (req, res) => {
    try {
        const { facialId } = req.params;  // Get Facial ID from request parameters

        // Make request to FACEIO to delete the facial ID
        const response = await axios.get('https://api.faceio.net/deletefacialid', {
            params: {
                fid: facialId,
                key: 'c9137acab3418ae5c7343a027fa6a8bf'  // Replace with your actual FACEIO API Key
            }
        });

        // Check for success status in response
        if (response.data.status !== 200) {
            return res.status(400).json({ msg: response.data.error });
        }

        // If successful, return a success message
        return res.status(200).json({ msg: 'Facial ID, associated payload data, and biometrics hash deleted successfully' });
    } catch (err) {
        // Handle any errors (network, API issues, etc.)
        return res.status(500).json({ message: 'An error occurred while deleting the Facial ID', error: err.message });
    }
};

//Create new user
const createUserControllerFn = async (req, res) => {
    try {
        const { email, name, password, profilePicture, authMethod, facialId } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            name,
            password,
            profilePicture,
            authMethod: authMethod || 'email', // Default for email/password registration
            facialId
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Handle Google Users
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
        const name = payload['name'];
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
                name: name,
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

//Handle Facebook Users

const handleFacebookUserControllerFn = async (req, res) => {
    try {
        //Facebook Authentication
        const { token } = req.body;
        console.log(token);
        const url = `https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)&access_token=${token}`;
        const response = await axios.get(url);

        const profilePicture = response.data.picture.data.url;
        const facebookId = response.data.id;
        const email = response.data.email;
        const name = response.data.name;
        console.log(profilePicture);

        let existingUser = await User.findOne({ email: email });
        if (existingUser) {
            // Check if the existing user's auth method is different
            if (existingUser.authMethod !== 'facebook') {
                console.log("Ya existe");
                return res.status(400).json({
                    message: `An account already exists with this e-mail address. Please sign in via normal login or use a different Facebook account.`
                });
            } else {
                // If the user exists and the auth method is 'facebook', proceed with Facebook login
                const tokenClient = await existingUser.generateAuthToken();
                return res.status(200).json({ user: existingUser, tokenClient });
            }
        }
        else { //Create a new user 
            const user = new User({
                email: email,
                name: name,
                facebookId: facebookId,
                profilePicture: profilePicture,
                authMethod: 'facebook'
            });
            console.log(user);
            await user.save();
            const tokenClient = await user.generateAuthToken();
            return res.status(200).json({ user: user, tokenClient });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
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
        if (user.authMethod === 'facebook') {
            return res.status(403).json({
                msg: 'This email has already been used to sign in via Facebook. Please log in using Facebook.'
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

//Login FACEID
const loginFaceIDControllerFn = async (req, res) => {
    try {
        const { facialId } = req.body;

        // Check if user exists
        const user = await User.findOne({ facialId });
        if (!user) {
            return res.status(404).json({ msg: 'No account found with this faceID' });
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
    handleFacebookUserControllerFn,
    deleteFacialIdControllerFn,
    loginFaceIDControllerFn,
};