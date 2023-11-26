const User = require('../models/users');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.sign_up_get = asyncHandler(async (req, res, next) => {
	res.render('auth-form', {
		title: 'Sign Up',
	});
});

exports.sign_up_post = [
	body('username', 'Username must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('password', 'Password must contain at least 8 characters')
		.isLength({ min: 8 })
		.matches('[0-9]')
		.withMessage('Password Must Contain a Number')
		.matches('[A-Z]')
		.withMessage('Password Must Contain an Uppercase Letter')
		.trim()
		.escape(),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('auth-form', {
				title: 'Sign Up',
				errors: errors.array(),
			});
		} else {
			bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
				try {
					const user = new User({
						username: req.body.username,
						password: hashedPassword,
						isMember: false,
						isAdmin: false,
					});
					await user.save();
					next();
				} catch (err) {
					return next(err);
				}
			});
		}
	}),

	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/',
	}),
];

exports.login_get = asyncHandler(async (req, res, next) => {
	res.render('auth-form', {
		title: 'Login',
	});
});

exports.login_post = [
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/',
	}),
];

exports.logout = (req, res, next) => {
	req.logout((err) => {
		if (err) {
			next(err);
		} else {
			res.redirect('/');
		}
	});
};
