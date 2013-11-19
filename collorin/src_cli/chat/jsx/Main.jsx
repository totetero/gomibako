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

	// タッチ情報
	static var mdn : boolean = false;
	// カメラ情報
	static var camerax : number;
	static var cameray : number;
	// 選択マーカー情報
	static var markerIdx : int;
	static var markerx : number;
	static var markery : number;
	static var markerDiv : HTMLDivElement;

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
			Socket.init();
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

		// 選択マーカーDOM作成
		Main.markerDiv = dom.document.createElement("div") as HTMLDivElement;
		Main.markerDiv.style.position = "absolute";
		Main.markerDiv.style.left = "10px";
		Main.markerDiv.style.bottom = "10px";
		dom.document.body.appendChild(Main.markerDiv);
		Main.markerIdx = -1;

		// 戻るリンクDOM作成
		var backDiv = dom.document.createElement("div") as HTMLDivElement;
		backDiv.style.position = "absolute";
		backDiv.style.right = "10px";
		backDiv.style.bottom = "10px";
		backDiv.innerHTML = "<a href='/mypage'>マイページにもどる</a>";
		dom.document.body.appendChild(backDiv);
	}

	// ----------------------------------------------------------------
	// メインループ
	static function mainloop() : void{
		Ctrl.calc();
		Main.calc();
		Main.draw();
		// ループ
		Timer.setTimeout(Main.mainloop, 33);
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ソケット処理 キャラ追加確認
		for(var id in Socket.users){
			var exist = false;
			for(var i = 0; i < Main.player.length; i++){if(Main.player[i].id == id){exist = true;}}
			if(!exist){
				// キャラ追加
				var pdat = Socket.users[id];
				Main.player.push(new Player(id, pdat.name, pdat.imgname, pdat.dstx, pdat.dsty));
				if(id == Socket.playerId){
					// 追加されたのが操作プレイヤーの場合は選択マーカーの設定
					Main.markerx = pdat.dstx;
					Main.markery = pdat.dsty;
				}
			}
		}

		// ソケット処理 キャラ情報確認
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
			}else{
				// 切断によるキャラ削除
				player.character.exist = false;
				player.balloon.exist = false;
				Main.player.splice(i--,1);
			}
		}

		// キャラ計算
		for(var i = 0; i < Main.player.length; i++){
			var player = Main.player[i];
			Main.player[i].calc();
			if(player.id == Socket.playerId){
				// カメラ位置を操作プレイヤーに合わせる
				Main.camerax = player.x0;
				Main.cameray = player.y0;
			}
			if(Main.markerIdx == i){
				// マークされていた場合は選択マーカー座標をキャラクターに合わせる
				Main.markerx = player.x0;
				Main.markery = player.y0;
			}
		}

		// タッチ処理
		if(Main.mdn != Ctrl.mdn){
			Main.mdn = Ctrl.mdn;
			if(!Ctrl.mdn && !Ctrl.mmv && (0 < Ctrl.mx && Ctrl.mx < Ctrl.canvas.width && 0 < Ctrl.my && Ctrl.my < Ctrl.canvas.height)){
				var c = Math.cos(Ctrl.rotv);
				var s = Math.sin(Ctrl.rotv);
				
				// キャラクター位置をタッチ座標系に変換してキャラクタータッチの確認
				Main.markerIdx = -1;
				for(var i = 0, depth = 0; i < Main.player.length; i++){
					var player = Main.player[i];
					if(player.id != Socket.playerId && (Main.markerIdx < 0 || depth < Main.player[i].character.drz)){
						var x0 = player.x0 - Main.camerax;
						var y0 = player.y0 - Main.cameray;
						var x1 = Ctrl.canvas.width * 0.5 + (x0 * c + y0 * -s) * Ctrl.scale;
						var y1 = Ctrl.canvas.height * 0.5 + (x0 * s + y0 *  c) * (Ctrl.scale * Ctrl.sinh);
						if(x1 - 15 < Ctrl.mx && Ctrl.mx < x1 + 15 && y1 - 30 < Ctrl.my && Ctrl.my < y1 + 10){
							Main.markerIdx = i;
							depth = player.character.drz;
						}
					}
				}
				
				if(Main.markerIdx < 0){
					// フィールドにおけるタッチ座標位置の計算と選択マーカー設定
					var x0 = (Ctrl.mx - Ctrl.canvas.width * 0.5) / Ctrl.scale;
					var y0 = (Ctrl.my - Ctrl.canvas.height * 0.5) / (Ctrl.scale * Ctrl.sinh);
					Main.markerx = (x0 *  c + y0 * s) + Main.camerax;
					Main.markery = (x0 * -s + y0 * c) + Main.cameray;
					Main.markerDiv.innerHTML = "";
					// タッチ座標を移動情報として送信
					Socket.sendDst(Main.markerx, Main.markery);
				}else{
					// タッチされたキャラクターの情報を得る
					Main.markerDiv.innerHTML = Main.player[Main.markerIdx].name;
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// 描画開始
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		if(Socket.playerId != ""){
			// フィールド描画
			Main.field.draw(Main.camerax, Main.cameray);
			// プレイヤー描画準備
			for(var i = 0; i < Main.player.length; i++){Main.player[i].preDraw(Main.camerax, Main.cameray);}
			// プレイヤー描画
			DrawUnit.drawList(Main.clist);
		}
	}

	// ----------------------------------------------------------------
	// base64情報配列から画像登録
	static function regImg(b64imgs : Map.<string>, callback : function():void) : void{
		var count = 0;
		for(var i in b64imgs){count++;}
		if(count > 0){
			for(var i in b64imgs){
				var img = dom.createElement("img") as HTMLImageElement;
				img.onload = function(e : Event){
					// すべての登録が終わったらコールバック
					if(--count == 0){callback();}
				};
				img.src = b64imgs[i];
				Main.imgs[i] = img;
			}
		}else{
			callback();
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

		// 選択マーカー描画
		Ctrl.context.strokeStyle = (Main.markerIdx < 0) ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 0, 0, 0.5)";
		Ctrl.context.lineWidth = 4;
		Ctrl.context.beginPath();
		Ctrl.context.arc(Main.markerx, Main.markery, 14, 0, Math.PI*2, false);
		Ctrl.context.stroke();

		// 描画終了
		Ctrl.context.restore();
	}
}

// プレイヤークラス
class Player{
	var character : DrawPlayer;
	var balloon : DrawBalloon;
	var id : string;
	var name : string;
	var x0 : number;
	var y0 : number;
	var x1 : number;
	var y1 : number;
	var r : number;
	var action : int;
	var serif : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(id : string, name : string, imgname : string, x : number, y : number){
		var img = Main.imgs[imgname];
		if(!img){img = Main.imgs["player"];}
		this.character = new DrawPlayer(img);
		this.balloon = new DrawBalloon();
		Main.clist.push(this.character);
		Main.clist.push(this.balloon);

		this.id = id;
		this.name = name;
		this.x0 = this.x1 = x;
		this.y0 = this.y1 = y;
		this.r = Math.PI / 180 * 360 * Math.random();
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

