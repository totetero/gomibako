// ファイル操作
var file = require("../../utils/file");

// データベースモデル
var UserModel = require("../../models/user").UserModel;

exports.init = function(app){
	// チャットページ
	app.get("/chat", function(req, res){
		var jdat = {};
		var js = [];
		var css = [];
		var imgs = {};

		js.push("./src_cli/chat/jsx/chat.js");
		js.push("./src_cli/chat/js/init.js");
		imgs["player"] = "./src_cli/game/img/player.png";

		// ゲーム静的情報
		file.file2json(js, css, imgs, function(data){
			jdat.js = data.js;
			jdat.css = data.css;
			jdat.imgs = data.imgs;
            res.render("common/index.ejs", {title: "チャット", daturl: "/chat/getdat", jdat: JSON.stringify(jdat)});
		});
	});

	// チャットページ
	app.get("/chat/getdat", function(req, res){
		var jdat = {};

		res.contentType('application/json');
		res.send(JSON.stringify(jdat));

		// ゲーム動的情報
		// var imgs = {};
		//imgs["player"] = "./src_cli/game/img/player.png";
		//file.file2json(null, null, imgs, function(data){
		//	jdat.imgs = data.imgs;
		//	res.contentType('application/json');
		//	res.send(JSON.stringify(jdat));
		//});
	});
}

