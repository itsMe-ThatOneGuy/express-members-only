const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    isMember: { type: Boolean, required: true },
    isAdmin: { type: Boolean, required: true },
    dateJoined: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
