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
	// キー押下状態
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
	static var _mkup : boolean = false;
	static var _mkdn : boolean = false;
	static var _mkrt : boolean = false;
	static var _mklt : boolean = false;
	static var _mk_z : boolean = false;
	static var _mk_x : boolean = false;
	static var _mk_c : boolean = false;
	static var _mk_s : boolean = false;
	static var _kkup : boolean = false;
	static var _kkdn : boolean = false;
	static var _kkrt : boolean = false;
	static var _kklt : boolean = false;
	static var _kk_z : boolean = false;
	static var _kk_x : boolean = false;
	static var _kk_c : boolean = false;
	static var _kk_s : boolean = false;
	static var _upDiv : HTMLDivElement;
	static var _dnDiv : HTMLDivElement;
	static var _rtDiv : HTMLDivElement;
	static var _ltDiv : HTMLDivElement;
	static var _zbDiv : HTMLDivElement;
	static var _xbDiv : HTMLDivElement;
	static var _cbDiv : HTMLDivElement;
	static var _sbDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM獲得
		Ctrl.sdiv = dom.document.getElementById("screen") as HTMLDivElement;
		Ctrl.lDiv = dom.document.getElementById("lctrl") as HTMLDivElement;
		Ctrl.rDiv = dom.document.getElementById("rctrl") as HTMLDivElement;
		Ctrl._upDiv = Ctrl.lDiv.getElementsByClassName("up").item(0) as HTMLDivElement;
		Ctrl._dnDiv = Ctrl.lDiv.getElementsByClassName("dn").item(0) as HTMLDivElement;
		Ctrl._rtDiv = Ctrl.lDiv.getElementsByClassName("rt").item(0) as HTMLDivElement;
		Ctrl._ltDiv = Ctrl.lDiv.getElementsByClassName("lt").item(0) as HTMLDivElement;
		Ctrl._zbDiv = Ctrl.rDiv.getElementsByClassName("zb").item(0) as HTMLDivElement;
		Ctrl._xbDiv = Ctrl.rDiv.getElementsByClassName("xb").item(0) as HTMLDivElement;
		Ctrl._cbDiv = Ctrl.rDiv.getElementsByClassName("cb").item(0) as HTMLDivElement;
		Ctrl._sbDiv = Ctrl.rDiv.getElementsByClassName("sb").item(0) as HTMLDivElement;

		// リスナー追加
		var rdiv = dom.document.getElementById("root") as HTMLDivElement;
		Ctrl.isTouch = js.eval("'ontouchstart' in window") as boolean;
		if(Ctrl.isTouch){
			rdiv.addEventListener("touchstart", Ctrl.root_mdnfn, true);
			rdiv.addEventListener("touchmove", Ctrl.root_mmvfn, true);
			rdiv.addEventListener("touchend", Ctrl.root_mupfn, true);
			rdiv.addEventListener("touchcancel", Ctrl.root_mupfn, true);
			Ctrl.lDiv.addEventListener("touchstart", function(e:Event):void{Ctrl.btnfn(e, true, false);}, true);
			Ctrl.lDiv.addEventListener("touchmove", function(e:Event):void{Ctrl.btnfn(e, true, false);}, true);
			Ctrl.lDiv.addEventListener("touchend", function(e:Event):void{Ctrl.btnfn(e, true, true);}, true);
			Ctrl.lDiv.addEventListener("touchcancel", function(e:Event):void{Ctrl.btnfn(e, true, true);}, true);
		}else{
			rdiv.addEventListener("mousedown", Ctrl.root_mdnfn, true);
			rdiv.addEventListener("mousemove", Ctrl.root_mmvfn, true);
			rdiv.addEventListener("mouseup", Ctrl.root_mupfn, true);
			Ctrl.lDiv.addEventListener("mousedown", function(e:Event):void{Ctrl.btnfn(e, true, false);}, true);
			Ctrl.lDiv.addEventListener("mousemove", function(e:Event):void{Ctrl.btnfn(e, true, false);}, true);
			Ctrl.lDiv.addEventListener("mouseup", function(e:Event):void{Ctrl.btnfn(e, true, true);}, true);
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

		// キー状態描画
		var kup = Ctrl._mkup || Ctrl._kkup;
		var kdn = Ctrl._mkdn || Ctrl._kkdn;
		var krt = Ctrl._mkrt || Ctrl._kkrt;
		var klt = Ctrl._mklt || Ctrl._kklt;
		var k_z = Ctrl._mk_z || Ctrl._kk_z;
		var k_x = Ctrl._mk_x || Ctrl._kk_x;
		var k_c = Ctrl._mk_c || Ctrl._kk_c;
		var k_s = Ctrl._mk_s || Ctrl._kk_s;
		if(Ctrl.kup != kup){Ctrl.kup = kup; Ctrl._upDiv.className = kup ? "up hover" : "up";}
		if(Ctrl.kdn != kdn){Ctrl.kdn = kdn; Ctrl._dnDiv.className = kdn ? "dn hover" : "dn";}
		if(Ctrl.krt != krt){Ctrl.krt = krt; Ctrl._rtDiv.className = krt ? "rt hover" : "rt";}
		if(Ctrl.klt != klt){Ctrl.klt = klt; Ctrl._ltDiv.className = klt ? "lt hover" : "lt";}
		if(Ctrl.k_z != k_z){Ctrl.k_z = k_z; Ctrl._zbDiv.className = k_z ? "zb hover" : "zb";}
		if(Ctrl.k_x != k_x){Ctrl.k_x = k_x; Ctrl._xbDiv.className = k_x ? "xb hover" : "xb";}
		if(Ctrl.k_c != k_c){Ctrl.k_c = k_c; Ctrl._cbDiv.className = k_c ? "cb hover" : "cb";}
		if(Ctrl.k_s != k_s){Ctrl.k_s = k_s; Ctrl._sbDiv.className = k_s ? "sb hover" : "sb";}
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

	// ----------------------------------------------------------------
	// ボタン関数
	static function btnfn(e : Event, arrow : boolean, trigger : boolean) : void{
		var b = ((Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].target : (e as MouseEvent).target) as Element).getBoundingClientRect();
		var x = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX) - b.left;
		var y = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY) - b.top;
		if(arrow){
			Ctrl._mkup = Ctrl._mkdn = Ctrl._mkrt = Ctrl._mklt = false;
			// 十字キー確認
			x = x - 72;
			y = y - 72;
			if(x * x + y * y < 72 * 72){
				if(y < 0 && x < y * y * 0.18 && x > y * y * -0.18){if(trigger){}else{Ctrl._mkup = true;}}
				if(y > 0 && x < y * y * 0.18 && x > y * y * -0.18){if(trigger){}else{Ctrl._mkdn = true;}}
				if(x > 0 && y < x * x * 0.18 && y > x * x * -0.18){if(trigger){}else{Ctrl._mkrt = true;}}
				if(x < 0 && y < x * x * 0.18 && y > x * x * -0.18){if(trigger){}else{Ctrl._mklt = true;}}
			}
		}else{
			Ctrl._mk_z = Ctrl._mk_x = Ctrl._mk_c = Ctrl._mk_s = false;
			// ボタン確認
			if(12 < x && x < 132){
				if(  0 < y && y <  36){if(trigger){Ctrl.trigger_z = true;}else{Ctrl._mk_z = true;}}
				if( 36 < y && y <  72){if(trigger){Ctrl.trigger_x = true;}else{Ctrl._mk_x = true;}}
				if( 72 < y && y < 108){if(trigger){Ctrl.trigger_c = true;}else{Ctrl._mk_c = true;}}
				if(108 < y && y < 144){if(trigger){Ctrl.trigger_s = true;}else{Ctrl._mk_s = true;}}
			}
		}
		e.preventDefault();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

