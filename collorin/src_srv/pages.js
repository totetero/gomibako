// データベースモデル
var UserModel = require("./model").UserModel;

exports.init = function(app){
	// ログイン確認関数
	var loginCheck = function(req, res, next){
		if(req.isAuthenticated()){
			next();
		}else{
			// ログインを促すトップページ表示
			res.send("http://127.0.0.1:10080/auth/twitter");
		}
	};

	// トップページ
	app.get("/", loginCheck, function(req, res){
		if(req.user){
			res.send("name = " + req.user.uname + " count = " + req.user.count );
		}
	});

	// ログアウト処理
	app.get("/logout", loginCheck, function(req, res){
		req.logout();
		// ログアウト完了画面表示
		res.send("logout");
	});
}

/*
var fs = require("fs");
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

