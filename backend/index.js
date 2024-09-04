const express = require('express');
const mongoose = require('mongoose');
const User = require('./Models/userModel')
const router = express();

router.use(express.json());

//routes

router.get('/user', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

router.post('/user', async (req, res) => {
    const { email, password, profilePicture, authMethod } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            email,
            password,
            profilePicture,
            authMethod: 'email' // Default for email/password registration
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/user', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});


mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://adrianburgosf:colombia2009@chatbot-cluster.vedur.mongodb.net/chatbotdb?retryWrites=true&w=majority&appName=chatbot-cluster')
    .then(() => {
        console.log('Connected to MongoDB');
        router.listen(3000, () => {
            console.log(`Node API router is running on port 3000`);
        });
    }).catch((error) => {
        console.log(error);
    });

module.exports = router;