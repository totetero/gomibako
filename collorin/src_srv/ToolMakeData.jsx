import "js.jsx";
import "require/mongo.jsx";
import "models/Character.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// データ登録

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		// データベース接続 mongo
		mongoose.connect("mongodb://localhost/totetest");
		// データベースリセット
		js.eval("""require("mongoose").model("CharaBase").remove({}, function(){})""");
		var flow = new FlowController();

		// キャラクター登録
		flow.add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.name = "コニワ";
			temp.charaCode = "player0";
			temp.imageCode = "player0";
			temp.drawInfoCode = "human";
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.name = "レッドパピヨン";
			temp.charaCode = "player1";
			temp.imageCode = "player1";
			temp.drawInfoCode = "human";
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.name = "パステル";
			temp.charaCode = "player2";
			temp.imageCode = "player2";
			temp.drawInfoCode = "human";
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.name = "ぽに子";
			temp.charaCode = "player3";
			temp.imageCode = "player3";
			temp.drawInfoCode = "human";
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.name = "赤しゃれこうべ";
			temp.charaCode = "enemy1";
			temp.imageCode = "enemy1";
			temp.drawInfoCode = "human";
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.name = "緑しゃれこうべ";
			temp.charaCode = "enemy2";
			temp.imageCode = "enemy2";
			temp.drawInfoCode = "human";
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.name = "青しゃれこうべ";
			temp.charaCode = "enemy3";
			temp.imageCode = "enemy3";
			temp.drawInfoCode = "human";
			temp.save(function(err:variant):void{next();});
		});

		// フロー制御開始
		flow.add(function(next:function():void):void{js.eval("process.exit();");});
		flow.start();
	}
}

// 簡易フロー制御
class FlowController{
	var funcs = [] : Array.<function(next:function():void):void>;
	function add(func : function(next:function():void):void) : FlowController{this.funcs.push(func); return this;}
	function start() : void{if(this.funcs.length > 0){(this.funcs.shift())(function():void{this.start();});}}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

