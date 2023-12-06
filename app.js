const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const helmet = require('helmet');
const compression = require('compression');
const expressSession = require('express-session');

const session = require('./config/session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const msgRouter = require('./routes/msg');
const userRouter = require('./routes/user');

const app = express();
app.use(compression());
app.use(helmet());
app.disable('x-powered-by');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
	await mongoose.connect(mongoDB);
}

const User = require('./models/users');
const bcrypt = require('bcryptjs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(expressSession(session));

app.use(passport.initialize());
app.use(passport.session());

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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/message', msgRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
