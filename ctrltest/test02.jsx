import "js/web.jsx";
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// メインクラス

class _Main{
	static var player : Player = new Player();
	static var characterList : Character[] = new Character[];
	static var k_s : boolean = false;
	static var stop : boolean = false;
	
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void {
		ImageLoader.init();
		Ctrl.init();
		_Main.init();
		
		// 画像などロードの完了待ちしてから開始する
		var isLoaded = function() : void {
			if(ImageLoader.isLoaded()){
				Timer.setInterval(function():void{
					Ctrl.calc();
					_Main.calc();
					_Main.draw();
					Ctrl.draw();
				}, 16);
			}else{
				Timer.setTimeout(isLoaded, 1000);
			}
		};
		isLoaded();
	}
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void {
		_Main.player.init();
		_Main.characterList.push(_Main.player);
	}
	
	// ----------------------------------------------------------------
	// 計算
	static function calc() : void {
		// ポーズボタン確認
		if(_Main.k_s != Ctrl.k_s){
			_Main.k_s = Ctrl.k_s;
			if(_Main.k_s == true){
				_Main.stop = !_Main.stop;
			}
		}
		
		if(!_Main.stop){
			// キャラクタリストの処理
			for(var i = 0; i < _Main.characterList.length; i++){
				if(!_Main.characterList[i].calc()){
					// リストから取り除く
					_Main.characterList.splice(i--, 1);
				}
			}
			// ならべかえ
			_Main.characterList.sort(function(p0 : Nullable.<Character>, p1 : Nullable.<Character>) : int {return (p0.y - p1.y) * 1000;});
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw() : void {
		// クリア
		Ctrl.context.fillStyle = "#00f";
		Ctrl.context.fillRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		// キャラクタ描画
		var length : int = _Main.characterList.length;
		for(var i = 0; i < length; i++){_Main.characterList[i].drawShadow();}
		for(var i = 0; i < length; i++){_Main.characterList[i].draw();}
		// 静止状態
		if(_Main.stop){
			Ctrl.context.fillStyle = "rgba(0, 0, 0, 0.5)";
			Ctrl.context.fillRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// キャラクタークラス

class Character{
	var x : number = 0;
	var y : number = 0;
	var z : number = 0;
	var vx : number = 0;
	var vy : number = 0;
	var vz : number = 0;
	var rot : number = Math.PI * 0.5;
	var shadowSize : int = 0;
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : boolean {return false;}
	
	// ----------------------------------------------------------------
	// 描画
	function draw() : void {}
	
	// ----------------------------------------------------------------
	// 影の描画
	function drawShadow() : void{
		Ctrl.context.fillStyle = "rgba(0, 0, 0, 0.5)";
		Ctrl.context.beginPath();
		Ctrl.context.save();
		Ctrl.context.translate(this.x, this.y);
		Ctrl.context.scale(1, 0.5);
		Ctrl.context.translate(-this.x, -this.y);
		Ctrl.context.arc(this.x, this.y, this.shadowSize, 0, Math.PI * 2.0, true);
		Ctrl.context.restore();
		Ctrl.context.fill();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// プレイヤークラス

class Player extends Character{
	var action : int = 0;
	var k_x : boolean = false;
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void {
		this.x = Ctrl.canvas.width * 0.5;
		this.y = Ctrl.canvas.height * 0.5;
		this.shadowSize = 8;
	}
	
	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean {
		if(this.z > 0){
			// 空中にいる
			this.vz -= 0.1;
		}else if(Ctrl.k_z){
			// ジャンプボタンを押した
			this.vz = 2.0;
			this.action = 1;
		}else{
			this.action++;
			// 移動確認
			var moveFlag : boolean = true;
			if     (Ctrl.krt && Ctrl.kup){this.rot = Math.PI * 1.74;}
			else if(Ctrl.klt && Ctrl.kup){this.rot = Math.PI * 1.26;}
			else if(Ctrl.klt && Ctrl.kdn){this.rot = Math.PI * 0.74;}
			else if(Ctrl.krt && Ctrl.kdn){this.rot = Math.PI * 0.26;}
			else if(Ctrl.krt){this.rot = Math.PI * 0.00;}
			else if(Ctrl.kup){this.rot = Math.PI * 1.50;}
			else if(Ctrl.klt){this.rot = Math.PI * 1.00;}
			else if(Ctrl.kdn){this.rot = Math.PI * 0.50;}
			else{moveFlag = false;}
			// 摩擦
			this.vx *= 0.9;
			this.vy *= 0.9;
			// 速度加算
			if(moveFlag){
				this.vx += 0.5 * Math.cos(this.rot);
				this.vy += 0.5 * Math.sin(this.rot);
			}
			var rr : number = this.vx * this.vx + this.vy * this.vy;
			// 最低速度
			if(rr < 0.1){this.vx = this.vy = 0; this.action = 0;}
			// 最高速度
			var vmax : number = 2.0;
			if(rr > vmax * vmax){
				var r : number = vmax / Math.sqrt(rr);
				this.vx *= r;
				this.vy *= r;
			}
		}
		// キャラクタの移動
		this.x += this.vx;
		this.y += this.vy;
		this.z += this.vz;
		if(this.x < 0){this.x = 0;}else if(this.x > Ctrl.canvas.width){this.x = Ctrl.canvas.width;}
		if(this.y < 0){this.y = 0;}else if(this.y > Ctrl.canvas.height){this.y = Ctrl.canvas.height;}
		if(this.z <= 0){this.z = this.vz = 0;}
		
		// 弾丸発射
		if(this.k_x != Ctrl.k_x){
			this.k_x = Ctrl.k_x;
			if(this.k_x == true){
				_Main.characterList.push(new Shot(this, 8));
			}
		}
		
		return true;
	}
	
	// ----------------------------------------------------------------
	// 描画
	override function draw() : void {
		// 画像テクスチャ選択 足踏み
		var u : int = this.action == 0 ? 0 : 1 + Math.floor(this.action / 8) % 4;
		if(u == 4){u = 2;}
		// 画像テクスチャ選択 向き
		var v : int = Math.floor(this.rot / (Math.PI * 0.5) - 0.5);
		while(v < 0){v += 4;}
		v %= 4;
		// キャラクタ描画
		var s : number = 32;
		var x : int = this.x - s / 2;
		var y : int = this.y - s - this.z;
		Ctrl.context.drawImage(ImageLoader.list["player"], u * 32, v * 32, 32, 32, x, y, s, s);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 弾丸クラス

class Shot extends Character{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(master : Character, height : number){
		this.x = master.x;
		this.y = master.y;
		this.z = master.z + height;
		this.rot = master.rot;
		this.vx = 2.5 * Math.cos(this.rot);
		this.vy = 2.5 * Math.sin(this.rot);
		this.shadowSize = 4;
	}
	
	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean {
		// 弾丸の移動
		this.x += this.vx;
		this.y += this.vy;
		this.z += this.vz;
		if(this.x < 0 || this.x > Ctrl.canvas.width){return false;}
		if(this.y < 0 || this.y > Ctrl.canvas.height + this.z){return false;}
		return true;
	}
	
	// ----------------------------------------------------------------
	// 描画
	override function draw() : void {
		// 弾丸描画
		Ctrl.context.fillStyle = "rgba(0, 0, 0, 1)";
		Ctrl.context.beginPath();
		Ctrl.context.arc(this.x, this.y - this.z, 4, 0, Math.PI * 2.0, true);
		Ctrl.context.fill();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 画像読み込みクラス

class ImageLoader{
	static var imgs : HTMLImageElement[] = new HTMLImageElement[];
	static var list = {} : Map.<HTMLImageElement>;
	
	// ----------------------------------------------------------------
	// 全画像読み込み
	static function init() : void {
		ImageLoader.list["ctrl"] = ImageLoader.load("ctrl.png");
		ImageLoader.list["player"] = ImageLoader.load("player.png");
	}
	
	// ----------------------------------------------------------------
	// 画像一つ読み込み
	static function load(url : string) : HTMLImageElement {
		var img = dom.createElement("img") as HTMLImageElement;
		img.src = url;
		ImageLoader.imgs.push(img);
		return img;
	}
	
	// ----------------------------------------------------------------
	// 読み込み完了確認
	static function isLoaded() : boolean {
		var flag : boolean = true;
		for(var i = 0; i < ImageLoader.imgs.length; i++){
			flag = flag && ImageLoader.imgs[i].complete;
		}
		return flag;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 操作用クラス

native class JsCtrlUtil{static function isTouch() : boolean;}

class Ctrl{
	// ゲーム画面用 divとcanvas
	static var div : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// コントローラー用 divとcanvas
	static var rcvs : HTMLCanvasElement;
	static var lcvs : HTMLCanvasElement;
	static var rctx : CanvasRenderingContext2D;
	static var lctx : CanvasRenderingContext2D;
	// キー状態
	static var kup : boolean = false;
	static var kdn : boolean = false;
	static var krt : boolean = false;
	static var klt : boolean = false;
	static var k_z : boolean = false;
	static var k_x : boolean = false;
	static var k_s : boolean = false;
	// マウス状態
	static var isTouch : boolean = false;
	static var mdn : boolean = false;
	static var mx : int = 0;
	static var my : int = 0;
	
	// 内部演算用 ウインドウサイズ
	static var ww : int = 0;
	static var wh : int = 0;
	// 内部演算用 一時的マウス状態
	static var tempmx : int = 0;
	static var tempmy : int = 0;
	static var rdn : boolean = false;
	static var ldn : boolean = false;
	
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void {
		// divの準備
		Ctrl.div = dom.window.document.createElement("div") as HTMLDivElement;
		Ctrl.div.style.position = "absolute";
		dom.window.document.body.appendChild(Ctrl.div);
		// ゲーム画面canvasの準備
		Ctrl.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.context = Ctrl.canvas.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.canvas.style.position = "absolute";
		Ctrl.canvas.width = 265;
		Ctrl.canvas.height = 265;
		Ctrl.div.appendChild(Ctrl.canvas);
		// 左コントローラーcanvasの準備
		Ctrl.lcvs = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.lctx = Ctrl.lcvs.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.lcvs.style.position = "absolute";
		Ctrl.lcvs.width = Ctrl.lcvs.height = 128;
		Ctrl.div.appendChild(Ctrl.lcvs);
		// 右コントローラーcanvasの準備
		Ctrl.rcvs = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.rctx = Ctrl.rcvs.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.rcvs.style.position = "absolute";
		Ctrl.rcvs.width = Ctrl.rcvs.height = 128;
		Ctrl.div.appendChild(Ctrl.rcvs);

		
		// キーリスナー追加
		dom.window.document.addEventListener("keydown", Ctrl.kdnfn, true);
		dom.window.document.addEventListener("keyup", Ctrl.kupfn, true);
		// マウスリスナー追加
		Ctrl.isTouch = JsCtrlUtil.isTouch();
		if(Ctrl.isTouch){
			Ctrl.canvas.addEventListener("touchstart", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("touchmove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("touchend", Ctrl.mupfn, true);
			Ctrl.lcvs.addEventListener("touchstart", Ctrl.lbtndnfn, true);
			Ctrl.lcvs.addEventListener("touchmove", Ctrl.lbtnmvfn, true);
			Ctrl.lcvs.addEventListener("touchend", Ctrl.lbtnupfn, true);
			Ctrl.rcvs.addEventListener("touchstart", Ctrl.rbtndnfn, true);
			Ctrl.rcvs.addEventListener("touchmove", Ctrl.rbtnmvfn, true);
			Ctrl.rcvs.addEventListener("touchend", Ctrl.rbtnupfn, true);
		}else{
			Ctrl.canvas.addEventListener("mousedown", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("mousemove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("mouseup", Ctrl.mupfn, true);
			Ctrl.canvas.addEventListener("mouseout", Ctrl.mupfn, true);
			Ctrl.lcvs.addEventListener("mousedown", Ctrl.lbtndnfn, true);
			Ctrl.lcvs.addEventListener("mousemove", Ctrl.lbtnmvfn, true);
			Ctrl.lcvs.addEventListener("mouseup", Ctrl.lbtnupfn, true);
			Ctrl.lcvs.addEventListener("mouseout", Ctrl.lbtnupfn, true);
			Ctrl.rcvs.addEventListener("mousedown", Ctrl.rbtndnfn, true);
			Ctrl.rcvs.addEventListener("mousemove", Ctrl.rbtnmvfn, true);
			Ctrl.rcvs.addEventListener("mouseup", Ctrl.rbtnupfn, true);
			Ctrl.rcvs.addEventListener("mouseout", Ctrl.rbtnupfn, true);
		}
	}
	
	// ----------------------------------------------------------------
	// 計算
	static function calc() : void {
		// ウインドウサイズの変更確認
		var w : int = dom.window.innerWidth;
		var h : int = dom.window.innerHeight;
		if(Ctrl.ww != w || Ctrl.wh != h){
			Ctrl.ww = w;
			Ctrl.wh = h;
			if(w <= h){
				// 正方形もしくは縦長
				var hspace : number = (Ctrl.canvas.width - Ctrl.lcvs.width - Ctrl.rcvs.width) / 5;
				Ctrl.div.style.left = ((w - Ctrl.canvas.width) * 0.5) as string + "px";
				Ctrl.lcvs.style.left = hspace as string + "px";
				Ctrl.rcvs.style.left = (hspace * 4 + Ctrl.lcvs.width) as string + "px";
				if(h > Ctrl.canvas.height + Ctrl.lcvs.height){
					var vspace : number = (h - Ctrl.canvas.height - Ctrl.lcvs.height) / 3;
					Ctrl.div.style.top = vspace as string + "px";
					Ctrl.lcvs.style.top = (vspace + Ctrl.canvas.height) as string + "px";
					Ctrl.rcvs.style.top = (vspace + Ctrl.canvas.height) as string + "px";
				}else{
					Ctrl.div.style.top = "0px";
					Ctrl.lcvs.style.top = (h - Ctrl.lcvs.height) as string + "px";
					Ctrl.rcvs.style.top = (h - Ctrl.rcvs.height) as string + "px";
				}
			}else{
				// 横長
				Ctrl.div.style.top = ((h - Ctrl.canvas.height) * 0.5) as string + "px";
				Ctrl.lcvs.style.top = ((Ctrl.canvas.height - Ctrl.lcvs.height) * 0.5) as string + "px";
				Ctrl.rcvs.style.top = ((Ctrl.canvas.height - Ctrl.rcvs.height) * 0.5) as string + "px";
				var hposition : int = ((w - Ctrl.canvas.width) * 0.5);
				Ctrl.div.style.left = hposition as string + "px";
				if(w > Ctrl.canvas.width + Ctrl.lcvs.width + Ctrl.rcvs.width){
					Ctrl.lcvs.style.left = (Ctrl.canvas.width * 0.25 - w * 0.25 - Ctrl.lcvs.width * 0.5) as string + "px";
					Ctrl.rcvs.style.left = (Ctrl.canvas.width * 0.75 + w * 0.25 - Ctrl.rcvs.width * 0.5) as string + "px";
				}else{
					Ctrl.lcvs.style.left = "-" + hposition as string + "px";
					Ctrl.rcvs.style.left = (w - hposition - Ctrl.rcvs.width) as string + "px";
				}

			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw() : void {
		Ctrl.lctx.clearRect(0, 0, Ctrl.lcvs.width, Ctrl.lcvs.height);
		Ctrl.rctx.clearRect(0, 0, Ctrl.rcvs.width, Ctrl.rcvs.height);
		Ctrl.lctx.fillStyle = "#ccc";
		Ctrl.lctx.fillRect(0, 0, Ctrl.lcvs.width, Ctrl.lcvs.height);
		Ctrl.rctx.fillStyle = "#ccc";
		Ctrl.rctx.fillRect(0, 0, Ctrl.rcvs.width, Ctrl.rcvs.height);
		// 十字キー
		var lx : int = (Ctrl.lcvs.width - 112) * 0.5;
		var ly : int = (Ctrl.lcvs.height - 112) * 0.5;
		Ctrl.lctx.drawImage(ImageLoader.list["ctrl"], Ctrl.kup ?  88 :  0,  0, 40, 48, lx + 36, ly +  0, 40, 48);
		Ctrl.lctx.drawImage(ImageLoader.list["ctrl"], Ctrl.kdn ? 136 : 48, 40, 40, 48, lx + 36, ly + 64, 40, 48);
		Ctrl.lctx.drawImage(ImageLoader.list["ctrl"], Ctrl.krt ? 128 : 40,  0, 48, 40, lx + 64, ly + 36, 48, 40);
		Ctrl.lctx.drawImage(ImageLoader.list["ctrl"], Ctrl.klt ?  88 :  0, 48, 48, 40, lx +  0, ly + 36, 48, 40);
		// zxスペースキー
		var rx : int = (Ctrl.rcvs.width - 128) * 0.5;
		var ry : int = (Ctrl.rcvs.height - 112) * 0.5;
		Ctrl.rctx.drawImage(ImageLoader.list["ctrl"], 176, Ctrl.k_z ?  64 :  0,  64, 64, rx +  0, ry + 32, 64, 64);
		Ctrl.rctx.drawImage(ImageLoader.list["ctrl"], 176, Ctrl.k_x ?  64 :  0,  64, 64, rx + 64, ry +  0, 64, 64);
		Ctrl.rctx.drawImage(ImageLoader.list["ctrl"],   0, Ctrl.k_s ? 104 : 88, 128, 16, (Ctrl.rcvs.width - 128) * 0.5, Ctrl.rcvs.height - 16, 128, 16);
		Ctrl.rctx.drawImage(ImageLoader.list["ctrl"], 128, 88, 24, 24, rx + 20, ry + 52, 24, 24);
		Ctrl.rctx.drawImage(ImageLoader.list["ctrl"], 152, 88, 24, 24, rx + 84, ry + 20, 24, 24);
	}
	
	// ----------------------------------------------------------------
	// 十字キー押下
	static function lbtnfn(e : Event) : void {
		Ctrl.getmmv(e);
		var x : int = Ctrl.tempmx - Ctrl.lcvs.width * 0.5;
		var y : int = Ctrl.tempmy - Ctrl.lcvs.height * 0.5;
		Ctrl.k_z = Ctrl.k_x = Ctrl.k_s = false;
		Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = false;
		if(x * x + y * y < 56 * 56){
			if(y < 0 && x < y * y * 0.05 && x > y * y * -0.05){Ctrl.kup = true;}
			if(y > 0 && x < y * y * 0.05 && x > y * y * -0.05){Ctrl.kdn = true;}
			if(x > 0 && y < x * x * 0.05 && y > x * x * -0.05){Ctrl.krt = true;}
			if(x < 0 && y < x * x * 0.05 && y > x * x * -0.05){Ctrl.klt = true;}
		}
	}
	static function lbtndnfn(e : Event) : void {Ctrl.lbtnfn(e); Ctrl.ldn = Ctrl.kup || Ctrl.kdn || Ctrl.krt || Ctrl.klt;}
	static function lbtnmvfn(e : Event) : void {if(Ctrl.ldn){Ctrl.lbtnfn(e);}}
	static function lbtnupfn(e : Event) : void {Ctrl.ldn = Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = Ctrl.k_z = Ctrl.k_x = Ctrl.k_s = false;}
	
	// ----------------------------------------------------------------
	// zxスペースキー押下
	static function rbtnfn(e : Event) : void {
		Ctrl.getmmv(e);
		Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = false;
		var x1 : int = Ctrl.tempmx - Ctrl.lcvs.width * 0.5;
		var y1 : int = Ctrl.tempmy - (Ctrl.lcvs.height - 16) * 0.5;
		var x2 : int = x1;
		var y2 : int = Ctrl.tempmy - (Ctrl.lcvs.height - 8);
		// ZXキー
		if(-8 < x1 && x1 < 8 && -8 < y1 && y1 < 8){Ctrl.k_z = Ctrl.k_x = true;} // 同時押し
		else if(-64 < x1 && x1 <  0 && -16 < y1 && y1 < 48){Ctrl.k_z = true; Ctrl.k_x = false;} // z押し
		else if(  0 < x1 && x1 < 64 && -48 < y1 && y1 < 16){Ctrl.k_x = true; Ctrl.k_z = false;} // x押し
		else{Ctrl.k_z = Ctrl.k_x = false;}
		// スペースキー
		if(-64 < x2 && x2 < 64 && -8 < y2 && y2 < 8){Ctrl.k_s = true;}
		else{Ctrl.k_s = false;}
	}
	static function rbtndnfn(e : Event) : void {Ctrl.rbtnfn(e); Ctrl.rdn = Ctrl.k_z || Ctrl.k_x || Ctrl.k_s;}
	static function rbtnmvfn(e : Event) : void {if(Ctrl.rdn){Ctrl.rbtnfn(e);}}
	static function rbtnupfn(e : Event) : void {Ctrl.rdn = Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = Ctrl.k_z = Ctrl.k_x = Ctrl.k_s = false;}
	
	// ----------------------------------------------------------------
	// キーを押す
	static function kdnfn(e : Event) : void {
		var getkey : boolean = true;
		var ke : KeyboardEvent = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Ctrl.klt = true; break;
			case 38: Ctrl.kup = true; break;
			case 39: Ctrl.krt = true; break;
			case 40: Ctrl.kdn = true; break;
			case 88: Ctrl.k_x = true; break;
			case 90: Ctrl.k_z = true; break;
			case 32: Ctrl.k_s = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}
	
	// ----------------------------------------------------------------
	// キーを離す
	static function kupfn(e : Event) : void {
		var getkey : boolean = true;
		var ke : KeyboardEvent = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Ctrl.klt = false; break;
			case 38: Ctrl.kup = false; break;
			case 39: Ctrl.krt = false; break;
			case 40: Ctrl.kdn = false; break;
			case 88: Ctrl.k_x = false; break;
			case 90: Ctrl.k_z = false; break;
			case 32: Ctrl.k_s = false; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}
	
	// ----------------------------------------------------------------
	// マウス座標確認
	static function getmmv(e : Event) : void {
		// 座標を獲得する
		var rect : ClientRect = (e.target as Element).getBoundingClientRect();
		if(Ctrl.isTouch){
			var te : TouchEvent = e as TouchEvent;
			Ctrl.tempmx = te.changedTouches[0].clientX - rect.left;
			Ctrl.tempmy = te.changedTouches[0].clientY - rect.top;
		}else{
			var me : MouseEvent = e as MouseEvent;
			Ctrl.tempmx = me.clientX - rect.left;
			Ctrl.tempmy = me.clientY - rect.top;
		}
	}
	
	// ----------------------------------------------------------------
	// マウスボタンを押す
	static function mdnfn(e : Event) : void {
		Ctrl.mdn = true;
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウス移動
	static function mmvfn(e : Event) : void {
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウスボタンを離す
	static function mupfn(e : Event) : void {
		Ctrl.mdn = false;
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		// マウスイベント終了
		e.preventDefault();
	}
}

