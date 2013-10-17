// データベースモデル
var UserModel = require("../models/user").UserModel;

exports.init = function(app){
	// マイページ
	app.get("/mypage", function(req, res){
		res.render("mypage.ejs", {name: req.user.uname, icon: req.user.imgurl});
	});
}

