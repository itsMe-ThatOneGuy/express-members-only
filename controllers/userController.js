const User = require('../models/users');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

exports.membership_get = (req, res, next) => {
	if (req.user === undefined) {
		res.redirect('/');
	}
	console.log(`log 1: ${req.user}`);
	res.render('membership-form', { user: req.user });
};

exports.membership_post = [
	body('passphrase')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Passphrase Must Not be Empty')
		.custom((value) => {
			return value === process.env.PASSPHRASE;
		})
		.withMessage('Passphrase Did Not Match'),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('membership-form', {
				user: req.user,
				errors: errors.array(),
			});
		} else {
			await User.findByIdAndUpdate(req.user._id, { isMember: true });
			res.redirect('/');
		}
	}),
];
