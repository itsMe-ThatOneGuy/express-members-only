const mongoose = require('mongoose');
const { RateLimiterMongo } = require('rate-limiter-flexible');

const maxConsecutiveFailsByUsernameAndIP = 10;
const maxWrongAttemptsByIPperDay = 100;

module.exports.maxConsecutiveFailsByUsernameAndIP = 10;
module.exports.maxWrongAttemptsByIPperDay = 100;

module.exports.limiterSlowBruteByIP = new RateLimiterMongo({
	storeClient: mongoose.connection,
	keyPrefix: 'login_fail_ip_per_day',
	points: maxWrongAttemptsByIPperDay,
	duration: 60 * 60 * 24,
	blockDuration: 60 * 60 * 24,
});

module.exports.limiterConsecutiveFailsByUsernameAndIP = new RateLimiterMongo({
	storeClient: mongoose.connection,
	keyPrefix: 'login_fail_consecutive_username_and_ip',
	points: maxConsecutiveFailsByUsernameAndIP,
	duration: 60 * 60 * 24 * 90,
	blockDuration: 60 * 60,
});
