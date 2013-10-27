import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Ctrl.jsx';
import 'Socket.jsx';
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

	static var mdn : boolean = false;

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
			Socket.init("太郎");
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
		//Main.player.push(new Player(300, 200));
		//Main.field.mx = Main.player[0].x0;
		//Main.field.my = Main.player[0].y0;
	}

	// ----------------------------------------------------------------
	// メインループ
	static function mainloop() : void{
		// カメラ位置
		var cx = 0;
		var cy = 0;

		// コントローラ計算
		Ctrl.calc();

		// キャラ追加確認
		for(var id in Socket.users){
			var exist = false;
			for(var i = 0; i < Main.player.length; i++){if(Main.player[i].id == id){exist = true;}}
			if(!exist){
				// キャラ追加
				var pdat = Socket.users[id];
				Main.player.push(new Player(id, pdat.dstx, pdat.dsty));
				if(id == Socket.playerId){
					// 追加されたのが操作プレイヤーの場合はフィールド移動先マーカーの設定
					Main.field.mx = pdat.dstx;
					Main.field.my = pdat.dsty;
				}
			}
		}
		// キャラ情報確認
		for(var i = 0; i < Main.player.length; i++){
			var player = Main.player[i];
			var pdat = Socket.users[player.id];
			if(pdat){
				player.x1 = pdat.dstx;
				player.y1 = pdat.dsty;
				if(player.serif != pdat.serif){
					// 台詞更新
					player.serif = pdat.serif;
					player.balloon.setText(player.serif, -1);
				}
				if(player.id == Socket.playerId){
					// カメラ位置を操作プレイヤーに合わせる
					cx = player.x0;
					cy = player.y0;
				}
			}else{
				// 切断によるキャラ削除
				player.character.exist = false;
				player.balloon.exist = false;
				Main.player.splice(i--,1);
			}
		}

		// タッチ
		if(Main.mdn != Ctrl.mdn){
			Main.mdn = Ctrl.mdn;
			if(!Ctrl.mdn && !Ctrl.mmv){
				// フィールドにおけるタッチ座標位置の計算とフィールド移動先マーカーの設定
				var c = Math.cos(Ctrl.rotv);
				var s = Math.sin(Ctrl.rotv);
				var x0 = (Ctrl.mx - Ctrl.canvas.width * 0.5) / Ctrl.scale;
				var y0 = (Ctrl.my - Ctrl.canvas.height * 0.5) / (Ctrl.scale * Ctrl.sinh);
				Main.field.mx = (x0 *  c + y0 * s) + cx;
				Main.field.my = (x0 * -s + y0 * c) + cy;
				// タッチ座標を移動情報として送信
				Socket.sendDst(Main.field.mx, Main.field.my);
				Socket.sendStr("おういお");
			}
		}

		// キャラ計算
		for(var i = 0; i < Main.player.length; i++){Main.player[i].calc();}

		// 描画開始
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		// フィールド描画
		Main.field.draw(cx, cy);
		// プレイヤー描画準備
		for(var i = 0; i < Main.player.length; i++){Main.player[i].preDraw(cx, cy);}
		// プレイヤー描画
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
	// タッチ座標位置
	var mdn : boolean = false;
	var mx : int = 0;
	var my : int = 0;

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

		// タッチ座標位置描画
		Ctrl.context.fillStyle = "rgba(0, 0, 0, 0.5)";
		Ctrl.context.beginPath();
		Ctrl.context.arc(this.mx, this.my, 16, 0, Math.PI*2, false);
		Ctrl.context.arc(this.mx, this.my, 12, 0, Math.PI*2, true);
		Ctrl.context.fill();

		// 描画終了
		Ctrl.context.restore();
	}
}

// プレイヤークラス
class Player{
	var character : DrawPlayer;
	var balloon : DrawBalloon;
	var id : string;
	var x0 : number;
	var y0 : number;
	var x1 : number;
	var y1 : number;
	var r : number;
	var action : int;
	var serif : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(id : string, x : number, y : number){
		this.character = new DrawPlayer(Main.imgs["player"]);
		this.balloon = new DrawBalloon();
		Main.clist.push(this.character);
		Main.clist.push(this.balloon);

		this.id = id;
		this.x0 = this.x1 = x;
		this.y0 = this.y1 = y;
		this.r = Math.PI / 180 * 90;
		this.action = 0;
		this.serif = "";
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		if(this.x1 != this.x0 || this.y1 != this.y0){
			// 目的地に移動
			var x = this.x1 - this.x0;
			var y = this.y1 - this.y0;
			var speed = 3.0;
			if(x * x + y * y < speed * speed){
				this.x0 = this.x1;
				this.y0 = this.y1;
			}else{
				this.r = Math.atan2(y, x);
				this.x0 += speed * Math.cos(this.r);
				this.y0 += speed * Math.sin(this.r);
			}
			this.action++;
		}else{
			// 静止
			this.action = 0;
		}
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number) : void{
		this.character.preDraw(this.x0 - x, this.y0 - y, 0, this.r, 1.2);
		this.character.setPose(this.action);
		this.balloon.preDraw(this.x0 - x, this.y0 - y, 30, 1.2);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

