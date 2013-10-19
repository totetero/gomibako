var fs = require("fs");

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
	jdat.imgs = {};
	fs.readFile("./src_cli/game/img/player.png", function (err, data){
		jdat.imgs.player = "data:image/png;base64," + new Buffer(data).toString("base64");
		callback(JSON.stringify(jdat));
	});
};

/*
var exec = require("child_process").exec;
var fs = require("fs");

// コマンドテスト
exec("echo hogehoge", {timeout: 1000}, function(err, stdout, stderr){
	console.log("stdout: " + (stdout||'none'));
	console.log("stderr: " + (stderr||'none'));
})
// ファイルシステム
fs.readFile("./src_cli/test.html", "utf8", function (err, text){
	res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
	res.end(text);
});
fs.readFile("./src_cli/logout.html", "utf8", function (err, text){
	res.send(text, {"Content-Type": "text/html; charset=utf-8"}, 200);
});
*/
