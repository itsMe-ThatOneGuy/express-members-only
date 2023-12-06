const MongoStore = require('connect-mongo');
const express = require('express');
const app = express();

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
		sameSite: true,
	},
};

if (app.get('env') === 'production') {
	session.cookie.secure = true;
}

module.exports = session;
