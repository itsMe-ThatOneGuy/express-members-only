const Message = require('../models/message');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

exports.msg_form_get = (req, res, next) => {
	console.log(req.user);
	res.render('msg-form', {
		user: req.user,
	});
};
