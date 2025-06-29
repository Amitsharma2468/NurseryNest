const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller'); // Ensure the file is named 'usercontroller.js' with lowercase 'c'

const { protect } = require('../middleware/auth');

router.get('/profile', protect, userController.getProfile);           // Get the profile of the authenticated user
router.put('/profile',protect, userController.updateProfile);         // Update the profile of the authenticated user
router.get('/dashboard', userController.getDashboard);        // General user dashboard (no roles)
router.get('/:userId', userController.getUserDetails);        // Get user details by userId

module.exports = router;
