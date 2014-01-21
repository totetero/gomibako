import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 操作用クラス

class Ctrl{
	// ウインドウ
	static var ww : int;
	static var wh : int;
	// スクリーン要素
	static var sx : int;
	static var sy : int;
	static var sw : int;
	static var sh : int;
	static var sdiv : HTMLDivElement;
	// コントローラー要素
	static var lDiv : HTMLDivElement;
	static var rDiv : HTMLDivElement;
	// マウス状態
	static var isTouch : boolean;
	static var mdn : boolean;
	static var mmv : boolean;
	static var mx : int = 0;
	static var my : int = 0;
	static var _tempmx : int;
	static var _tempmy : int;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM獲得
		Ctrl.sdiv = dom.document.getElementById("screen") as HTMLDivElement;
		Ctrl.lDiv = dom.document.getElementById("lctrl") as HTMLDivElement;
		Ctrl.rDiv = dom.document.getElementById("rctrl") as HTMLDivElement;

		// リスナー追加
		var rdiv = dom.document.getElementById("root") as HTMLDivElement;
		Ctrl.isTouch = js.eval("'ontouchstart' in window") as boolean;
		if(Ctrl.isTouch){
			rdiv.addEventListener("touchstart", Ctrl.root_mdnfn, true);
			rdiv.addEventListener("touchmove", Ctrl.root_mmvfn, true);
			rdiv.addEventListener("touchend", Ctrl.root_mupfn, true);
			rdiv.addEventListener("touchcancel", Ctrl.root_mupfn, true);
		}else{
			rdiv.addEventListener("mousedown", Ctrl.root_mdnfn, true);
			rdiv.addEventListener("mousemove", Ctrl.root_mmvfn, true);
			rdiv.addEventListener("mouseup", Ctrl.root_mupfn, true);
			rdiv.addEventListener("mouseout", function(e : Event){
				var x = (e as MouseEvent).clientX;
				var y = (e as MouseEvent).clientY;
				if(Ctrl.mdn && (x <= 0 || Ctrl.ww <= x || y <= 0 || Ctrl.wh <= y)){
					Ctrl.root_mupfn(e);
				}
			}, true);
			//dom.document.addEventListener("keydown", Cbtn.kdnfn, true);
			//dom.document.addEventListener("keyup", Cbtn.kupfn, true);
		}
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ウインドウサイズの変更確認
		var ww = dom.window.innerWidth;
		var wh = dom.window.innerHeight;
		if(Ctrl.ww != ww || Ctrl.wh != wh){
			Ctrl.ww = ww;
			Ctrl.wh = wh;
			Ctrl.sw = 320;
			Ctrl.sh = Math.min(Math.max(Ctrl.wh, 320), 480);
			Ctrl.sx = Math.floor((Ctrl.ww - Ctrl.sw) * 0.5);
			Ctrl.sy = Math.floor((Ctrl.wh - Ctrl.sh) * 0.5);
			Ctrl.sdiv.style.left = Ctrl.sx + "px";
			Ctrl.sdiv.style.top = Ctrl.sy + "px";
			Ctrl.sdiv.style.width = Ctrl.sw + "px";
			Ctrl.sdiv.style.height = Ctrl.sh + "px";
		}
	}

	// ----------------------------------------------------------------
	// ルート要素 マウスを押す
	static function root_mdnfn(e : Event) : void{
		Ctrl.mx = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX) - Ctrl.sx;
		Ctrl.my = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY) - Ctrl.sy;
		if(0 <= Ctrl.mx && Ctrl.mx <= Ctrl.sw && 0 <= Ctrl.my && Ctrl.my <= Ctrl.sh){
			Ctrl.mdn = true;
			Ctrl.mmv = false;
			Ctrl._tempmx = Ctrl.mx;
			Ctrl._tempmy = Ctrl.my;
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// ルート要素 マウス移動
	static function root_mmvfn(e : Event) : void{
		if(Ctrl.mdn){
			Ctrl.mx = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX) - Ctrl.sx;
			Ctrl.my = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY) - Ctrl.sy;
			if(!Ctrl.mmv){
				var x = Ctrl._tempmx - Ctrl.mx;
				var y = Ctrl._tempmy - Ctrl.my;
				Ctrl.mmv = (x * x + y * y > 10);
			}
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// ルート要素 マウスを離す
	static function root_mupfn(e : Event) : void{
		if(Ctrl.mdn){
			Ctrl.mdn = false;
			Ctrl.mx = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX) - Ctrl.sx;
			Ctrl.my = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY) - Ctrl.sy;
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

