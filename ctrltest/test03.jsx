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
			// 速度
			this.vx = Ctrl.cvx * 0.3;
			this.vy = Ctrl.cvy * 0.3;
			var rr : number = this.vx * this.vx + this.vy * this.vy;
			// 最低速度と角度
			if(rr < 0.1){this.vx = this.vy = 0; this.action = 0;}
			else{this.rot = Math.atan2(this.vy, this.vx);}
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
	static var ccvs : HTMLCanvasElement;
	static var cctx : CanvasRenderingContext2D;
	// キー状態
	static var k_z : boolean = false;
	static var k_x : boolean = false;
	static var k_s : boolean = false;
	// ゲーム画面キャンバス マウス状態
	static var isTouch : boolean = false;
	static var mdn : boolean = false;
	static var mx : int = 0;
	static var my : int = 0;
	// コントローラキャンバス マウス状態
	static var cvx : number = 0;
	static var cvy : number = 0;
	static var scrollx : number = 0;
	static var scrolly : number = 0;
	
	// 内部演算用 キー状態
	static var kup : boolean = false;
	static var kdn : boolean = false;
	static var krt : boolean = false;
	static var klt : boolean = false;
	// 内部演算用 ウインドウサイズ
	static var ww : int = 0;
	static var wh : int = 0;
	// 内部演算用 一時的マウス状態
	static var tempmx : int = 0;
	static var tempmy : int = 0;
	// 内部演算用 コントローラキャンバス用変数
	static var btndn : boolean = false;
	static var cx0 : int = 0;
	static var cy0 : int = 0;
	static var cx1 : int = 0;
	static var cy1 : int = 0;
	static var cdn : boolean = false;
	static var cmv : boolean = false;
	static var ccount : int = 0;
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void {
		// divの準備
		Ctrl.div = dom.window.document.createElement("div") as HTMLDivElement;
		Ctrl.div.style.position = "absolute";
		dom.window.document.body.appendChild(Ctrl.div);
		// ゲーム画面キャンバスの準備
		Ctrl.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.context = Ctrl.canvas.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.canvas.style.position = "absolute";
		Ctrl.canvas.width = 265;
		Ctrl.canvas.height = 265;
		Ctrl.div.appendChild(Ctrl.canvas);
		// コントローラーキャンバスの準備
		Ctrl.ccvs = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.cctx = Ctrl.ccvs.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.ccvs.style.position = "absolute";
		Ctrl.div.appendChild(Ctrl.ccvs);
		
		// キーリスナー追加
		dom.window.document.addEventListener("keydown", Ctrl.kdnfn, true);
		dom.window.document.addEventListener("keyup", Ctrl.kupfn, true);
		// マウスリスナー追加
		Ctrl.isTouch = JsCtrlUtil.isTouch();
		if(Ctrl.isTouch){
			Ctrl.canvas.addEventListener("touchstart", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("touchmove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("touchend", Ctrl.mupfn, true);
			Ctrl.ccvs.addEventListener("touchstart", Ctrl.cdnfn, true);
			Ctrl.ccvs.addEventListener("touchmove", Ctrl.cmvfn, true);
			Ctrl.ccvs.addEventListener("touchend", Ctrl.cupfn, true);
		}else{
			Ctrl.canvas.addEventListener("mousedown", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("mousemove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("mouseup", Ctrl.mupfn, true);
			Ctrl.canvas.addEventListener("mouseout", Ctrl.mupfn, true);
			Ctrl.ccvs.addEventListener("mousedown", Ctrl.cdnfn, true);
			Ctrl.ccvs.addEventListener("mousemove", Ctrl.cmvfn, true);
			Ctrl.ccvs.addEventListener("mouseup", Ctrl.cupfn, true);
			Ctrl.ccvs.addEventListener("mouseout", Ctrl.cupfn, true);
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
				Ctrl.ccvs.width = 192;
				Ctrl.ccvs.height = 128;
				Ctrl.div.style.left = ((w - Ctrl.canvas.width) * 0.5) as string + "px";
				Ctrl.ccvs.style.left = ((Ctrl.canvas.width - Ctrl.ccvs.width) * 0.5) as string + "px";
				if(h > Ctrl.canvas.height + Ctrl.ccvs.height){
					var vspace : number = (h - Ctrl.canvas.height - Ctrl.ccvs.height) / 3;
					Ctrl.div.style.top = vspace as string + "px";
					Ctrl.ccvs.style.top = (vspace + Ctrl.canvas.height) as string + "px";
				}else{
					Ctrl.div.style.top = "0px";
					Ctrl.ccvs.style.top = (h - Ctrl.ccvs.height) as string + "px";
				}
			}else{
				// 横長
				Ctrl.ccvs.width = 128;
				Ctrl.ccvs.height = 192;
				Ctrl.div.style.top = ((h - Ctrl.canvas.height) * 0.5) as string + "px";
				Ctrl.ccvs.style.top = ((Ctrl.canvas.height - Ctrl.ccvs.height) * 0.5) as string + "px";
				if(w > Ctrl.canvas.width + Ctrl.ccvs.width){
					var hspace : number = (w - Ctrl.canvas.width - Ctrl.ccvs.width) / 3;
					Ctrl.div.style.left = hspace as string + "px";
					Ctrl.ccvs.style.left = (hspace + Ctrl.canvas.width) as string + "px";
				}else{
					Ctrl.div.style.left = "0px";
					Ctrl.ccvs.style.left = (w - Ctrl.ccvs.width) as string + "px";
				}
			}
		}
		
		// スワイプ速度の減衰
		Ctrl.cvx *= 0.9;
		Ctrl.cvy *= 0.9;
		// 十字キーによるスワイプ加速
		var rot : number = 0;
		var moveFlag : boolean = true;
		if     (Ctrl.krt && Ctrl.kup){rot = Math.PI * 1.74;}
		else if(Ctrl.klt && Ctrl.kup){rot = Math.PI * 1.26;}
		else if(Ctrl.klt && Ctrl.kdn){rot = Math.PI * 0.74;}
		else if(Ctrl.krt && Ctrl.kdn){rot = Math.PI * 0.26;}
		else if(Ctrl.krt){rot = Math.PI * 0.00;}
		else if(Ctrl.kup){rot = Math.PI * 1.50;}
		else if(Ctrl.klt){rot = Math.PI * 1.00;}
		else if(Ctrl.kdn){rot = Math.PI * 0.50;}
		else{moveFlag = false;}
		if(moveFlag){
			Ctrl.cvx += 0.8 * Math.cos(rot);
			Ctrl.cvy += 0.8 * Math.sin(rot);
		}
		// スワイプスクロール
		Ctrl.scrollx += Ctrl.cvx * 0.5;
		Ctrl.scrolly += Ctrl.cvy * 0.5;
		
		// タップ処理
		if(Ctrl.cdn){
			Ctrl.ccount++;
		}else if(Ctrl.ccount > 0 && --Ctrl.ccount == 0){
			Ctrl.k_z = false;
			Ctrl.k_x = false;
		}
		
		
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw() : void {
		Ctrl.cctx.fillStyle = "#ccc";
		Ctrl.cctx.fillRect(0, 0, Ctrl.ccvs.width, Ctrl.ccvs.height);
		// スペースキー
		Ctrl.cctx.drawImage(ImageLoader.list["ctrl"], 0, Ctrl.k_s ? 104 : 88, 128, 16, (Ctrl.ccvs.width - 128) * 0.5, Ctrl.ccvs.height - 16, 128, 16);
		// 枠
		Ctrl.cctx.drawImage(ImageLoader.list["ctrl"], 176, 0, 32, 32, 0, 0, 32, 32);
		Ctrl.cctx.drawImage(ImageLoader.list["ctrl"], 208, 0, 32, 32, Ctrl.ccvs.width - 32, 0, 32, 32);
		Ctrl.cctx.drawImage(ImageLoader.list["ctrl"], 176, 32, 32, 32, 0, Ctrl.ccvs.height - 48, 32, 32);
		Ctrl.cctx.drawImage(ImageLoader.list["ctrl"], 208, 32, 32, 32, Ctrl.ccvs.width - 32, Ctrl.ccvs.height - 48, 32, 32);
	}
		
	// ----------------------------------------------------------------
	// ボタン押下確認
	static function btnfn(e : Event) : boolean {
		// スペースキー
		var x : int = Ctrl.tempmx - Ctrl.ccvs.width * 0.5;
		var y : int = Ctrl.tempmy - (Ctrl.ccvs.height - 8);
		if(-64 < x && x < 64 && -8 < y && y < 8){Ctrl.k_s = true;}
		else{Ctrl.k_s = false;}
		// ボタンが一つでも押される状態ならtrue
		return Ctrl.k_s;
	}
	
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
	// ゲーム画面キャンバス マウスボタンを押す
	static function mdnfn(e : Event) : void {
		Ctrl.mdn = true;
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// ゲーム画面キャンバス マウス移動
	static function mmvfn(e : Event) : void {
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// ゲーム画面キャンバス マウスボタンを離す
	static function mupfn(e : Event) : void {
		Ctrl.mdn = false;
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// コントローラキャンバス マウスボタンを押す
	static function cdnfn(e : Event) : void {
		Ctrl.getmmv(e);
		Ctrl.btndn = Ctrl.btnfn(e);
		if(!Ctrl.btndn){
			// ボタンが押されていなかったらマウス座標を記録してタップスワイプ確認準備
			Ctrl.cx1 = Ctrl.cx0 = Ctrl.tempmx;
			Ctrl.cy1 = Ctrl.cy0 = Ctrl.tempmy;
			Ctrl.cmv = false;
			Ctrl.cdn = true;
			Ctrl.ccount = 0;
		}
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// コントローラキャンバス マウス移動
	static function cmvfn(e : Event) : void {
		if(Ctrl.btndn){
			// ボタン押下
			Ctrl.getmmv(e);
			Ctrl.btnfn(e);
		}else if(Ctrl.cdn){
			Ctrl.getmmv(e);
			if(!Ctrl.cmv){
				// タップ
				var x : int = Ctrl.tempmx - Ctrl.cx0;
				var y : int = Ctrl.tempmy - Ctrl.cy0;
				Ctrl.cmv = x * x + y * y > 10 * 10;
			}else{
				// スワイプ
				Ctrl.cvx += Ctrl.tempmx - Ctrl.cx1;
				Ctrl.cvy += Ctrl.tempmy - Ctrl.cy1;
			}
			Ctrl.cx1 = Ctrl.tempmx;
			Ctrl.cy1 = Ctrl.tempmy;
		}
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// コントローラキャンバス マウスボタンを離す
	static function cupfn(e : Event) : void {
		Ctrl.btndn = Ctrl.k_s = false;
		if(Ctrl.cdn && !Ctrl.cmv){
			// タップ処理
			if(Ctrl.ccount > 10){Ctrl.k_x = true;}
			else{Ctrl.k_z = true;}
			Ctrl.ccount = 2;
		}
		Ctrl.cmv = false;
		Ctrl.cdn = false;
		e.preventDefault();
	}
}

