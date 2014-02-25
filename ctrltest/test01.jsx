import "js/web.jsx";
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// メインクラス

class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main() : void {
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
	}
	
	// ----------------------------------------------------------------
	// 計算
	static function calc() : void {
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw() : void {
		Ctrl.context.fillStyle = "#f00";
		Ctrl.context.fillRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		Ctrl.context.drawImage(ImageLoader.list["ctrl"], Ctrl.mx, Ctrl.my);
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
	// divとcanvas
	static var div : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// ウインドウサイズ
	static var ww : int = 0;
	static var wh : int = 0;
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
	static var mx : int = -1;
	static var my : int = -1;
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void {
		// divの準備
		Ctrl.div = dom.window.document.createElement("div") as HTMLDivElement;
		Ctrl.div.style.position = "absolute";
		dom.window.document.body.appendChild(Ctrl.div);
		// canvasの準備
		Ctrl.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.context = Ctrl.canvas.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.canvas.style.position = "absolute";
		Ctrl.canvas.width = 320;
		Ctrl.canvas.height = 320;
		Ctrl.div.appendChild(Ctrl.canvas);
		
		// キーリスナー追加
		dom.window.document.addEventListener("keydown", Ctrl.kdnfn, true);
		dom.window.document.addEventListener("keyup", Ctrl.kupfn, true);
		// マウスリスナー追加
		Ctrl.isTouch = JsCtrlUtil.isTouch();
		if(Ctrl.isTouch){
			Ctrl.canvas.addEventListener("touchstart", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("touchmove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("touchend", Ctrl.mupfn, true);
		}else{
			Ctrl.canvas.addEventListener("mousedown", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("mousemove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("mouseup", Ctrl.mupfn, true);
			Ctrl.canvas.addEventListener("mouseout", Ctrl.mupfn, true);
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
			Ctrl.div.style.left = ((w - Ctrl.canvas.width) * 0.5) as string + "px";
			Ctrl.div.style.top = ((h - Ctrl.canvas.height) * 0.5) as string + "px";
		}
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
			Ctrl.mx = te.changedTouches[0].clientX - rect.left;
			Ctrl.my = te.changedTouches[0].clientY - rect.top;
		}else{
			var me : MouseEvent = e as MouseEvent;
			Ctrl.mx = me.clientX - rect.left;
			Ctrl.my = me.clientY - rect.top;
		}
	}
	
	// ----------------------------------------------------------------
	// マウスボタンを押す
	static function mdnfn(e : Event) : void {
		Ctrl.mdn = true;
		Ctrl.getmmv(e);
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウス移動
	static function mmvfn(e : Event) : void {
		Ctrl.getmmv(e);
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウスボタンを離す
	static function mupfn(e : Event) : void {
		Ctrl.mdn = false;
		Ctrl.getmmv(e);
		// マウスイベント終了
		e.preventDefault();
	}
}

