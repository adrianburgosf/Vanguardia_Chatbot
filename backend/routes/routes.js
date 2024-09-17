const express = require('express');
const userController = require('../src/User/userController');
const auth = require('../middleware/auth.js');

const router = express.Router();

// Create user
router.post('/user/create', userController.createUserControllerFn);
//Handle google user
router.post('/user/googleRegister', userController.createGoogleUserControllerFn);
//Handle facebook user
router.post('/user/facebookRegister', userController.handleFacebookUserControllerFn);
//Login
router.post('/user/login', userController.loginUserControllerFn);
//Login FaceID
router.post('/user/loginFaceID', userController.loginFaceIDControllerFn);
// Get all users
router.get('/users', auth, userController.getAllUsersControllerFn);
// Get user by ID
router.get('/user/:id', auth, userController.getUserByIdControllerFn);
//Delete FaceID
router.delete('/user/deletefacialid/:facialId', userController.deleteFacialIdControllerFn);

module.exports = router;