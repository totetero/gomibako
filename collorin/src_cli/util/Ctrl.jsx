import "js.jsx";
import "js/web.jsx";

import "Sound.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コントローラクラス
class Ctrl{
	// ウインドウサイズ
	static var ww : int;
	static var wh : int;
	// スクリーンサイズ
	static var sx : int;
	static var sy : int;
	static var sw : int;
	static var sh : int;
	// ピクセルレシオ
	static var pixelRatio : number;
	// キャンバス要素
	static var mdiv : HTMLDivElement;
	static var scvs : HTMLCanvasElement;
	static var sctx : CanvasRenderingContext2D;
	static var gcvs : HTMLCanvasElement;
	static var gctx : CanvasRenderingContext2D;
	// タッチ状態
	static var isTouch : boolean;
	static var tx : int = 0;
	static var ty : int = 0;
	static var ctmv : boolean;
	static var _tempctx : int;
	static var _tempcty : int;
	static var ctx : int = 0;
	static var cty : int = 0;
	static var ctdn : boolean;
	static var ltx : int = 0;
	static var lty : int = 0;
	static var ltdn : boolean;
	static var rtx : int = 0;
	static var rty : int = 0;
	static var rtdn : boolean;
	// キー押下状態
	static var kup : boolean;
	static var kdn : boolean;
	static var krt : boolean;
	static var klt : boolean;
	static var k_z : boolean;
	static var k_x : boolean;
	static var k_c : boolean;
	static var k_s : boolean;
	static var trigger_enter : boolean;
	static var _keydownCode : int;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Ctrl.mdiv = dom.document.getElementById("main") as HTMLDivElement;
		var cdiv = dom.document.getElementById("ctrl") as HTMLDivElement;
		var ldiv = dom.document.getElementById("lctrl") as HTMLDivElement;
		var rdiv = dom.document.getElementById("rctrl") as HTMLDivElement;

