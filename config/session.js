const MongoStore = require('connect-mongo');

const expiration = new Date(Date.now() + 60 * 60 * 1000);

const session = {
	secret: process.env.SESSION_SECRET,
	name: 'membersOnlyId',
	resave: false,
	store: MongoStore.create({
		mongoUrl: process.env.MONGODB_URI,
	}),
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: expiration,
		secure: process.env.NODE_ENV !== 'production' ? 'auto' : true,
		sameSite: process.env.NODE_ENV !== 'production' ? 'lax' : 'none',
	},
};

module.exports = session;
