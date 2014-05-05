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
		var flow = new FlowController();
		var refbookIndex = 1;

		// キャラクター登録
		flow.add(function(next:function():void):void{
			// データベースリセット
			js.eval("""require("mongoose").model("CharaBase").remove({}, next)""");
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.charaCode = "player0";
			temp.name = "コニワ";
			temp.imageCode = "player0";
			temp.drawInfoCode = "human";
			temp.refbookIndex = refbookIndex++;
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.charaCode = "player1";
			temp.name = "レッドパピヨン";
			temp.imageCode = "player1";
			temp.drawInfoCode = "human";
			temp.refbookIndex = refbookIndex++;
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.charaCode = "player2";
			temp.name = "パステル";
			temp.imageCode = "player2";
			temp.drawInfoCode = "human";
			temp.refbookIndex = refbookIndex++;
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.charaCode = "player3";
			temp.name = "ぽに子";
			temp.imageCode = "player3";
			temp.drawInfoCode = "human";
			temp.refbookIndex = refbookIndex++;
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.charaCode = "enemy1";
			temp.name = "赤しゃれこうべ";
			temp.imageCode = "enemy1";
			temp.drawInfoCode = "human";
			temp.refbookIndex = refbookIndex++;
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.charaCode = "enemy2";
			temp.name = "緑しゃれこうべ";
			temp.imageCode = "enemy2";
			temp.drawInfoCode = "human";
			temp.refbookIndex = refbookIndex++;
			temp.save(function(err:variant):void{next();});
		}).add(function(next:function():void):void{
			var temp = new CharaBaseModel();
			temp.charaCode = "enemy3";
			temp.name = "青しゃれこうべ";
			temp.imageCode = "enemy3";
			temp.drawInfoCode = "human";
			temp.refbookIndex = refbookIndex++;
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

