import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コントローラクラス ページをまたぐクロス要素
class CrossCtrler{
	static const _actionMax = 10;

	var upActive : boolean;
	var dnActive : boolean;
	var rtActive : boolean;
	var ltActive : boolean;
	var z_Active : boolean;
	var x_Active : boolean;
	var c_Active : boolean;
	var s_Active : boolean;
	var upTrigger : boolean;
	var dnTrigger : boolean;
	var rtTrigger : boolean;
	var ltTrigger : boolean;
	var z_Trigger : boolean;
	var x_Trigger : boolean;
	var c_Trigger : boolean;
	var s_Trigger : boolean;

	var _zbox : CrossCtrler._BtnBox;
	var _xbox : CrossCtrler._BtnBox;
	var _cbox : CrossCtrler._BtnBox;
	var _sbox : CrossCtrler._BtnBox;
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
	var _lAction = -CrossCtrler._actionMax;
	var _rAction = -CrossCtrler._actionMax;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// 右コントローラのボタン描画範囲設定
		this._zbox = new CrossCtrler._BtnBox(5, 30 * 0 - 2 +  3, 134, 30 + 2);
		this._xbox = new CrossCtrler._BtnBox(5, 30 * 1 - 2 +  9, 134, 30 + 2);
		this._cbox = new CrossCtrler._BtnBox(5, 30 * 2 - 2 + 15, 134, 30 + 2);
		this._sbox = new CrossCtrler._BtnBox(5, 30 * 3 - 2 + 21, 134, 30 + 2);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		var tempLaction = this._lAction;
		var tempRaction = this._rAction;
		var tempUpActive = this.upActive;
		var tempDnActive = this.dnActive;
		var tempRtActive = this.rtActive;
		var tempLtActive = this.ltActive;
		var tempZ_Active = this.z_Active;
		var tempX_Active = this.x_Active;
		var tempC_Active = this.c_Active;
		var tempS_Active = this.s_Active;

		// 左コントローラの押下確認
		if(this._lAction != 0){
			// ボタン無効状態
			this.upActive = false;
			this.dnActive = false;
			this.rtActive = false;
			this.ltActive = false;
		}else{
			if(Ctrl.ltdn){
				// ボタン押下中
				this.upActive = false;
				this.dnActive = false;
				this.rtActive = false;
				this.ltActive = false;
				var x = Ctrl.ltx - 72;
				var y = Ctrl.lty - 72;
				if(x * x + y * y < 72 * 72){
					if(y < 0 && x < y * y * 0.18 && x > y * y * -0.18){this.upActive = true;}
					if(y > 0 && x < y * y * 0.18 && x > y * y * -0.18){this.dnActive = true;}
					if(x > 0 && y < x * x * 0.18 && y > x * x * -0.18){this.rtActive = true;}
					if(x < 0 && y < x * x * 0.18 && y > x * x * -0.18){this.ltActive = true;}
				}
			}
			// キー押下確認
			if(Ctrl.kup){this.upActive = true;}
			if(Ctrl.kdn){this.dnActive = true;}
			if(Ctrl.krt){this.rtActive = true;}
			if(Ctrl.klt){this.ltActive = true;}
			// ボタンを放した瞬間
			if(!Ctrl.ltdn && !Ctrl.kup && this.upActive){this.upActive = false; this.upTrigger = true;}
			if(!Ctrl.ltdn && !Ctrl.kdn && this.dnActive){this.dnActive = false; this.dnTrigger = true;}
			if(!Ctrl.ltdn && !Ctrl.krt && this.rtActive){this.rtActive = false; this.rtTrigger = true;}
			if(!Ctrl.ltdn && !Ctrl.klt && this.ltActive){this.ltActive = false; this.ltTrigger = true;}
		}

		// 右コントローラの押下確認
		if(this._rAction != 0){
			// ボタン無効状態
			this.z_Active = false;
			this.x_Active = false;
			this.c_Active = false;
			this.s_Active = false;
		}else{
			if(Ctrl.rtdn){
				// ボタン押下中
				this.z_Active = false;
				this.x_Active = false;
				this.c_Active = false;
				this.s_Active = false;
				var x = Ctrl.rtx;
				var y = Ctrl.rty;
				var b = this._zbox; if(b.x < x && x < b.x + b.w && b.y < y && y < b.y + b.h){this.z_Active = true;}
				var b = this._xbox; if(b.x < x && x < b.x + b.w && b.y < y && y < b.y + b.h){this.x_Active = true;}
				var b = this._cbox; if(b.x < x && x < b.x + b.w && b.y < y && y < b.y + b.h){this.c_Active = true;}
				var b = this._sbox; if(b.x < x && x < b.x + b.w && b.y < y && y < b.y + b.h){this.s_Active = true;}
			}
			// キー押下確認
			if(Ctrl.k_z){this.z_Active = true;}
			if(Ctrl.k_x){this.x_Active = true;}
			if(Ctrl.k_c){this.c_Active = true;}
			if(Ctrl.k_s){this.s_Active = true;}
			// ボタンを放した瞬間
			if(!Ctrl.rtdn && !Ctrl.k_z && this.z_Active){this.z_Active = false; this.z_Trigger = true;}
			if(!Ctrl.rtdn && !Ctrl.k_x && this.x_Active){this.x_Active = false; this.x_Trigger = true;}
			if(!Ctrl.rtdn && !Ctrl.k_c && this.c_Active){this.c_Active = false; this.c_Trigger = true;}
			if(!Ctrl.rtdn && !Ctrl.k_s && this.s_Active){this.s_Active = false; this.s_Trigger = true;}
		}

