const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: { type: String, required: true, minlength: 1, unique: true },
	password: { type: String, required: true, minlength: 8 },
	isMember: { type: Boolean, required: true },
	isAdmin: { type: Boolean, required: true },
	dateJoined: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
