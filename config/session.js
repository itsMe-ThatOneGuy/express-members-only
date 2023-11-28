const expressSession = require('express-session');

const session = expressSession({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
});

module.exports = session;
