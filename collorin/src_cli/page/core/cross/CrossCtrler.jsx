import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";
import "../../../util/PartsLabel.jsx";
import "../../../util/PartsButton.jsx";
import "../../../util/PartsScroll.jsx";
import "../Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コントローラクラス ページをまたぐクロス要素
class CrossCtrler{
	static const _lActionMax = 10;
	static const _rActionMax = 5;

	var _arrowBox : Ctrl.Box;
	var _zBox : Ctrl.Box;
	var _xBox : Ctrl.Box;
	var _cBox : Ctrl.Box;
	var _sBox : Ctrl.Box;
	var _currentZlabelCvs : HTMLCanvasElement;
	var _currentXlabelCvs : HTMLCanvasElement;
	var _currentClabelCvs : HTMLCanvasElement;
	var _currentSlabelCvs : HTMLCanvasElement;
	var _nextZlavel : string;
	var _nextXlavel : string;
	var _nextClavel : string;
	var _nextSlavel : string;
	var _lShow : boolean;
	var _rShow : boolean;
	var _lAction = CrossCtrler._lActionMax;
	var _rAction = CrossCtrler._rActionMax;
	var _kup : boolean;
	var _kdn : boolean;
	var _krt : boolean;
	var _klt : boolean;
	var _k_z : boolean;
	var _k_x : boolean;
	var _k_c : boolean;
	var _k_s : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this._arrowBox = new Ctrl.Box(0, -144, 144, 144);
		this._zBox = new Ctrl.Box(0 - 144, 36 * 0 - 144, 144, 36);
		this._xBox = new Ctrl.Box(0 - 144, 36 * 1 - 144, 144, 36);
		this._cBox = new Ctrl.Box(0 - 144, 36 * 2 - 144, 144, 36);
		this._sBox = new Ctrl.Box(0 - 144, 36 * 3 - 144, 144, 36);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		var tempLaction = this._lAction;
		var tempRaction = this._rAction;

		// 展開処理
		if(this._lAction > 0 || (0 > this._lAction && this._lShow)){this._lAction++;}
		if(this._rAction > 0 || (0 > this._rAction && this._rShow)){this._rAction++;}
		if(this._lAction > CrossCtrler._lActionMax){this._lAction = -CrossCtrler._lActionMax;}
		if(this._rAction > CrossCtrler._rActionMax){this._rAction = -CrossCtrler._rActionMax;}
		if(this._lAction == -CrossCtrler._lActionMax){this._lToggle();}
		if(this._rAction == -CrossCtrler._rActionMax){this._rToggle();}

		// 十字キー更新確認
		if(tempLaction != this._lAction){Ctrl.update_lctx = true;}
		if(this._kup != Ctrl.kup){this._kup = Ctrl.kup; Ctrl.update_lctx = true;}
		if(this._kdn != Ctrl.kdn){this._kdn = Ctrl.kdn; Ctrl.update_lctx = true;}
		if(this._krt != Ctrl.krt){this._krt = Ctrl.krt; Ctrl.update_lctx = true;}
		if(this._klt != Ctrl.klt){this._klt = Ctrl.klt; Ctrl.update_lctx = true;}
		// ボタン更新確認
		if(tempRaction != this._rAction){Ctrl.update_rctx = true;}
		if(this._k_z != Ctrl.k_z){this._k_z = Ctrl.k_z; Ctrl.update_rctx = true;}
		if(this._k_x != Ctrl.k_x){this._k_x = Ctrl.k_x; Ctrl.update_rctx = true;}
		if(this._k_c != Ctrl.k_c){this._k_c = Ctrl.k_c; Ctrl.update_rctx = true;}
		if(this._k_s != Ctrl.k_s){this._k_s = Ctrl.k_s; Ctrl.update_rctx = true;}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		if(Ctrl.update_rctx){
			// ボタンの描画
			var nimg = Loader.imgs["img_system_button_ctrlButton_normal"];
			var aimg = Loader.imgs["img_system_button_ctrlButton_active"];
			if(nimg != null && aimg != null){
				var pixelRatio = 2;
				var mx = 144 * Math.abs(this._rAction / CrossCtrler._rActionMax);
				var drawBtn = function(box : Ctrl.Box, label : string, cvs : HTMLCanvasElement, active : boolean) : HTMLCanvasElement{
					if(box == null){return null;}
					if(cvs == null && label != "" && this._rAction <= 0){cvs = Drawer.createText(label, 16 * pixelRatio, "black");}
					if(cvs != null){
						// ボタン枠の描画
						var x = 144 + (box.x < 0 ? box.x : box.x - Ctrl.window.w) + mx;
						var y = 144 + (box.y < 0 ? box.y : box.y - Ctrl.window.h);
						Ctrl.rctx.drawImage(active ? aimg : nimg, x, y, box.w, box.h);
						// ボタン文字列の描画
						var tw = cvs.width / pixelRatio;
						var th = cvs.height / pixelRatio;
						var tx = x + (box.w - tw) * 0.5;
						var ty = y + (box.h - th - 4) * 0.5 + (active ? 2 : 0);
						Ctrl.rctx.drawImage(cvs, tx, ty, tw, th);
					}
					return cvs;
				};
				this._currentZlabelCvs = drawBtn(Ctrl.zBox, this._nextZlavel, this._currentZlabelCvs, Ctrl.k_z);
				this._currentXlabelCvs = drawBtn(Ctrl.xBox, this._nextXlavel, this._currentXlabelCvs, Ctrl.k_x);
				this._currentClabelCvs = drawBtn(Ctrl.cBox, this._nextClavel, this._currentClabelCvs, Ctrl.k_c);
				this._currentSlabelCvs = drawBtn(Ctrl.sBox, this._nextSlavel, this._currentSlabelCvs, Ctrl.k_s);
			}
		}

