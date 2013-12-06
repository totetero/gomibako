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

// ゲーム静的情報
exports.getsdat = function(callback){
	var jdat = {};
	var js = [];
	var css = [];
	var imgs = {};
	var strs = {};

	js.push("./src_cli/game/jsx/game.js");
	js.push("./src_cli/game/js/init.js");
	css.push("./src_cli/game/css/main.css");
	css.push("./src_cli/game/css/title.css");
	css.push("./src_cli/game/css/button.css");
	css.push("./src_cli/game/css/status.css");
	css.push("./src_cli/game/css/menu.css");
	strs["mainTag"] = "./src_cli/game/html/main.tag";

	file.file2json(js, css, imgs, strs, function(data){
		jdat.js = data.js;
		jdat.css = data.css;
		jdat.imgs = data.imgs;
		jdat.strs = data.strs;
		callback(JSON.stringify(jdat));
	});
};

// ゲーム動的情報
exports.getddat = function(user, callback){
	var jdat = {};
	var imgs = {};

	imgs["pdot"] = "./src_cli/game/img/pdot.png";
	imgs["b64_pstand"] = "./src_cli/game/img/pstand.png";
	imgs["dice"] = "./src_cli/game/img/dice.png";
	imgs["background"] = "./src_cli/game/img/background.png";

	file.file2json(null, null, imgs, null, function(data){
		jdat.imgs = data.imgs;
		callback(JSON.stringify(jdat));
	});
};

