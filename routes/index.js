const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/', messageController.msg_list);

router.get('/message/:id/delete', messageController.msg_delete_get);

module.exports = router;
