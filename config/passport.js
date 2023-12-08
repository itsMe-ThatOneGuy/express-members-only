const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const limiterInit = require('./rateLimit');

async function testPassword(password, hashed) {
	const match = await bcrypt.compare(password, hashed);

	if (match) {
		return true;
	} else {
		return false;
	}
}

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(
			{ passReqToCallback: true },
			async (req, username, password, done) => {
				const {
					maxConsecutiveFailsByUsernameAndIP,
					maxWrongAttemptsByIPperDay,
					limiterSlowBruteByIP,
					limiterConsecutiveFailsByUsernameAndIP,
				} = await limiterInit();

				const usernameIPkey = `${username}_${req.ip}`;

				const [resUsernameAndIP, resSlowByIP] = await Promise.all([
					limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
					limiterSlowBruteByIP.get(req.ip),
				]);

				let retrySecs = 0;

				if (
					resSlowByIP !== null &&
					resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
				) {
					retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
				} else if (
					resUsernameAndIP !== null &&
					resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP
				) {
					retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
				}

				if (retrySecs > 0) {
					req.session.messages = [];
					return done(null, false, {
						message: `Too Many Failed Attempts. Retry-After ${retrySecs} Secs`,
					});
				} else {
					try {
						const user = await User.findOne({ username: username }).exec();
						if (user) {
							if (await testPassword(password, user.password)) {
								if (
									resUsernameAndIP !== null &&
									resUsernameAndIP.consumedPoints > 0
								) {
									try {
										await limiterConsecutiveFailsByUsernameAndIP.delete(
											usernameIPkey,
										);
									} catch (err) {}
								}
								req.session.messages = [];
								return done(null, user);
								//
							} else {
								try {
									await Promise.all([
										limiterConsecutiveFailsByUsernameAndIP.consume(
											usernameIPkey,
										),
										limiterSlowBruteByIP.consume(req.ip),
									]);
									req.session.messages = [];
									return done(null, false, {
										message: 'Incorrect Username or Password',
									});
								} catch (rlRejected) {
									if (rlRejected instanceof Error) {
										throw rlRejected;
									} else {
										req.session.messages = [];
										return done(null, false, {
											message: `Retry-After ${
												Math.round(rlRejected.msBeforeNext / 1000) || 1
											} Secs`,
										});
									}
								}
								//
							}
						} else {
							try {
								await Promise.all([
									limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey),
									limiterSlowBruteByIP.consume(req.ip),
								]);
								req.session.messages = [];
								return done(null, false, {
									message: 'Incorrect Username or Password',
								});
							} catch (rlRejected) {
								if (rlRejected instanceof Error) {
									throw rlRejected;
								} else {
									req.session.messages = [];
									return done(null, false, {
										message: `Too Many Failed Attempts. Retry-After ${
											Math.round(rlRejected.msBeforeNext / 1000) || 1
										} Secs`,
									});
								}
							}
						}
					} catch (err) {
						return done(err);
					}
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
