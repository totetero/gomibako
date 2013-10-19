// ゲーム本体
var game = require("./main");

exports.init = function(app){
	// ゲーム中 ゲーム情報を返す
	app.get("/getdat", function(req, res, next){
		if(!game.isPlay(req.user)){
			next();
		}else{
			game.getdat(req.user, function(data){
				res.contentType('application/json');
				res.send(data);
			});
		}
	});

	// ゲーム中 さいころを振る
	app.get("/dice", function(req, res, next){
		if(!game.isPlay(req.user)){
			next();
		}else{
			res.send("さいころふった なんかjsonを返す");
		}
	});

	// ゲーム中 さいころを振った後の移動を行う
	app.get("/move", function(req, res, next){
		if(!game.isPlay(req.user)){
			next();
		}else{
			res.send("移動した なんかjsonを返す NPCの行動結果も返す");
		}
	});

	// ゲーム中 カードを使う
	app.get("/card", function(req, res, next){
		if(!game.isPlay(req.user)){
			next();
		}else{
			res.send("カード使った なんかjsonを返す NPCの行動結果も返す");
		}
	});

	// ゲーム中断命令
	app.get("/exit", function(req, res, next){
		if(!game.isPlay(req.user)){
			next();
		}else{
			game.exit(req.user);
			res.redirect("/stage/normal");
		}
	});

	// ゲーム中 変なページをたたいたときのリダイレクト
	app.all("*", function(req, res, next){
		if(!req.user || !game.isPlay(req.user)){
			next();
		}else if(req.url == "/jsx/game.js"){
			next();
		}else if(req.url.indexOf("/sound") == 0){
			next();
		}else{
			if(req.url == "/game/hoge"){
				res.render("game/index.ejs");
			}else{
				res.redirect("/game/hoge"); // TODO 正しいステージ名をDBから抜き出してつける
			}
		}
	});

	// ゲーム開始命令
	app.get("/game/:stage", function(req, res){
		game.init(req.user, req.params.stage);
		res.render("game/index.ejs");
	});
};
