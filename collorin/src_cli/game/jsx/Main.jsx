import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Ctrl.jsx';
import 'EventCartridge.jsx';
import 'Field.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Main{
	// 画像リスト
	static var imgs : Map.<HTMLImageElement>;
	// イベントリスト
	static var slist : EventCartridge[];
	static var plist : EventCartridge[];

	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		var jdat = js.global["jdat"] as variant;
		// 画像準備
		Main.imgs = {} : Map.<HTMLImageElement>;
		Main.regImg(jdat["imgs"] as Map.<string>, function(){
			delete jdat["imgs"];
			// 初期化
			Ctrl.init();
			Cbtn.init();
			Ccvs.init();
			Main.init();
			Game.init();
			// メインループ開始
			Main.mainloop();
			// ローディング表記除去
			dom.document.body.removeChild(dom.document.getElementById("loading"));
		});
	}

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Main.slist = new EventCartridge[];
		Main.plist = new EventCartridge[];
	}

	// ----------------------------------------------------------------
	// mainloop関数
	static function mainloop() : void{
		Ctrl.calc();
		Cbtn.calc();
		Ccvs.calc();
		// イベント処理
		EventCartridge.serialEvent(Main.slist);
		EventCartridge.parallelEvent(Main.plist);
		// 描画処理
		Game.draw();
		// 次のフレームへ
		Timer.setTimeout(Main.mainloop, 33);
	}

	// ----------------------------------------------------------------
	// base64情報配列から画像登録
	static function regImg(b64imgs : Map.<string>, callback : function():void) : void{
		var count = 0;
		for(var i in b64imgs){count++;}
		for(var i in b64imgs){
			var img = dom.createElement("img") as HTMLImageElement;
			img.onload = function(e : Event){
				// すべての登録が終わったらコールバック
				if(--count == 0){callback();}
			};
			img.src = b64imgs[i];
			Main.imgs[i] = img;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class Game{
	static var field : Field;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		(Game.field = new Field()).init();

		Main.slist.push(new ECone(function(){
			log "test";
		}));
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		Cbtn.draw();
		// 描画開始
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		Ctrl.context.fillStyle = "pink";
		Ctrl.context.fillRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		Game.field.draw(Ccvs.fx, Ccvs.fy);
		// 描画test
		Ctrl.context.drawImage(Main.imgs["player"], 0, 0);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

