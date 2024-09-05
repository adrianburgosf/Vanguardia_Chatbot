const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const routes = require('./routes/routes');

app.use(cors());
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