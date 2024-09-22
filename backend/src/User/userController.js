const User = require('./userModel');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client('556072889645-crfml8nhdb89lvitidhvaqad8v2oe3o6.apps.googleusercontent.com');

//Update password
const updatePasswordController = async (req, res) => {
    try {
        // Get the new password from the request body
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({ msg: 'New password is required' });
        }
        const user = req.user;
        // Update the user's password (the pre-save hook in the schema will hash it)
        user.password = newPassword;
        await user.save();
        res.status(200).json({ msg: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ msg: 'Server error, please try again later' });
    }
};

//Update Conversation History
const updateConversationHistory = async (req, res) => {
    try {
        let conversationData = req.body;  // Get the conversation from the request body
        const user = req.user;

        user.conversations.push(conversationData);
        await user.save();
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({ msg: 'Failed to save conversation' });
    }
};

//Delete Account and FacialId if it has one
const deleteUserAndFacialIdControllerFn = async (req, res) => {
    try {
        const { email } = req.body;  // Get email from request body
        console.log({ email });
        // Step 1: Find and delete the user account from the database
        const user = await User.findOneAndDelete({ email });
        console.log(user.facialId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const facialId = user.facialId;
        if (facialId) {
            const response = await axios.get('https://api.faceio.net/deletefacialid', {
                params: {
                    fid: facialId,
                    key: 'c9137acab3418ae5c7343a027fa6a8bf'
                }
            });

            // Check for success status in the FACEIO response
            if (response.data.status !== 200) {
                return res.status(400).json({ msg: response.data.error });
            }

            // If successful, return a success message for both account and facial ID deletion
            return res.status(200).json({ msg: 'User account and Facial ID deleted successfully' });
        } else {
            // If no facial ID exists, return success for only account deletion
            return res.status(200).json({ msg: 'User account deleted successfully, no facial ID associated' });
        }
    } catch (err) {
        // Handle any errors (network, API issues, etc.)
        return res.status(500).json({ message: 'An error occurred while deleting the account or Facial ID', error: err.message });
    }
};

//Delete FaceID
const deleteFacialIdControllerFn = async (req, res) => {
    try {
        const { facialId } = req.params;  // Get Facial ID from request parameters

        // Make request to FACEIO to delete the facial ID
        const response = await axios.get('https://api.faceio.net/deletefacialid', {
            params: {
                fid: facialId,
                key: 'c9137acab3418ae5c7343a027fa6a8bf'
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

//Update FaceID
const updateFacialIdControllerFn = async (req, res) => {
    try {
        const { email, facialId } = req.body;

        // Find the user by ID and update the facialId
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the user's facialId
        user.facialId = facialId;
        await user.save();

        res.status(200).json({ msg: 'Facial ID updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
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
            const NewUser = new User({
                email: email,
                gmailId: googleId,
                name: name,
                profilePicture: profilePicture,
                authMethod: 'gmail'
            });
            await NewUser.save();
            const tokenClient = await NewUser.generateAuthToken();
            return res.status(200).json({ NewUser: NewUser, tokenClient });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Google token verification failed' });
    }
}

//Handle Facebook Users

const handleFacebookUserControllerFn = async (req, res) => {
    try {
        //Facebook Authentication
        const { token } = req.body;
        const url = `https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)&access_token=${token}`;
        const response = await axios.get(url);

        const profilePicture = response.data.picture.data.url;
        const facebookId = response.data.id;
        const email = response.data.email;
        const name = response.data.name;

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
            const NewUser = new User({
                email: email,
                name: name,
                facebookId: facebookId,
                profilePicture: profilePicture,
                authMethod: 'facebook'
            });
            await NewUser.save();
            const tokenClient = await NewUser.generateAuthToken();
            return res.status(200).json({ NewUser: NewUser, tokenClient });
        }
    } catch (error) {
        console.log(error);
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
    updateFacialIdControllerFn,
    deleteUserAndFacialIdControllerFn,
    updatePasswordController,
    updateConversationHistory
};