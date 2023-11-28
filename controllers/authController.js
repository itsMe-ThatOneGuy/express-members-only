const User = require('../models/users');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.sign_up_get = asyncHandler(async (req, res, next) => {
	res.render('auth-form', {
		title: 'Sign Up',
		signup: true,
	});
});

exports.sign_up_post = [
	body('username')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Username must not be empty')
		.custom(async (value, { req }) => {
			return User.findOne({ username: value })
				.exec()
				.then((name) => {
					if (name !== null) {
						return Promise.reject();
					}
				});
		})
		.withMessage('That Username is Already Taken.')
		.escape(),
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password Must Contain at Least 8 Characters')
		.matches('[0-9]')
		.withMessage('Password Must Contain a Number')
		.matches('[A-Z]')
		.withMessage('Password Must Contain an Uppercase Letter')
		.trim()
		.escape(),
	body('confirm-password')
		.custom((confirmPassword, { req }) => {
			return req.body.password === confirmPassword;
		})
		.withMessage('Passwords do not match'),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		const name = await User.findOne({ username: req.body.username }).exec();
		console.log(name);

		if (!errors.isEmpty()) {
			res.render('auth-form', {
				title: 'Sign Up',
				username: req.body.username,
				signup: true,
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
		failureMessage: true,
	}),
];

exports.login_get = asyncHandler(async (req, res, next) => {
	res.render('auth-form', {
		title: 'Login',
		message: req.session.messages,
	});
});

exports.login_post = [
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/auth/login',
		failureMessage: true,
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
