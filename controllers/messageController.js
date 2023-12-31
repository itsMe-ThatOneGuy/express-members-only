const Message = require('../models/message');
const User = require('../models/users');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

exports.msg_list = asyncHandler(async (req, res, next) => {
	const allMessages = await Message.find({})
		.sort({ postDate: -1 })
		.populate('user')
		.exec();

	res.render('index', { user: req.user, messages: allMessages });
});

exports.msg_form_get = (req, res, next) => {
	if (req.user === undefined) {
		res.redirect('/');
	}

	res.render('msg-form', {
		user: req.user,
	});
};

exports.msg_form_post = [
	body('title')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Title Must Not be Empty')
		.isLength({ max: 55 })
		.escape()
		.withMessage('Title Must Not be Longer Than 55'),
	body('message')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Message Must Not be Empty')
		.isLength({ max: 255 })
		.withMessage('Message Can Not be Longer Than 255 Characters'),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		const currentUser = await User.findOne({
			username: req.user.username,
		}).exec();

		const message = new Message({
			user: currentUser._id,
			title: req.body.title,
			message: req.body.message,
		});

		if (!errors.isEmpty()) {
			res.render('msg-form', {
				user: req.user,
				message: message,
				errors: errors.array(),
			});
		} else {
			await message.save();
			res.redirect('/');
		}
	}),
];

exports.msg_delete_get = asyncHandler(async (req, res, next) => {
	const message = await Message.findById(req.params.id).populate('user').exec();
	if (message === null) {
		res.redirect('/', { user: req.user });
	}

	res.render('msg-delete', {
		user: req.user,
		message: message,
	});
});

exports.msg_delete_post = asyncHandler(async (req, res, next) => {
	const message = Message.findById(req.params.id).populate('user').exec();

	if (message === null || req.user === undefined) {
		res.redirect('/');
	}

	await Message.findByIdAndDelete(req.params.id);
	res.redirect('/');
});
