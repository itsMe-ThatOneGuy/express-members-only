const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/membership', userController.membership_get);

router.post('/membership', userController.membership_post);

module.exports = router;
