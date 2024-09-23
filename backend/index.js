const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const routes = require('./routes/routes');

const allowedOrigins = [
    'https://chatbot-vanguardia.netlify.app',
    'http://localhost:4200'
];


app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
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