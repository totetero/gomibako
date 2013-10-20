// データベースモデル
var UserModel = require("../../models/user").UserModel;

exports.init = function(app){
	// ステージ選択ページ
	app.get("/stage/:info", function(req, res){
		res.render("stage.ejs", {area: req.params.info});
	});
}

