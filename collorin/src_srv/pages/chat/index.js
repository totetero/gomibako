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
		imgs["player"] = "./src_cli/game/img/pdot.png";

		// ゲーム静的情報
		file.file2json(js, css, imgs, null, function(data){
			jdat.js = data.js;
			jdat.css = data.css;
			jdat.imgs = data.imgs;
			res.render("common/index.ejs", {title: "チャット", daturl: "/chat/getdat", jdat: JSON.stringify(jdat)});
		});
	});

	// チャットページ
	app.get("/chat/getdat", function(req, res){
		var jdat = {};
		var imgs = {};

		switch(Math.floor(Math.random() * 6)){
			case 0: jdat.imgname = "player1"; break;
			case 1: jdat.imgname = "player2"; break;
			case 2: jdat.imgname = "player3"; break;
			case 3: jdat.imgname = "enemy1"; break;
			case 4: jdat.imgname = "enemy2"; break;
			case 5: jdat.imgname = "enemy3"; break;
		}
		imgs[jdat.imgname] = "./src_cli/chat/img/" + jdat.imgname + ".png";
		
		// TEST いったん全画像送る
		imgs["player1"] = "./src_cli/chat/img/player1.png";
		imgs["player2"] = "./src_cli/chat/img/player2.png";
		imgs["player3"] = "./src_cli/chat/img/player3.png";
		imgs["enemy1"] = "./src_cli/chat/img/enemy1.png";
		imgs["enemy2"] = "./src_cli/chat/img/enemy2.png";
		imgs["enemy3"] = "./src_cli/chat/img/enemy3.png";

		// ゲーム動的情報
		file.file2json(null, null, imgs, null, function(data){
			jdat.imgs = data.imgs;
			res.contentType('application/json');
			res.send(JSON.stringify(jdat));
		});
	});

	// チャット画像請求
	app.get("/chat/getimg", function(req, res){
		console.log(req);
	});
}

