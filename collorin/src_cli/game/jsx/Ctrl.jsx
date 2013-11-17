import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 操作用クラス
class Ctrl{
	// マウス状態
	static var isTouch : boolean;
	static var mdn : boolean;
	static var mmv : boolean;
	static var mx : int = 0;
	static var my : int = 0;

	// 内部演算用 ゲーム画面用DOM
	static var div : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// 内部演算用 ウインドウ状態
	static var wl : int;
	static var wt : int;
	static var ww : int = 0;
	static var wh : int = 0;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// ゲーム画面canvasの準備
		Ctrl.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.context = Ctrl.canvas.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.canvas.className = "main";
		Ctrl.canvas.width = 320;
		Ctrl.canvas.height = 320;
		// root divの準備
		Ctrl.div = dom.document.createElement("div") as HTMLDivElement;
		Ctrl.div.className = "root";
		Ctrl.div.appendChild(Ctrl.canvas);
		dom.document.body.appendChild(Ctrl.div);

		// リスナー追加
		Ctrl.isTouch = js.eval("'ontouchstart' in window") as boolean;
		if(Ctrl.isTouch){
			Ctrl.div.addEventListener("touchstart", Ctrl.mdnfn, true);
			Ctrl.div.addEventListener("touchmove", Ctrl.mmvfn, true);
			Ctrl.div.addEventListener("touchend", Ctrl.mupfn, true);
			Ctrl.div.addEventListener("touchcancel", Ctrl.mupfn, true);
		}else{
			Ctrl.div.addEventListener("mousedown", Ctrl.mdnfn, true);
			Ctrl.div.addEventListener("mousemove", Ctrl.mmvfn, true);
			Ctrl.div.addEventListener("mouseup", Ctrl.mupfn, true);
			dom.document.addEventListener("keydown", Cbtn.kdnfn, true);
			dom.document.addEventListener("keyup", Cbtn.kupfn, true);
		}

		Cbtn.init();
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ウインドウサイズの変更確認
		var w = dom.window.innerWidth;
		var h = dom.window.innerHeight;
		if(Ctrl.ww != w || Ctrl.wh != h){
			Ctrl.ww = w;
			Ctrl.wh = h;
			Ctrl.canvas.style.left = (Ctrl.wl = (w - Ctrl.canvas.width) * 0.5) + "px";
			Ctrl.canvas.style.top = (Ctrl.wt = (h - Ctrl.canvas.height) * 0.5) + "px";
		}
	}

	// ----------------------------------------------------------------
	// マウスを押す
	static function mdnfn(e : Event) : void{
		// イベント処理
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// マウス移動
	static function mmvfn(e : Event) : void{
		// イベント処理
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// マウスを離す
	static function mupfn(e : Event) : void{
		// イベント処理
		e.preventDefault();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ボタン用クラス
class Cbtn{
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		var arrowDiv = dom.document.createElement("div") as HTMLDivElement;
		var upDiv = dom.document.createElement("div") as HTMLDivElement;
		var dnDiv = dom.document.createElement("div") as HTMLDivElement;
		var rtDiv = dom.document.createElement("div") as HTMLDivElement;
		var ltDiv = dom.document.createElement("div") as HTMLDivElement;
		var buttonDiv = dom.document.createElement("div") as HTMLDivElement;
		var zbDiv = dom.document.createElement("div") as HTMLDivElement;
		var xbDiv = dom.document.createElement("div") as HTMLDivElement;
		var cbDiv = dom.document.createElement("div") as HTMLDivElement;
		var vbDiv = dom.document.createElement("div") as HTMLDivElement;
		arrowDiv.className = "arrow";
		upDiv.className = "up";
		dnDiv.className = "dn";
		rtDiv.className = "rt";
		ltDiv.className = "lt";
		buttonDiv.className = "button";
		zbDiv.className = "zb";
		xbDiv.className = "xb";
		cbDiv.className = "cb";
		vbDiv.className = "vb";
		arrowDiv.appendChild(upDiv);
		arrowDiv.appendChild(dnDiv);
		arrowDiv.appendChild(rtDiv);
		arrowDiv.appendChild(ltDiv);
		buttonDiv.appendChild(zbDiv);
		buttonDiv.appendChild(xbDiv);
		buttonDiv.appendChild(cbDiv);
		buttonDiv.appendChild(vbDiv);
		dom.document.body.appendChild(arrowDiv);
		dom.document.body.appendChild(buttonDiv);
	}

	// ----------------------------------------------------------------
	// キーを押す
	static function kdnfn(e : Event) : void{
		/*
		var getkey = true;
		var ke = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Ctrl.kklt = true; break;
			case 38: Ctrl.kkup = true; break;
			case 39: Ctrl.kkrt = true; break;
			case 40: Ctrl.kkdn = true; break;
			case 88: Ctrl.kk_x = true; break;
			case 90: Ctrl.kk_z = true; break;
			case 67: Ctrl.kk_c = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
		*/
	}
	
	// ----------------------------------------------------------------
	// キーを離す
	static function kupfn(e : Event) : void{
		/*
		var getkey = true;
		var ke = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Ctrl.kklt = false; break;
			case 38: Ctrl.kkup = false; break;
			case 39: Ctrl.kkrt = false; break;
			case 40: Ctrl.kkdn = false; break;
			case 88: Ctrl.kk_x = false; Ctrl.trigger_x = true; break;
			case 90: Ctrl.kk_z = false; Ctrl.trigger_z = true; break;
			case 67: Ctrl.kk_c = false; Ctrl.trigger_c = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
		*/
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

