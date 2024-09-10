const express = require('express');
const userController = require('../src/User/userController');

const router = express.Router();

// Create user
router.post('/user/create', userController.createUserControllerFn);
//Handle google user
router.post('/user/googleRegister', userController.createGoogleUserControllerFn);
//Handle facebook user
router.post('/user/facebookRegister', userController.handleFacebookUserControllerFn);
//Login
router.post('/user/login', userController.loginUserControllerFn);
// Get all users
router.get('/users', userController.getAllUsersControllerFn);
// Get user by ID
router.get('/user/:id', userController.getUserByIdControllerFn);

module.exports = router;