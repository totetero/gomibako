// ファイル操作
var file = require("../../utils/file");

// データベースモデル
var UserModel = require("../../models/user").UserModel;

exports.init = function(app){
	// チャットページ
	app.get("/chat", function(req, res){
		res.render("common/index.ejs", {title: "チャット", daturl: "/chat/getdat"});
	});

	// チャットページ
	app.get("/chat/getdat", function(req, res){
		var jdat = {};
		var js = [];
		var css = [];
		var imgs = {};

		js.push("./src_cli/chat/jsx/chat.js");
		js.push("./src_cli/chat/js/init.js");
		imgs["player"] = "./src_cli/game/img/player.png";

		file.file2json(js, css, imgs, function(data){
			jdat.load = data;
			res.contentType('application/json');
			res.send(JSON.stringify(jdat));
		});
	});
}

