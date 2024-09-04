const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for the User
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: function () {
            return !this.facebookId && !this.gmailId;
        }, // Required if not using Facebook/Gmail
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return !this.facebookId && !this.gmailId;
        } // Required if not using Facebook/Gmail
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    gmailId: {
        type: String,
        unique: true,
        sparse: true
    },
    profilePicture: {
        type: String // Base64
    },
    authMethod: {
        type: String,
        enum: ['email', 'facebook', 'gmail'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash the user's password before saving to the database (for email/password users)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash the password if it’s new or changed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Add a method to compare passwords (for email/password users)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
const User = mongoose.model('User', userSchema);
module.exports = User;
