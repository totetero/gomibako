// ファイル操作
var file = require("../../utils/file");

// データベースモデル
var UserModel = require("../../models/user").UserModel;

// ゲームの初期化
exports.init = function(user, stage){
	user.gamestat = 1;
	user.save();
};

// ゲームの中断
exports.exit = function(user){
	user.gamestat = 0;
	user.save();
};

// ゲームプレイ中確認
exports.isPlay = function(user){
	return (user.gamestat == 1);
};

// ゲーム情報
exports.getdat = function(user, callback){
	var jdat = {};
	var js = [];
	var css = [];
	var imgs = {};

	js.push("./src_cli/game/jsx/game.js");
	js.push("./src_cli/game/js/init.js");
	css.push("./src_cli/game/css/test.css");
	imgs["player"] = "./src_cli/game/img/player.png";
	imgs["player2"] = "./src_cli/game/img/player.png";

	file.file2json(js, css, imgs, function(data){
		jdat.load = data;
		callback(JSON.stringify(jdat));
	});
};

