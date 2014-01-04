import "../require/nodejs.jsx";
import "../require/express.jsx";
import "../util/File.jsx";

import "../models/User.jsx";
import "../data/CharacterDrawInfo.jsx";

// ゲームページ
class GamePage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// ゲーム中 ゲーム情報を返す
		app.get("/getdat", function(req : ExRequest, res : ExResponse, next : function():void){
			if(!GamePage.isPlay(req.user)){
				next();
			}else{
				GamePage.getddat(req.user, function(data : string){
					res.contentType("application/json");
					res.send(data);
				});
			}
		});

		// ゲーム中 さいころを振る
		app.get("/dice", function(req : ExRequest, res : ExResponse, next : function():void){
			if(!GamePage.isPlay(req.user)){
				next();
			}else{
				// test
				var pip = Math.floor(Math.random() * 6) + 1;
				res.send(JSON.stringify({"pip": pip}));
			}
		});

		// ゲーム中 さいころを振った後の移動を行う
		app.get("/move", function(req : ExRequest, res : ExResponse, next : function():void){
			if(!GamePage.isPlay(req.user)){
				next();
			}else{
				res.send("移動した なんかjsonを返す NPCの行動結果も返す");
			}
		});

		// ゲーム中 カードを使う
		app.get("/card", function(req : ExRequest, res : ExResponse, next : function():void){
			if(!GamePage.isPlay(req.user)){
				next();
			}else{
				res.send("カード使った なんかjsonを返す NPCの行動結果も返す");
			}
		});

		// ゲーム中断命令
		app.get("/exit", function(req : ExRequest, res : ExResponse, next : function():void){
			if(!GamePage.isPlay(req.user)){
				next();
			}else{
				GamePage.exit(req.user);
				res.redirect("/stage/normal");
			}
		});

		// ゲーム中 変なページをたたいたときのリダイレクト
		app.all("*", function(req : ExRequest, res : ExResponse, next : function():void){
			if(!req.user || !GamePage.isPlay(req.user)){
				next();
			}else if(req.url.indexOf("/sound") == 0){
				next();
			}else{
				if(req.url == "/game/hoge"){
					GamePage.gameRender(req, res);
				}else{
					res.redirect("/game/hoge"); // TODO 正しいステージ名をDBから抜き出してつける
				}
			}
		});

		// ゲーム開始命令
		app.get("/game/:stage", function(req : ExRequest, res : ExResponse, next : function():void){
			GamePage.init(req.user, req.params["stage"] as string);
			GamePage.gameRender(req, res);
		});
	}

	// ----------------------------------------------------------------
	// ゲームページ描画
	static function gameRender(req : ExRequest, res : ExResponse) : void{
		GamePage.getsdat(function(data : string){
			res.render("common/index.ejs", {title: "すごろく", daturl: "/getdat", jdat: data});
		});
	}

	// ----------------------------------------------------------------
	// ゲームの初期化
	static function init(user : UserModel, stage : string) : void{
		user.gamestat = true;
		user.save(function(err:variant):void{});
	}

	// ----------------------------------------------------------------
	// ゲームの中断
	static function exit(user : UserModel) : void{
		user.gamestat = false;
		user.save(function(err:variant):void{});
	}

	// ----------------------------------------------------------------
	// ゲームプレイ中確認
	static function isPlay(user : UserModel) : boolean{
		return user.gamestat;
	}

	// ----------------------------------------------------------------
	// ゲーム静的情報
	static function getsdat(callback : function(jdat:string):void) : void{
		var jdat = {} : Map.<variant>;
		var js = new string[];
		var css = new string[];
		var strs = {} : Map.<string>;

		js.push("./src_cli/game/jsx/game.js");
		js.push("./src_cli/game/js/init.js");
		css.push("./src_cli/game/css/main.css");
		css.push("./src_cli/game/css/title.css");
		css.push("./src_cli/game/css/button.css");
		css.push("./src_cli/game/css/status.css");
		css.push("./src_cli/game/css/menu.css");
		strs["mainTag"] = "./src_cli/game/html/main.tag";

		new FileUtilJsonData(js, css, null, strs, function(data : FileUtilJsonData){
			jdat["js"] = data.js;
			jdat["css"] = data.css;
			jdat["strs"] = data.strs;
			callback(JSON.stringify(jdat));
		});
	}

	// ----------------------------------------------------------------
	// ゲーム動的情報
	static function getddat(user : UserModel, callback : function(jdat:string):void) : void{
		var jdat = {} : Map.<variant>;
		var imgs = {} : Map.<string>;

		// フィールド情報
		jdat["stagename"] = "高天原";
		jdat["hex"] = [
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
		jdat["player"] = [
			{id: "player1", drawInfo: "human", x: 1, y : 7, r: Math.PI * 1.5},
			{id: "player2", drawInfo: "human", x: 2, y : 7, r: Math.PI * 1.5},
		];

		// 敵情報
		jdat["enemy"] = [
			{id: "enemy3", drawInfo: "human", x: 2, y : 4, r: Math.PI * 0.5},
		];

		// 画像など読み込み
		var drawInfoList = {} : Map.<CharacterDrawInfo>;
		var charaList : variant[][] = [jdat["player"] as variant[], jdat["enemy"] as variant[]];
		for(var i = 0; i < charaList.length; i++){
			for(var j = 0; j < charaList[i].length; j++){
				var id = charaList[i][j]["id"] as string;
				var drawInfo = charaList[i][j]["drawInfo"] as string;
				imgs["dot_" + id] = "./src_cli/common/img/character/" + id + "/dot.png";
				if(i == 0){imgs["b64_bust_" + id] = "./src_cli/common/img/character/" + id + "/bust.png";}
				drawInfoList[drawInfo] = CharacterDrawInfo.data[drawInfo];
			}
		}
		jdat["drawInfo"] = drawInfoList;

		new FileUtilJsonData(null, null, imgs, null, function(data : FileUtilJsonData){
			jdat["imgs"] = data.imgs;
			callback(JSON.stringify(jdat));
		});
	}
}

