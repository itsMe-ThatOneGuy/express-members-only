const mongoose = require('mongoose');
const { RateLimiterMongo } = require('rate-limiter-flexible');

module.exports = async function () {
	let mongoConn, mongooseInstance;

	try {
		mongooseInstance = await mongoose.connect(
			process.env.NODE_ENV !== 'production'
				? process.env.MONGODB_URI_DEV
				: process.env.MONGODB_URI,
		);
		mongoConn = mongooseInstance.connection;
	} catch (err) {
		console.log(err);
	}

	const maxConsecutiveFailsByUsernameAndIP = 5;
	const maxWrongAttemptsByIPperDay = 100;

	return {
		maxConsecutiveFailsByUsernameAndIP: 5,
		maxWrongAttemptsByIPperDay: 100,

		limiterSlowBruteByIP: new RateLimiterMongo({
			storeClient: mongoConn,
			keyPrefix: 'login_fail_ip_per_day',
			points: maxWrongAttemptsByIPperDay,
			duration: 60 * 60 * 24,
			blockDuration: 60 * 60 * 24,
		}),

		limiterConsecutiveFailsByUsernameAndIP: new RateLimiterMongo({
			storeClient: mongoConn,
			keyPrefix: 'login_fail_consecutive_username_and_ip',
			points: maxConsecutiveFailsByUsernameAndIP,
			duration: 60 * 60 * 24 * 90,
			blockDuration: 60 * 60,
		}),
	};
};
