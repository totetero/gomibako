import 'js/web.jsx';
import 'timer.jsx';

import 'Game.jsx';
import 'Field.jsx';
import 'Character.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// メインクラス

class Main{
	static var game : Game = new GameField();
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void {
		ImageLoader.init();
		Ctrl.init();
		// 画像などロードの完了待ちしてから開始する
		var isLoaded = function() : void {
			if(ImageLoader.isLoaded()){
				Main.game.init();
				Timer.setInterval(function():void{
					Ctrl.calc();
					Main.game.calc();
					Main.game.draw();
				}, 33);
			}else{
				Timer.setTimeout(isLoaded, 1000);
			}
		};
		isLoaded();
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
		ImageLoader.list["pl1"] = ImageLoader.load("img/player1.png");
		ImageLoader.list["pl2"] = ImageLoader.load("img/player2.png");
		ImageLoader.list["pl3"] = ImageLoader.load("img/player3.png");
		ImageLoader.list["en1"] = ImageLoader.load("img/enemy1.png");
		ImageLoader.list["en2"] = ImageLoader.load("img/enemy2.png");
		ImageLoader.list["en3"] = ImageLoader.load("img/enemy3.png");
		ImageLoader.list["map"] = ImageLoader.load("img/mapchip.png");
		ImageLoader.list["title"] = ImageLoader.load("img/title.png");
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
	// キャンバス
	static var w : int = 320;
	static var h : int = 320;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// ウインドウサイズ
	static var ww : int = 0;
	static var wh : int = 0;
	// マウス状態
	static var isTouch : boolean = false;
	static var mdn : boolean = false;
	static var mx : int = -1;
	static var my : int = -1;
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void {
		// canvasの準備
		Ctrl.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.context = Ctrl.canvas.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.canvas.style.position = "absolute";
		Ctrl.canvas.width = Ctrl.w;
		Ctrl.canvas.height = Ctrl.h;
		dom.document.body.appendChild(Ctrl.canvas);
		
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
			dom.window.scrollTo(0, 1);
			Ctrl.ww = w;
			Ctrl.wh = h;
			Ctrl.canvas.style.left = ((w - Ctrl.canvas.width) * 0.5) as string + "px";
			Ctrl.canvas.style.top = ((h - Ctrl.canvas.height) * 0.5) as string + "px";
		}
	}
	
	// ----------------------------------------------------------------
	// マウス座標確認
	static function getmmv(e : Event) : void {
		// 座標を獲得する
		var rect : ClientRect = Ctrl.canvas.getBoundingClientRect();
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

