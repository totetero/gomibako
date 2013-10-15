var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	domain: String,
	uid: String,
	uname: String,
	imgurl: String,
	count : Number
});
mongoose.model('User', UserSchema);
exports.UserModel = mongoose.model('User');

