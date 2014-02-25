// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 操作用クラス

native class JsCtrlUtil{static function isTouch() : boolean;}

class Ctrl{
	// 画面サイズ
	static var w : int = -1;
	static var h : int = -1;
	// ボタン状態
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
	static function init(canvas : HTMLCanvasElement) : void {
		Ctrl.w = canvas.width;
		Ctrl.h = canvas.height;
		dom.window.document.addEventListener("keydown", Ctrl.kdnEvent, true);
		dom.window.document.addEventListener("keyup", Ctrl.kupEvent, true);
		Ctrl.isTouch = JsCtrlUtil.isTouch();
		if(Ctrl.isTouch){
			canvas.addEventListener("touchstart", Ctrl.mdnEvent, true);
			canvas.addEventListener("touchmove", Ctrl.mmvEvent, true);
			canvas.addEventListener("touchend", Ctrl.mupEvent, true);
		}else{
			canvas.addEventListener("mousedown", Ctrl.mdnEvent, true);
			canvas.addEventListener("mousemove", Ctrl.mmvEvent, true);
			canvas.addEventListener("mouseup", Ctrl.mupEvent, true);
			canvas.addEventListener("mouseout", Ctrl.mupEvent, true);
		}
	}
	
	// ----------------------------------------------------------------
	// キーを押す
	static function kdnEvent(e : Event) : void {
		var ke : KeyboardEvent = e as KeyboardEvent;
		var getkey : boolean = true;
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
	static function kupEvent(e : Event) : void {
		var ke : KeyboardEvent = e as KeyboardEvent;
		var getkey : boolean = true;
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
	static function mdnEvent(e : Event) : void {
		Ctrl.mdn = true;
		Ctrl.getmmv(e);
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウス移動
	static function mmvEvent(e : Event) : void {
		Ctrl.getmmv(e);
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウスボタンを離す
	static function mupEvent(e : Event) : void {
		Ctrl.mdn = false;
		// マウスイベント終了
		e.preventDefault();
	}
}