		// リスナー追加
		Ctrl.isTouch = js.eval("'ontouchstart' in window") as boolean;
		if(Ctrl.isTouch){
			cdiv.addEventListener("touchstart", Ctrl._ctdnfn);
			cdiv.addEventListener("touchmove", Ctrl._ctmvfn);
			cdiv.addEventListener("touchend", Ctrl._ctupfn);
			cdiv.addEventListener("touchcancel", Ctrl._ctupfn);
			ldiv.addEventListener("touchstart", Ctrl._ltdnfn);
			ldiv.addEventListener("touchmove", Ctrl._ltmvfn);
			ldiv.addEventListener("touchend", Ctrl._ltupfn);
			ldiv.addEventListener("touchcancel", Ctrl._ltupfn);
			rdiv.addEventListener("touchstart", Ctrl._rtdnfn);
			rdiv.addEventListener("touchmove", Ctrl._rtmvfn);
			rdiv.addEventListener("touchend", Ctrl._rtupfn);
			rdiv.addEventListener("touchcancel", Ctrl._rtupfn);
		}else{
			cdiv.addEventListener("mousedown", function(e : Event) : void{
				var x = (e as MouseEvent).clientX;
				var y = (e as MouseEvent).clientY;
				var lw = 144 + Number.parseInt(ldiv.style.left);
				var rw = 144 + Number.parseInt(rdiv.style.right);
				if(x < lw && y > Ctrl.wh - 144){Ctrl._ltdnfn(e);}
				else if(x > Ctrl.ww - rw && y > Ctrl.wh - 144){Ctrl._rtdnfn(e);}
				else{Ctrl._ctdnfn(e);}
			});
			cdiv.addEventListener("mousemove", function(e : Event) : void{
				Ctrl._ctmvfn(e);
				Ctrl._ltmvfn(e);
				Ctrl._rtmvfn(e);
			});
			cdiv.addEventListener("mouseup", function(e : Event) : void{
				Ctrl._ctupfn(e);
				Ctrl._ltupfn(e);
				Ctrl._rtupfn(e);
			});
			cdiv.addEventListener("mouseout", function(e : Event) : void{
				var x = (e as MouseEvent).clientX;
				var y = (e as MouseEvent).clientY;
				if(x <= 0 || Ctrl.ww <= x || y <= 0 || Ctrl.wh <= y){
					Ctrl._ctupfn(e);
					Ctrl._ltupfn(e);
					Ctrl._rtupfn(e);
				}
			});
		}
		dom.document.addEventListener("keydown", Ctrl._kdnfn);
		dom.document.addEventListener("keyup", Ctrl._kupfn);
	}

	// ----------------------------------------------------------------
	// キャンバス設定
	static function setCanvas() : void{
		// ピクセルレシオ設定
		Ctrl.pixelRatio = 1;
		var quality = dom.window.localStorage.getItem("setting_quality");
		if(quality == "high"){Ctrl.pixelRatio = dom.window.devicePixelRatio;}
		if(quality == "low"){Ctrl.pixelRatio = 0.5;}
		// キャンバスリセット
		if(Ctrl.gcvs != null){Ctrl.mdiv.removeChild(Ctrl.gcvs);}
		if(Ctrl.scvs != null){Ctrl.mdiv.removeChild(Ctrl.scvs);}
		// スクリーンキャンバス作成
		Ctrl.scvs = dom.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.sctx = Ctrl.scvs.getContext("2d") as CanvasRenderingContext2D;
		// ゲームキャンバス作成
		Ctrl.gcvs = dom.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.gctx = Ctrl.gcvs.getContext("2d") as CanvasRenderingContext2D;
		// キャンバス設定
		var setting = function(cvs : HTMLCanvasElement, ctx : CanvasRenderingContext2D, pixelRatio : number) : void{
			if(pixelRatio == 1){
				cvs.width = Ctrl.sw;
				cvs.height = Ctrl.sh;
			}else{
				cvs.width = Math.floor(Ctrl.sw * pixelRatio);
				cvs.height = Math.floor(Ctrl.sh * pixelRatio);
				ctx.scale(pixelRatio, pixelRatio);
			}
			cvs.style.position = "absolute";
			cvs.style.left = (Ctrl.sw * -0.5) + "px";
			cvs.style.top = (Ctrl.sh * -0.5) + "px";
			cvs.style.width = Ctrl.sw + "px";
			cvs.style.height = Ctrl.sh + "px";
			Ctrl.mdiv.appendChild(cvs);
		};
		setting(Ctrl.gcvs, Ctrl.gctx, Ctrl.pixelRatio);
		setting(Ctrl.scvs, Ctrl.sctx, Math.max(1, Ctrl.pixelRatio));

	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ウインドウサイズ確認
		var ww = dom.window.innerWidth;
		var wh = dom.window.innerHeight;
		if(Ctrl.ww != ww || Ctrl.wh != wh){
			Ctrl.ww = ww;
			Ctrl.wh = wh;
			Ctrl.sw = 320;
			Ctrl.sh = Math.min(Math.max(Ctrl.wh, 240), 480);
			Ctrl.sx = Math.floor((Ctrl.ww - Ctrl.sw) * 0.5);
			Ctrl.sy = Math.floor((Ctrl.wh - Ctrl.sh) * 0.5);
			Ctrl.setCanvas();
		}

		//if(Ctrl.ctdn){log "center " + Ctrl.ctx + " " + Ctrl.cty;}
		//if(Ctrl.ltdn){log "left " + Ctrl.ltx + " " + Ctrl.lty;}
		//if(Ctrl.rtdn){log "right " + Ctrl.rtx + " " + Ctrl.rty;}
	}

	// ----------------------------------------------------------------
	// タッチ座標獲得
	static function _getCoordinate(e : Event) : void{
		Ctrl.tx = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX);
		Ctrl.ty = (Ctrl.isTouch ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY);
		Ctrl.ctx = Ctrl.tx - Ctrl.sx;
		Ctrl.cty = Ctrl.ty - Ctrl.sy;
		Ctrl.ltx = Ctrl.tx;
		Ctrl.lty = Ctrl.ty - Ctrl.wh + 144;
		Ctrl.rtx = Ctrl.tx - Ctrl.ww + 144;
		Ctrl.rty = Ctrl.ty - Ctrl.wh + 144;
	}

	// ----------------------------------------------------------------
	// ルート要素 タッチ開始
	static function _ctdnfn(e : Event) : void{
		// input要素フォーカス処理
		if((e.target as Element).tagName.toLowerCase() == "input"){return;}
		if(dom.document.activeElement != null && dom.document.activeElement.tagName.toLowerCase() == "input"){
			(dom.document.activeElement as HTMLInputElement).blur();
		}

		Ctrl._getCoordinate(e);
		if(0 <= Ctrl.ctx && Ctrl.ctx <= Ctrl.sw && 0 <= Ctrl.cty && Ctrl.cty <= Ctrl.sh){
			Ctrl.ctdn = true;
			Ctrl.ctmv = false;
			Ctrl._tempctx = Ctrl.ctx;
			Ctrl._tempcty = Ctrl.cty;
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
		e.stopPropagation();

		// タップによるサウンド再生許可 サウンド準備が完了してから1回だけ処理が行われる
		Sound.setPlayable();
	}

	// ----------------------------------------------------------------
	// ルート要素 タッチ移動
	static function _ctmvfn(e : Event) : void{
		if(Ctrl.ctdn){
			Ctrl._getCoordinate(e);
			if(!Ctrl.ctmv){
				var x = Ctrl._tempctx - Ctrl.ctx;
				var y = Ctrl._tempcty - Ctrl.cty;
				Ctrl.ctmv = (x * x + y * y > 10);
			}
			// 上位ノードイベントキャンセル
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// ----------------------------------------------------------------
	// ルート要素 タッチ完了
	static function _ctupfn(e : Event) : void{
		if(Ctrl.ctdn){
			Ctrl.ctdn = false;
			Ctrl._getCoordinate(e);
//			Ctrl.trigger_mup = true;
			// 上位ノードイベントキャンセル
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// ----------------------------------------------------------------
	// コントローラー要素 タッチ状態関数
	static function _ltdnfn(e : Event) : void{Ctrl.ltdn = true; Ctrl._getCoordinate(e); e.preventDefault(); e.stopPropagation(); Sound.setPlayable();}
	static function _rtdnfn(e : Event) : void{Ctrl.rtdn = true; Ctrl._getCoordinate(e); e.preventDefault(); e.stopPropagation(); Sound.setPlayable();}
	static function _ltmvfn(e : Event) : void{if(Ctrl.ltdn){Ctrl._getCoordinate(e); e.preventDefault(); e.stopPropagation();}}
	static function _rtmvfn(e : Event) : void{if(Ctrl.rtdn){Ctrl._getCoordinate(e); e.preventDefault(); e.stopPropagation();}}
	static function _ltupfn(e : Event) : void{if(Ctrl.ltdn){Ctrl.ltdn = false; Ctrl._getCoordinate(e); e.preventDefault(); e.stopPropagation();}}
	static function _rtupfn(e : Event) : void{if(Ctrl.rtdn){Ctrl.rtdn = false; Ctrl._getCoordinate(e); e.preventDefault(); e.stopPropagation();}}

	// ----------------------------------------------------------------
	// キーを押す
	static function _kdnfn(e : Event) : void{
		if(dom.document.activeElement != null && dom.document.activeElement.tagName.toLowerCase() == "input"){
			// インプットモード
			Ctrl._keydownCode = (e as KeyboardEvent).keyCode;
		}else{
			// コントローラーモード
			switch((e as KeyboardEvent).keyCode){
				case 37: Ctrl.klt = true; break;
				case 38: Ctrl.kup = true; break;
				case 39: Ctrl.krt = true; break;
				case 40: Ctrl.kdn = true; break;
				case 88: Ctrl.k_x = true; break;
				case 90: Ctrl.k_z = true; break;
				case 67: Ctrl.k_c = true; break;
				case 32: Ctrl.k_s = true; break;
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
			if((e as KeyboardEvent).keyCode == 13 && Ctrl._keydownCode == 13){
				Ctrl.trigger_enter = true;
				(dom.document.activeElement as HTMLInputElement).blur();
			}
		}else{
			// コントローラーモード
			switch((e as KeyboardEvent).keyCode){
				case 37: Ctrl.klt = false; break;
				case 38: Ctrl.kup = false; break;
				case 39: Ctrl.krt = false; break;
				case 40: Ctrl.kdn = false; break;
				case 88: Ctrl.k_x = false; break;
				case 90: Ctrl.k_z = false; break;
				case 67: Ctrl.k_c = false; break;
				case 32: Ctrl.k_s = false; break;
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

