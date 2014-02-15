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
	static var cDiv : HTMLDivElement; // キャラクターdiv 後で作る
	static var lDiv : HTMLDivElement;
	static var rDiv : HTMLDivElement;
	// マウス状態
	static var isTouch : boolean;
	static var mdn : boolean;
	static var mmv : boolean;
	static var mx : int = 0;
	static var my : int = 0;
	static var trigger_mup : boolean;
	static var _tempmx : int;
	static var _tempmy : int;
	static var _lmdn : boolean;
	static var _rmdn : boolean;
	// キー押下状態
	static var kup : boolean;
	static var kdn : boolean;
	static var krt : boolean;
	static var klt : boolean;
	static var k_z : boolean;
	static var k_x : boolean;
	static var k_c : boolean;
	static var k_s : boolean;
	static var trigger_up : boolean;
	static var trigger_dn : boolean;
	static var trigger_rt : boolean;
	static var trigger_lt : boolean;
	static var trigger_zb : boolean;
	static var trigger_xb : boolean;
	static var trigger_cb : boolean;
	static var trigger_sb : boolean;
	static var trigger_enter : boolean;
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
	// 描画フラグ
	static var _update_screen : boolean;
	static var _update_up : boolean;
	static var _update_dn : boolean;
	static var _update_rt : boolean;
	static var _update_lt : boolean;
	static var _update_zb : boolean;
	static var _update_xb : boolean;
	static var _update_cb : boolean;
	static var _update_sb : boolean;

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
			rdiv.addEventListener("touchstart", Ctrl._root_mdnfn);
			rdiv.addEventListener("touchmove", Ctrl._root_mmvfn);
			rdiv.addEventListener("touchend", Ctrl._root_mupfn);
			rdiv.addEventListener("touchcancel", Ctrl._root_mupfn);
			Ctrl.lDiv.addEventListener("touchstart", Ctrl._lctrl_mdnfn);
			Ctrl.lDiv.addEventListener("touchmove", Ctrl._lctrl_mmvfn);
			Ctrl.lDiv.addEventListener("touchend", Ctrl._lctrl_mupfn);
			Ctrl.lDiv.addEventListener("touchcancel", Ctrl._lctrl_mupfn);
			Ctrl.rDiv.addEventListener("touchstart", Ctrl._rctrl_mdnfn);
			Ctrl.rDiv.addEventListener("touchmove", Ctrl._rctrl_mmvfn);
			Ctrl.rDiv.addEventListener("touchend", Ctrl._rctrl_mupfn);
			Ctrl.rDiv.addEventListener("touchcancel", Ctrl._rctrl_mupfn);
		}else{
			rdiv.addEventListener("mousedown", Ctrl._root_mdnfn);
			Ctrl.lDiv.addEventListener("mousedown", Ctrl._lctrl_mdnfn);
			Ctrl.rDiv.addEventListener("mousedown", Ctrl._rctrl_mdnfn);
			rdiv.addEventListener("mousemove", function(e : Event) : void{
				Ctrl._root_mmvfn(e);
				Ctrl._lctrl_mmvfn(e);
				Ctrl._rctrl_mmvfn(e);
			});
			rdiv.addEventListener("mouseup", function(e : Event) : void{
				Ctrl._root_mupfn(e);
				Ctrl._lctrl_mupfn(e);
				Ctrl._rctrl_mupfn(e);
			});
			rdiv.addEventListener("mouseout", function(e : Event) : void{
				var x = (e as MouseEvent).clientX;
				var y = (e as MouseEvent).clientY;
				if(x <= 0 || Ctrl.ww <= x || y <= 0 || Ctrl.wh <= y){
					Ctrl._root_mupfn(e);
					Ctrl._lctrl_mupfn(e);
					Ctrl._rctrl_mupfn(e);
				}
			});
		}
		dom.document.addEventListener("keydown", Ctrl._kdnfn);
		dom.document.addEventListener("keyup", Ctrl._kupfn);
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
			Ctrl.sh = Math.min(Math.max(Ctrl.wh, 240), 480);
			Ctrl.sx = Math.floor(Math.max(0, (Ctrl.ww - Ctrl.sw) * 0.5));
			Ctrl.sy = Math.floor(Math.max(0, (Ctrl.wh - Ctrl.sh) * 0.5));
			Ctrl._update_screen = true;
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
		if(Ctrl.kup != kup){Ctrl.kup = kup; Ctrl._update_up = true;}
		if(Ctrl.kdn != kdn){Ctrl.kdn = kdn; Ctrl._update_dn = true;}
		if(Ctrl.krt != krt){Ctrl.krt = krt; Ctrl._update_rt = true;}
		if(Ctrl.klt != klt){Ctrl.klt = klt; Ctrl._update_lt = true;}
		if(Ctrl.k_z != k_z){Ctrl.k_z = k_z; Ctrl._update_zb = true;}
		if(Ctrl.k_x != k_x){Ctrl.k_x = k_x; Ctrl._update_xb = true;}
		if(Ctrl.k_c != k_c){Ctrl.k_c = k_c; Ctrl._update_cb = true;}
		if(Ctrl.k_s != k_s){Ctrl.k_s = k_s; Ctrl._update_sb = true;}
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		if(Ctrl._update_screen){
			Ctrl._update_screen = false;
			Ctrl.sdiv.style.left = Ctrl.sx + "px";
			Ctrl.sdiv.style.top = Ctrl.sy + "px";
			Ctrl.sdiv.style.width = Ctrl.sw + "px";
			Ctrl.sdiv.style.height = Ctrl.sh + "px";
		}
		if(Ctrl._update_up){Ctrl._update_up = false; Ctrl._upDiv.className = Ctrl.kup ? "up active" : "up";}
		if(Ctrl._update_dn){Ctrl._update_dn = false; Ctrl._dnDiv.className = Ctrl.kdn ? "dn active" : "dn";}
		if(Ctrl._update_rt){Ctrl._update_rt = false; Ctrl._rtDiv.className = Ctrl.krt ? "rt active" : "rt";}
		if(Ctrl._update_lt){Ctrl._update_lt = false; Ctrl._ltDiv.className = Ctrl.klt ? "lt active" : "lt";}
		if(Ctrl._update_zb){Ctrl._update_zb = false; Ctrl._zbDiv.className = Ctrl.k_z ? "zb active" : "zb";}
		if(Ctrl._update_xb){Ctrl._update_xb = false; Ctrl._xbDiv.className = Ctrl.k_x ? "xb active" : "xb";}
		if(Ctrl._update_cb){Ctrl._update_cb = false; Ctrl._cbDiv.className = Ctrl.k_c ? "cb active" : "cb";}
		if(Ctrl._update_sb){Ctrl._update_sb = false; Ctrl._sbDiv.className = Ctrl.k_s ? "sb active" : "sb";}
	}

	// ----------------------------------------------------------------
	// ルート要素 マウスを押す
	static function _root_mdnfn(e : Event) : void{
		// input要素フォーカス処理
		if((e.target as Element).tagName.toLowerCase() == "input"){return;}
		if(dom.document.activeElement != null && dom.document.activeElement.tagName.toLowerCase() == "input"){
			(dom.document.activeElement as HTMLInputElement).blur();
		}

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
		e.stopPropagation();
	}

	// ----------------------------------------------------------------
	// ルート要素 マウス移動
	static function _root_mmvfn(e : Event) : void{
		if(Ctrl.mdn){
			Ctrl.mx = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX) - Ctrl.sx;
			Ctrl.my = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY) - Ctrl.sy;
			if(!Ctrl.mmv){
				var x = Ctrl._tempmx - Ctrl.mx;
				var y = Ctrl._tempmy - Ctrl.my;
				Ctrl.mmv = (x * x + y * y > 10);
			}
			// 上位ノードイベントキャンセル
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// ----------------------------------------------------------------
	// ルート要素 マウスを離す
	static function _root_mupfn(e : Event) : void{
		if(Ctrl.mdn){
			Ctrl.mdn = false;
			Ctrl.mx = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX) - Ctrl.sx;
			Ctrl.my = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY) - Ctrl.sy;
			Ctrl.trigger_mup = true;
			// 上位ノードイベントキャンセル
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// ----------------------------------------------------------------
	// コントローラー要素 マウス状態関数
	static function _lctrl_mdnfn(e : Event) : void{Ctrl._lmdn = true; Ctrl._btnfn(e, true, false);}
	static function _rctrl_mdnfn(e : Event) : void{Ctrl._rmdn = true; Ctrl._btnfn(e, false, false);}
	static function _lctrl_mmvfn(e : Event) : void{if(Ctrl._lmdn){Ctrl._btnfn(e, true, false);}}
	static function _rctrl_mmvfn(e : Event) : void{if(Ctrl._rmdn){Ctrl._btnfn(e, false, false);}}
	static function _lctrl_mupfn(e : Event) : void{if(Ctrl._lmdn){Ctrl._lmdn = false; Ctrl._btnfn(e, true, true);}}
	static function _rctrl_mupfn(e : Event) : void{if(Ctrl._rmdn){Ctrl._rmdn = false; Ctrl._btnfn(e, false, true);}}

	// ----------------------------------------------------------------
	// ボタン関数
	static function _btnfn(e : Event, arrow : boolean, trigger : boolean) : void{
		var mx = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX);
		var my = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY);
		if(arrow){
			Ctrl._mkup = Ctrl._mkdn = Ctrl._mkrt = Ctrl._mklt = false;
			// 十字キー確認
			var x = mx - 72;
			var y = my - Ctrl.wh + 72;
			if(x * x + y * y < 72 * 72){
				if(y < 0 && x < y * y * 0.18 && x > y * y * -0.18){if(trigger){Ctrl.trigger_up = true;}else{Ctrl._mkup = true;}}
				if(y > 0 && x < y * y * 0.18 && x > y * y * -0.18){if(trigger){Ctrl.trigger_dn = true;}else{Ctrl._mkdn = true;}}
				if(x > 0 && y < x * x * 0.18 && y > x * x * -0.18){if(trigger){Ctrl.trigger_rt = true;}else{Ctrl._mkrt = true;}}
				if(x < 0 && y < x * x * 0.18 && y > x * x * -0.18){if(trigger){Ctrl.trigger_lt = true;}else{Ctrl._mklt = true;}}
			}
		}else{
			Ctrl._mk_z = Ctrl._mk_x = Ctrl._mk_c = Ctrl._mk_s = false;
			// ボタン確認
			var x = mx - Ctrl.ww + 144;
			if(12 < x && x < 132){
				var y = my - Ctrl.wh + 144;
				if(  0 < y && y <  36){if(trigger){Ctrl.trigger_zb = true;}else{Ctrl._mk_z = true;}}
				if( 36 < y && y <  72){if(trigger){Ctrl.trigger_xb = true;}else{Ctrl._mk_x = true;}}
				if( 72 < y && y < 108){if(trigger){Ctrl.trigger_cb = true;}else{Ctrl._mk_c = true;}}
				if(108 < y && y < 144){if(trigger){Ctrl.trigger_sb = true;}else{Ctrl._mk_s = true;}}
			}
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
		e.stopPropagation();
	}

	// ----------------------------------------------------------------
	// キーを押す
	static function _kdnfn(e : Event) : void{
		if(dom.document.activeElement != null && dom.document.activeElement.tagName.toLowerCase() == "input"){
			// インプットモード
		}else{
			// コントローラーモード
			switch((e as KeyboardEvent).keyCode){
				case 37: Ctrl._kklt = true; break;
				case 38: Ctrl._kkup = true; break;
				case 39: Ctrl._kkrt = true; break;
				case 40: Ctrl._kkdn = true; break;
				case 88: Ctrl._kk_x = true; break;
				case 90: Ctrl._kk_z = true; break;
				case 67: Ctrl._kk_c = true; break;
				case 32: Ctrl._kk_s = true; break;
			}
			// キーイベント終了
			e.preventDefault();
			e.stopPropagation();
		}
	}
	
	// ----------------------------------------------------------------
	// キーを離す
	static function _kupfn(e : Event) : void{
		if(dom.document.activeElement != null && dom.document.activeElement.tagName.toLowerCase() == "input"){
			// インプットモード
			if((e as KeyboardEvent).keyCode == 13){
				Ctrl.trigger_enter = true;
				(dom.document.activeElement as HTMLInputElement).blur();
			}
		}else{
			// コントローラーモード
			switch((e as KeyboardEvent).keyCode){
				case 37: Ctrl._kklt = false; Ctrl.trigger_lt = true; break;
				case 38: Ctrl._kkup = false; Ctrl.trigger_up = true; break;
				case 39: Ctrl._kkrt = false; Ctrl.trigger_rt = true; break;
				case 40: Ctrl._kkdn = false; Ctrl.trigger_dn = true; break;
				case 88: Ctrl._kk_x = false; Ctrl.trigger_xb = true; break;
				case 90: Ctrl._kk_z = false; Ctrl.trigger_zb = true; break;
				case 67: Ctrl._kk_c = false; Ctrl.trigger_cb = true; break;
				case 32: Ctrl._kk_s = false; Ctrl.trigger_sb = true; break;
			}
			// キーイベント終了
			e.preventDefault();
			e.stopPropagation();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

