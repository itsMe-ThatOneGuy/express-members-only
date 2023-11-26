const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/sign-up', authController.sign_up_get);

router.post('/sign-up', authController.sign_up_post);

router.get('/login', authController.login_get);

router.post('/login', authController.login_post);

router.get('/logout', authController.logout);

module.exports = router;
