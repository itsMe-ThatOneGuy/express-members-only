const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/users');

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(
			{ passReqToCallback: true },
			async (req, username, password, done) => {
				try {
					const user = await User.findOne({ username: username }).exec();
					if (!user) {
						req.session.messages = [];
						return done(null, false, { message: 'Incorrect username' });
					}
					bcrypt.compare(password, user.password, (err, res) => {
						if (err) {
							return done(err);
						}
						if (res) {
							return done(null, user);
						}
						req.session.messages = [];
						return done(null, false, { message: 'Incorrect password' });
					});
				} catch (err) {
					return done(err);
				}
			},
		),
	);

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	passport.deserializeUser(async (id, done) => {
		try {
			const user = await User.findById(id).exec();
			done(null, user);
		} catch (err) {
			done(err);
		}
	});
};
