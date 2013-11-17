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
	static var cx : int = 0;
	static var cy : int = 0;

	// 内部演算用 ゲーム画面用DOM
	static var div : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// 内部演算用 ウインドウ状態
	static var wl : int;
	static var wt : int;
	static var ww : int = 0;
	static var wh : int = 0;
	// 内部演算用 タッチ状態
	static var mode : int = 0;

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
	// マウス座標確認
	static function getmmv(e : Event) : void {
		// 座標を獲得する
		if(Ctrl.isTouch){
			var te : TouchEvent = e as TouchEvent;
			Ctrl.mx = te.changedTouches[0].clientX;
			Ctrl.my = te.changedTouches[0].clientY;
		}else{
			var me : MouseEvent = e as MouseEvent;
			Ctrl.mx = me.clientX;
			Ctrl.my = me.clientY;
		}
		Ctrl.cx = Ctrl.mx - Ctrl.wl;
		Ctrl.cy = Ctrl.my - Ctrl.wt;
	}

	// ----------------------------------------------------------------
	// マウスを押す
	static function mdnfn(e : Event) : void{
		// イベント処理
		Ctrl.getmmv(e);
		if(Cbtn.btnchk()){
			// ボタン押下開始
			Cbtn.btnfn(false);
			Ctrl.mode = 1;
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// マウス移動
	static function mmvfn(e : Event) : void{
		// イベント処理
		if(Ctrl.mode > 0){
			Ctrl.getmmv(e);
			if(Ctrl.mode == 1){
				// ボタン押下処理
				Cbtn.btnfn(false);
			}
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// マウスを離す
	static function mupfn(e : Event) : void{
		// イベント処理
		if(Ctrl.mode > 0){
			Ctrl.getmmv(e);
			if(Ctrl.mode == 1){
				// ボタン押下終了
				Cbtn.btnfn(true);
			}
			Ctrl.mode = 0;
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ボタン用クラス
class Cbtn{
	// キー状態
	static var kup : boolean;
	static var kdn : boolean;
	static var krt : boolean;
	static var klt : boolean;
	static var k_z : boolean;
	static var k_x : boolean;
	static var k_c : boolean;
	static var k_s : boolean;
	static var trigger_z : boolean;
	static var trigger_x : boolean;
	static var trigger_c : boolean;
	static var trigger_s : boolean;

	// 内部演算用 ゲーム画面用DOM
	static var arrowDiv : HTMLDivElement;
	static var buttonDiv : HTMLDivElement;
	static var upDiv : HTMLDivElement;
	static var dnDiv : HTMLDivElement;
	static var rtDiv : HTMLDivElement;
	static var ltDiv : HTMLDivElement;
	static var zbDiv : HTMLDivElement;
	static var xbDiv : HTMLDivElement;
	static var cbDiv : HTMLDivElement;
	static var sbDiv : HTMLDivElement;
	// 内部演算用 キー状態
	static var bkup : boolean = false;
	static var bkdn : boolean = false;
	static var bkrt : boolean = false;
	static var bklt : boolean = false;
	static var bk_z : boolean = false;
	static var bk_x : boolean = false;
	static var bk_c : boolean = false;
	static var bk_s : boolean = false;
	static var kkup : boolean = false;
	static var kkdn : boolean = false;
	static var kkrt : boolean = false;
	static var kklt : boolean = false;
	static var kk_z : boolean = false;
	static var kk_x : boolean = false;
	static var kk_c : boolean = false;
	static var kk_s : boolean = false;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM作成
		Cbtn.arrowDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.buttonDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.upDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.dnDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.rtDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.ltDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.zbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.xbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.cbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.sbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn.arrowDiv.className = "arrow";
		Cbtn.buttonDiv.className = "button";
		Cbtn.upDiv.className = "up";
		Cbtn.dnDiv.className = "dn";
		Cbtn.rtDiv.className = "rt";
		Cbtn.ltDiv.className = "lt";
		Cbtn.zbDiv.className = "zb";
		Cbtn.xbDiv.className = "xb";
		Cbtn.cbDiv.className = "cb";
		Cbtn.sbDiv.className = "sb";
		Cbtn.arrowDiv.appendChild(Cbtn.upDiv);
		Cbtn.arrowDiv.appendChild(Cbtn.dnDiv);
		Cbtn.arrowDiv.appendChild(Cbtn.rtDiv);
		Cbtn.arrowDiv.appendChild(Cbtn.ltDiv);
		Cbtn.buttonDiv.appendChild(Cbtn.zbDiv);
		Cbtn.buttonDiv.appendChild(Cbtn.xbDiv);
		Cbtn.buttonDiv.appendChild(Cbtn.cbDiv);
		Cbtn.buttonDiv.appendChild(Cbtn.sbDiv);
		Ctrl.div.appendChild(Cbtn.arrowDiv);
		Ctrl.div.appendChild(Cbtn.buttonDiv);
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// 動き系の計算を入れる
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// キー状態確認
		var kup = Cbtn.bkup || Cbtn.kkup;
		var kdn = Cbtn.bkdn || Cbtn.kkdn;
		var krt = Cbtn.bkrt || Cbtn.kkrt;
		var klt = Cbtn.bklt || Cbtn.kklt;
		var k_z = Cbtn.bk_z || Cbtn.kk_z;
		var k_x = Cbtn.bk_x || Cbtn.kk_x;
		var k_c = Cbtn.bk_c || Cbtn.kk_c;
		var k_s = Cbtn.bk_s || Cbtn.kk_s;
		// キー状態描画
		if(Cbtn.kup != kup){Cbtn.kup = kup; Cbtn.upDiv.className = Cbtn.kup ? "up hover" : "up";}
		if(Cbtn.kdn != kdn){Cbtn.kdn = kdn; Cbtn.dnDiv.className = Cbtn.kdn ? "dn hover" : "dn";}
		if(Cbtn.krt != krt){Cbtn.krt = krt; Cbtn.rtDiv.className = Cbtn.krt ? "rt hover" : "rt";}
		if(Cbtn.klt != klt){Cbtn.klt = klt; Cbtn.ltDiv.className = Cbtn.klt ? "lt hover" : "lt";}
		if(Cbtn.k_z != k_z){Cbtn.k_z = k_z; Cbtn.zbDiv.className = Cbtn.k_z ? "zb hover" : "zb";}
		if(Cbtn.k_x != k_x){Cbtn.k_x = k_x; Cbtn.xbDiv.className = Cbtn.k_x ? "xb hover" : "xb";}
		if(Cbtn.k_c != k_c){Cbtn.k_c = k_c; Cbtn.cbDiv.className = Cbtn.k_c ? "cb hover" : "cb";}
		if(Cbtn.k_s != k_s){Cbtn.k_s = k_s; Cbtn.sbDiv.className = Cbtn.k_s ? "sb hover" : "sb";}
	}

	// ----------------------------------------------------------------
	// キーを押す
	static function kdnfn(e : Event) : void{
		var getkey = true;
		var ke = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Cbtn.kklt = true; break;
			case 38: Cbtn.kkup = true; break;
			case 39: Cbtn.kkrt = true; break;
			case 40: Cbtn.kkdn = true; break;
			case 88: Cbtn.kk_x = true; break;
			case 90: Cbtn.kk_z = true; break;
			case 67: Cbtn.kk_c = true; break;
			case 32: Cbtn.kk_s = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}
	
	// ----------------------------------------------------------------
	// キーを離す
	static function kupfn(e : Event) : void{
		var getkey = true;
		var ke = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Cbtn.kklt = false; break;
			case 38: Cbtn.kkup = false; break;
			case 39: Cbtn.kkrt = false; break;
			case 40: Cbtn.kkdn = false; break;
			case 88: Cbtn.kk_x = false; Cbtn.trigger_x = true; break;
			case 90: Cbtn.kk_z = false; Cbtn.trigger_z = true; break;
			case 67: Cbtn.kk_c = false; Cbtn.trigger_c = true; break;
			case 32: Cbtn.kk_s = false; Cbtn.trigger_s = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}

	// ----------------------------------------------------------------
	// ボタン押下範囲の確認
	static function btnchk() : boolean{
		var flag = false;
		// 左の十字キーエリア確認
		flag = flag || (0 < Ctrl.mx && Ctrl.mx < 144 && Ctrl.wh - 144 < Ctrl.my && Ctrl.my < Ctrl.wh);
		// 右のボタンエリア確認
		flag = flag || (Ctrl.ww - 144 < Ctrl.mx && Ctrl.mx < Ctrl.ww && Ctrl.wh - 144 < Ctrl.my && Ctrl.my < Ctrl.wh);
		return flag;
	}

	// ----------------------------------------------------------------
	// ボタンを押す
	static function btnfn(trigger : boolean) : void{
		// 押下状態リセット
		Cbtn.bkup = Cbtn.bkdn = Cbtn.bkrt = Cbtn.bklt = false;
		Cbtn.bk_z = Cbtn.bk_x = Cbtn.bk_c = Cbtn.bk_s = false;

		// 十字キー確認
		if(!trigger){
			var x = Ctrl.mx - 72;
			var y = Ctrl.my - Ctrl.wh + 72;
			if(x * x + y * y < 72 * 72){
				if(y < 0 && x < y * y * 0.18 && x > y * y * -0.18){Cbtn.bkup = true;}
				if(y > 0 && x < y * y * 0.18 && x > y * y * -0.18){Cbtn.bkdn = true;}
				if(x > 0 && y < x * x * 0.18 && y > x * x * -0.18){Cbtn.bkrt = true;}
				if(x < 0 && y < x * x * 0.18 && y > x * x * -0.18){Cbtn.bklt = true;}
			}
		}

		// ボタン確認
		var x = Ctrl.mx - Ctrl.ww + 144;
		if(12 < x && x < 132){
			var y = Ctrl.my - Ctrl.wh + 144;
			if(  0 < y && y <  36){if(trigger){Cbtn.trigger_z = true;}else{Cbtn.bk_z = true;}}
			if( 36 < y && y <  72){if(trigger){Cbtn.trigger_x = true;}else{Cbtn.bk_x = true;}}
			if( 72 < y && y < 108){if(trigger){Cbtn.trigger_c = true;}else{Cbtn.bk_c = true;}}
			if(108 < y && y < 144){if(trigger){Cbtn.trigger_s = true;}else{Cbtn.bk_s = true;}}
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

