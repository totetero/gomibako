// ファイル操作
var file = require("../../utils/file");

// データベースモデル
var UserModel = require("../../models/user").UserModel;
// キャラクター描画情報
var characterDrawInfo = require("../../data/characterDrawInfo");

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

	// フィールド情報
	jdat.stagename = "高天原";
	jdat.hex = [
		{x: 0, y: 3, type: 1},
		{x: 0, y: 4, type: 1},
		{x: 0, y: 5, type: 2},
		{x: 1, y: 5, type: 1},
		{x: 2, y: 4, type: 1},
		{x: 2, y: 3, type: 1},
		{x: 2, y: 2, type: 1},
		{x: 1, y: 2, type: 1},
		{x: 3, y: 4, type: 1},
		{x: 4, y: 3, type: 1},
		{x: 5, y: 3, type: 1},
		{x: 5, y: 4, type: 1},
		{x: 5, y: 5, type: 1},
		{x: 5, y: 6, type: 1},
		{x: 4, y: 7, type: 1},
		{x: 3, y: 7, type: 1},
		{x: 2, y: 7, type: 1},
		{x: 1, y: 7, type: 1},
		{x: 1, y: 6, type: 1},
		{x: 3, y: 1, type: 1},
		{x: 4, y: 0, type: 1},
		{x: 5, y: 0, type: 1},
		{x: 5, y: 1, type: 1},
		{x: 4, y: 2, type: 1},
	];
	// 背景画像
	imgs["background"] = "./src_cli/common/img/background/test.png";
	// さいころ画像
	imgs["dice"] = "./src_cli/common/img/dice/test.png";

	// プレイヤー情報
	jdat.player = [
		{id: "player1", drawInfo: "human", x: 1, y : 7, r: Math.PI * 1.5},
		{id: "player2", drawInfo: "human", x: 2, y : 7, r: Math.PI * 1.5},
	];

	// 敵情報
	jdat.enemy = [
		{id: "enemy3", drawInfo: "human", x: 2, y : 4, r: Math.PI * 0.5},
	];

	// 画像など読み込み
	jdat.drawInfo = {};
	var charaList = [jdat.player, jdat.enemy];
	for(var i = 0; i < charaList.length; i++){
		for(var j = 0; j < charaList[i].length; j++){
			var chara = charaList[i][j];
			imgs["dot_" + chara.id] = "./src_cli/common/img/character/" + chara.id + "/dot.png";
			if(i == 0){imgs["b64_bust_" + chara.id] = "./src_cli/common/img/character/" + chara.id + "/bust.png";}
			jdat.drawInfo[chara.drawInfo] = characterDrawInfo[chara.drawInfo];
		}
	}

	file.file2json(null, null, imgs, null, function(data){
		jdat.imgs = data.imgs;
		callback(JSON.stringify(jdat));
	});
};

