const express = require('express');
const router = express.Router();
const msgController = require('../controllers/messageController');

router.get('/create', msgController.msg_form_get);

router.post('/create', msgController.msg_form_post);

router.get('/:id/delete', msgController.msg_delete_get);

module.exports = router;
