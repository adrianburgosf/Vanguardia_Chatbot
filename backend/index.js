const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const routes = require('./routes/routes');

const corsOptions = {
    origin: 'https://test-branch--chatbot-vanguardia.netlify.app/', // This should be the URL of your frontend
    credentials: true, // To allow sending cookies and authorization headers
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);

mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://adrianburgosf:colombia2009@chatbot-cluster.vedur.mongodb.net/chatbotdb?retryWrites=true&w=majority&appName=chatbot-cluster')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => {
            console.log(`Node API app is running on port 3000`);
        });
    }).catch((error) => {
        console.log(error);
    });