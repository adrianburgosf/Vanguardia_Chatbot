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
//Update FacialID
router.post('/user/updateFacialId', userController.updateFacialIdControllerFn);
//Update Password
router.post('/user/update-password', auth, userController.updatePasswordController);
// Get all users
router.get('/users', auth, userController.getAllUsersControllerFn);
// Get user by ID
router.get('/user/:id', auth, userController.getUserByIdControllerFn);
//Delete FaceID
router.delete('/user/deletefacialid/:facialId', userController.deleteFacialIdControllerFn);
//Delete account
router.post('/user/delete', userController.deleteUserAndFacialIdControllerFn);

module.exports = router;