		if(Ctrl.update_lctx){
			// 十字キーの描画
			var nimg = Loader.imgs["img_system_button_ctrlArrow_normal"];
			var aimg = Loader.imgs["img_system_button_ctrlArrow_active"];
			if(nimg != null && aimg != null && Ctrl.arrowBox != null){
				var mx = -144 * Math.abs(this._lAction / CrossCtrler._lActionMax);
				var x = (Ctrl.arrowBox.x < 0 ? Ctrl.window.w + Ctrl.arrowBox.x : Ctrl.arrowBox.x) + mx;
				var y = 240 + (Ctrl.arrowBox.y < 0 ? Ctrl.arrowBox.y : Ctrl.arrowBox.y - Ctrl.window.h);
				Ctrl.lctx.drawImage(Ctrl.kup ? aimg : nimg,  0,      0, 68, 92 + 4, x + 55     , y +  0 - 2 + 15, 34, 46 + 2);
				Ctrl.lctx.drawImage(Ctrl.krt ? aimg : nimg, 69,      0, 92, 68 + 4, x + 98 - 15, y + 55 - 2     , 46, 34 + 2);
				Ctrl.lctx.drawImage(Ctrl.kdn ? aimg : nimg, 93, 69 + 4, 68, 92 + 4, x + 55     , y + 98 - 2 - 15, 34, 46 + 2);
				Ctrl.lctx.drawImage(Ctrl.klt ? aimg : nimg,  0, 93 + 4, 92, 68 + 4, x +  0 + 15, y + 55 - 2     , 46, 34 + 2);
			}
		}
	}

	// ----------------------------------------------------------------
	// 左コントローラの表示設定
	function setLctrl(open : boolean) : void{
		if(this._lShow != open){
			this._lShow = open;
			this._lAction = (this._lAction == 0) ? 1 : Math.abs(this._lAction);
		}

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._lAction = this._lShow ? 0 : CrossCtrler._lActionMax;
			this._lToggle();
		}
	}

	// ----------------------------------------------------------------
	// 右コントローラの表示設定
	function setRctrl(zLabel : string, xLabel : string, cLabel : string, sLabel : string) : void{
		if(zLabel == "" && xLabel == "" && cLabel == "" && sLabel == ""){
			// 右コントローラを隠す
			this._rShow = false;
			this._rAction = (this._rAction == 0) ? 1 : Math.abs(this._rAction);
		}else{
			// 右コントローラを表示
			this._rShow = true;
			var change = false;
			change = change || this._nextZlavel != zLabel;
			change = change || this._nextXlavel != xLabel;
			change = change || this._nextClavel != cLabel;
			change = change || this._nextSlavel != sLabel;
			if(change){this._rAction = (this._rAction == 0) ? 1 : Math.abs(this._rAction);}
		}
		this._nextZlavel = zLabel;
		this._nextXlavel = xLabel;
		this._nextClavel = cLabel;
		this._nextSlavel = sLabel;

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._rAction = this._rShow ? 0 : CrossCtrler._rActionMax;
			this._rToggle();
		}
	}

	// ----------------------------------------------------------------
	// 左切り替え
	function _lToggle() : void{
		if(this._lShow){
			Ctrl.arrowBox = this._arrowBox;
			Ctrl.update_lctx = true;
		}else{
			Ctrl.arrowBox = null;
		}
	}

	// ----------------------------------------------------------------
	// 右切り替え
	function _rToggle() : void{
		if(this._rShow){
			Ctrl.zBox = (this._nextZlavel != "") ? this._zBox : null;
			Ctrl.xBox = (this._nextXlavel != "") ? this._xBox : null;
			Ctrl.cBox = (this._nextClavel != "") ? this._cBox : null;
			Ctrl.sBox = (this._nextSlavel != "") ? this._sBox : null;
			this._currentZlabelCvs = null;
			this._currentXlabelCvs = null;
			this._currentClabelCvs = null;
			this._currentSlabelCvs = null;
			Ctrl.update_rctx = true;
		}else{
			Ctrl.zBox = null;
			Ctrl.xBox = null;
			Ctrl.cBox = null;
			Ctrl.sBox = null;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

