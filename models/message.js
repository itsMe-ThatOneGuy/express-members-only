const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, minLength: 1, maxLength: 55, required: true },
    message: { type: String, minLength: 1, maxLength: 255, required: true },
    postDate: { type: Date, default: Date.now },
});

MessageSchema.virtual('url').get(function() {
    return `/message/${this._id}`;
});

MessageSchema.virtual('postDate_formatted').get(function() {
    return this.postDate
        ? DateTime.fromJSDate(this.postDate).toLocaleString(DateTime.DATETIME_SHORT)
        : '';
});

module.exports = mongoose.model('Message', MessageSchema);
