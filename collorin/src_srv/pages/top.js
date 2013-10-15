var fs = require("fs");

// データベースモデル
var UserModel = require("../models/user").UserModel;

// ログイン確認関数
var loginCheck = require("../pages/auth").loginCheck;

exports.init = function(app){
	// トップページ
	app.get("/", loginCheck, function(req, res){
		res.send("name = " + req.user.uname + " count = " + req.user.count);
	});

	// ログアウト処理
	app.get("/logout", loginCheck, function(req, res){
		req.logout();
		fs.readFile("./src_cli/logout.html", "utf8", function (err, text){
			res.send(text, {"Content-Type": "text/html; charset=utf-8"}, 200);
		});
	});

	// ページが存在しない処理
	app.get("*", loginCheck, function(req, res){
		res.status(404);
		fs.readFile("./src_cli/404.html", "utf8", function (err, text){
			res.send(text, {"Content-Type": "text/html; charset=utf-8"}, 200);
		});
	});
}

/*
var exec = require("child_process").exec;

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
*/