		// 展開処理
		if(this._lAction > 0 || (0 > this._lAction && this._lShow)){this._lAction++;}
		if(this._rAction > 0 || (0 > this._rAction && this._rShow)){this._rAction++;}
		if(this._lAction > CrossCtrler._actionMax){this._lAction = -CrossCtrler._actionMax;}
		if(this._rAction > CrossCtrler._actionMax){this._rAction = -CrossCtrler._actionMax;}
		if(this._lAction == -CrossCtrler._actionMax){Ctrl.ldiv.style.display = this._lShow ? "block" : "none";}
		if(this._rAction == -CrossCtrler._actionMax){
			Ctrl.rdiv.style.display = this._rShow ? "block" : "none";
			if(this._rShow){
				this._currentZlabelCvs = null;
				this._currentXlabelCvs = null;
				this._currentClabelCvs = null;
				this._currentSlabelCvs = null;
			}
		}

		// 十字キー更新確認
		if(tempLaction != this._lAction){Ctrl.clUpdate = true;}
		if(tempUpActive != this.upActive){Ctrl.clUpdate = true;}
		if(tempDnActive != this.dnActive){Ctrl.clUpdate = true;}
		if(tempRtActive != this.rtActive){Ctrl.clUpdate = true;}
		if(tempLtActive != this.ltActive){Ctrl.clUpdate = true;}
		// ボタン更新確認
		if(tempRaction != this._rAction){Ctrl.crUpdate = true;}
		if(tempZ_Active != this.z_Active){Ctrl.crUpdate = true;}
		if(tempX_Active != this.x_Active){Ctrl.crUpdate = true;}
		if(tempC_Active != this.c_Active){Ctrl.crUpdate = true;}
		if(tempS_Active != this.s_Active){Ctrl.crUpdate = true;}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		if(Ctrl.clUpdate){
			// 十字キーの描画
			var nimg = Loader.imgs["img_system_button_ctrlArrow_normal"];
			var aimg = Loader.imgs["img_system_button_ctrlArrow_active"];
			if(nimg != null && aimg != null){
				var x = -144 * Math.abs(this._lAction / CrossCtrler._actionMax);
				Ctrl.clctx.drawImage(this.upActive ? aimg : nimg,  0,      0, 68, 92 + 4, x + 55     , 240 - 144 +  0 - 2 + 15, 34, 46 + 2);
				Ctrl.clctx.drawImage(this.rtActive ? aimg : nimg, 69,      0, 92, 68 + 4, x + 98 - 15, 240 - 144 + 55 - 2     , 46, 34 + 2);
				Ctrl.clctx.drawImage(this.dnActive ? aimg : nimg, 93, 69 + 4, 68, 92 + 4, x + 55     , 240 - 144 + 98 - 2 - 15, 34, 46 + 2);
				Ctrl.clctx.drawImage(this.ltActive ? aimg : nimg,  0, 93 + 4, 92, 68 + 4, x +  0 + 15, 240 - 144 + 55 - 2     , 46, 34 + 2);
			}
		}

		if(Ctrl.crUpdate){
			// ボタンの描画
			var nimg = Loader.imgs["img_system_button_ctrlButton_normal"];
			var aimg = Loader.imgs["img_system_button_ctrlButton_active"];
			if(nimg != null && aimg != null){
				var pixelRatio = 2;
				var x = 144 * Math.abs(this._rAction / CrossCtrler._actionMax);
				var drawBtn = function(box : CrossCtrler._BtnBox, label : string, cvs : HTMLCanvasElement, active : boolean) : HTMLCanvasElement{
					if(cvs == null && label != "" && this._rAction <= 0){cvs = Drawer.createText(label, 16 * pixelRatio, "black");}
					if(cvs != null){
						// ボタン枠の描画
						Drawer.drawBox(Ctrl.crctx, active ? aimg : nimg, x + box.x, box.y, box.w, box.h);
						// ボタン文字列の描画
						var bw = cvs.width / pixelRatio;
						var bh = cvs.height / pixelRatio;
						var bx = box.x + (box.w - bw) * 0.5;
						var by = box.y + (box.h - bh - 2) * 0.5 + (active ? 2 : 0);
						Ctrl.crctx.drawImage(cvs, x + bx, by, bw, bh);
					}
					return cvs;
				};
				this._currentZlabelCvs = drawBtn(this._zbox, this._nextZlavel, this._currentZlabelCvs, this.z_Active);
				this._currentXlabelCvs = drawBtn(this._xbox, this._nextXlavel, this._currentXlabelCvs, this.x_Active);
				this._currentClabelCvs = drawBtn(this._cbox, this._nextClavel, this._currentClabelCvs, this.c_Active);
				this._currentSlabelCvs = drawBtn(this._sbox, this._nextSlavel, this._currentSlabelCvs, this.s_Active);
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
			this._lAction = this._lShow ? 0 : -CrossCtrler._actionMax;
			Ctrl.ldiv.style.display = this._lShow ? "block" : "none";
			Ctrl.clUpdate = true;
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
			this._rAction = this._rShow ? 0 : -CrossCtrler._actionMax;
			Ctrl.rdiv.style.display = this._rShow ? "block" : "none";
			Ctrl.crUpdate = true;
			this._currentZlabelCvs = null;
			this._currentXlabelCvs = null;
			this._currentClabelCvs = null;
			this._currentSlabelCvs = null;
		}
	}

	// ----------------------------------------------------------------
	// 右コントローラのボタン描画範囲構造体
	class _BtnBox{
		var x : int;
		var y : int;
		var w : int;
		var h : int;
		function constructor(x : int, y : int, w : int, h : int){
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

