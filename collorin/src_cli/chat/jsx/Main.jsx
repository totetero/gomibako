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
	static var field : Field;
	static var player : Player[];
	static var clist : DrawUnit[];

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
		Main.field = new Field();
		Main.clist = new DrawUnit[];
		Main.player = new Player[];
		Main.player.push(new Player());
	}

	// ----------------------------------------------------------------
	// メインループ
	static function mainloop() : void{
		Ctrl.calc();
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);

		var x = 100;
		var y = 100;

		// フィールド描画
		Main.field.draw(x, y);
		// プレイヤー描画準備
		for(var i = 0; i < Main.player.length; i++){Main.player[i].preDraw(x, y);}
		// キャラクター描画
		DrawUnit.drawList(Main.clist);

		// ループ
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

// 地面クラス
class Field{
	var canvas : HTMLCanvasElement;
	var context : CanvasRenderingContext2D;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// キャンバス作成
		this.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		var r = this.canvas.width = this.canvas.height = 510;
		var divide = 20;
		var margin = 5;
		// 地形画像作成
		for(var i = 0; i < 2; i++){
			for(var j = 0; j < divide + 1; j++){
				var pos = margin + (r - margin * 2) * j / divide;
				this.context.beginPath();
				if(i == 0){this.context.moveTo(margin, pos); this.context.lineTo(r - margin, pos);}
				if(i == 1){this.context.moveTo(pos, margin); this.context.lineTo(pos, r - margin);}
				this.context.closePath();
				this.context.stroke();
			}
		}
		// 画像枠線作成
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(0, r);
		this.context.lineTo(r, r);
		this.context.lineTo(r, 0);
		this.context.closePath();
		this.context.stroke();
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(x : number, y : number) : void{
		// 地形描画
		Ctrl.context.save();
		Ctrl.context.translate(Ctrl.canvas.width * 0.5, Ctrl.canvas.height * 0.5);
		Ctrl.context.scale(Ctrl.scale, Ctrl.scale * Ctrl.sinh);
		Ctrl.context.rotate(Ctrl.rotv);
		Ctrl.context.translate(-x, -y);
		Ctrl.context.drawImage(this.canvas, 0, 0);

		if(Ctrl.mdn){
			// マウス座標から座標の獲得
			var c = Math.cos(Ctrl.rotv);
			var s = Math.sin(Ctrl.rotv);
			var x0 = (Ctrl.mx - Ctrl.canvas.width * 0.5) / Ctrl.scale;
			var y0 = (Ctrl.my - Ctrl.canvas.height * 0.5) / (Ctrl.scale * Ctrl.sinh);
			var mx = (x0 *  c + y0 * s) + x;
			var my = (x0 * -s + y0 * c) + y;
			// タッチ座標位置描画
			Ctrl.context.fillStyle = "rgba(0, 0, 0, 0.5)";
			Ctrl.context.beginPath();
			Ctrl.context.arc(mx, my, 6, 0, Math.PI*2, false);
			Ctrl.context.fill();
		}

		// 描画終了
		Ctrl.context.restore();
	}
}

// プレイヤークラス
class Player{
	var drawCharacter : DrawPlayer;
	var x = 100;
	var y = 100;
	var r = Math.PI / 180 * 90;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this.drawCharacter = new DrawPlayer(Main.imgs["player"]);
		Main.clist.push(this.drawCharacter);
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number) : void{
		this.drawCharacter.preDraw(this.x - x, this.y - y, 0, this.r, 1.2);
		this.drawCharacter.setPose(0);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

