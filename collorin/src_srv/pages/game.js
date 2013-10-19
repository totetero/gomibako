// データベースモデル
var UserModel = require("../models/user").UserModel;

// ゲームの初期化
var gameInit = function(user, stage){
	user.gamestat = 1;
	user.save();
}

exports.init = function(app){
	// ゲーム中 ゲーム情報を返す
	app.get("/getdat", function(req, res, next){
		if(req.user.gamestat != 1){
			next();
		}else{
			res.send("ゲーム情報のjsonを返す");
		}
	});
	
	// ゲーム中 さいころを振る
	app.get("/dice", function(req, res, next){
		if(req.user.gamestat != 1){
			next();
		}else{
			res.send("さいころふった なんかjsonを返す");
		}
	});

	// ゲーム中 さいころを振った後の移動を行う
	app.get("/move", function(req, res, next){
		if(req.user.gamestat != 1){
			next();
		}else{
			res.send("移動した なんかjsonを返す NPCの行動結果も返す");
		}
	});

	// ゲーム中 カードを使う
	app.get("/card", function(req, res, next){
		if(req.user.gamestat != 1){
			next();
		}else{
			res.send("カード使った なんかjsonを返す NPCの行動結果も返す");
		}
	});

	// ゲーム中断命令
	app.get("/exit", function(req, res, next){
		if(req.user.gamestat != 1){
			next();
		}else{
			req.user.gamestat = 0;
			req.user.save();
			res.send("ゲーム中断したよ<br><a href='/mypage'>マイページ</a>");
		}
	});

	// ゲーム中のリロード対応
	app.get("/game/:stage", function(req, res, next){
		if(req.user.gamestat != 1){
			next();
		}else{
			res.render("game/index.ejs");
		}
	});

	// ゲーム中 変なページをたたいたときのリダイレクト
	app.all("*", function(req, res, next){
		if(!req.user || req.user.gamestat != 1){
			next();
		}else if(req.url == "/jsx/game.js"){
			next();
		}else if(req.url.indexOf("/sound") == 0){
			next();
		}else{
			res.redirect("/game/hoge"); // TODO 正しいステージ名をDBから抜き出してつける
		}
	});

	// ゲーム開始命令
	app.get("/game/:stage", function(req, res){
		gameInit(req.user, req.params.stage);
		res.render("game/index.ejs");
	});
}

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

