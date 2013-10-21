import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Ctrl.jsx';
import 'Character.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Main{
	static var imgs : Map.<HTMLImageElement>;
	static var clist : DrawUnit[];
	static var player : DrawPlayer;

	// フィールド画像
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;

	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		var jdat = js.global["jdat"] as variant;
		// 画像準備
		Main.imgs = {} : Map.<HTMLImageElement>;
		Main.regImg(jdat["load"]["imgs"] as Map.<string>, function(){
			delete jdat["load"]["imgs"];
			// 初期化
			Ctrl.init();
			Main.init();
			// メインループ開始
			Main.mainloop();
			// ローディング表記除去
			dom.document.body.removeChild(dom.document.getElementById("loading"));
		});
	}

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Main.clist = new DrawUnit[];
		Main.clist.push(Main.player = new DrawPlayer(Main.imgs["player"]));

		// フィールド画像作成準備
		Main.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Main.context = Main.canvas.getContext("2d") as CanvasRenderingContext2D;
		var r = Main.canvas.width = Main.canvas.height = 500;
		// フィールド画像作成
		for(var i = 0; i < 2; i++){
			for(var j = 0; j < 20; j++){
				var pos = 5 + (r - 10) * j / 19;
				Main.context.beginPath();
				if(i == 0){Main.context.moveTo(5, pos); Main.context.lineTo(r - 5, pos);}
				if(i == 1){Main.context.moveTo(pos, 5); Main.context.lineTo(pos, r - 5);}
				Main.context.closePath();
				Main.context.stroke();
			}
		}
	}

	// ----------------------------------------------------------------
	// mainloop関数
	static function mainloop() : void{
		Ctrl.calc();
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);

		// フィールド描画
		Ctrl.context.save();
		Ctrl.context.translate(Ctrl.canvas.width * 0.5, Ctrl.canvas.height * 0.5);
		Ctrl.context.scale(Ctrl.scale, Ctrl.scale * Ctrl.sinh);
		Ctrl.context.rotate(Ctrl.rotv);
		var x = 0;
		var y = 0;
		Ctrl.context.drawImage(Main.canvas, -x, -y);
		Ctrl.context.restore();

		// プレイヤー描画準備
		var x = 0;
		var y = 0;
		var z = 0;
		var r = Math.PI / 180 * 90;
		Main.player.preDraw(x, y, z, r, 1.2);
		Main.player.setPose(0);
		// キャラクター描画
		DrawUnit.drawList(Main.clist);

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

