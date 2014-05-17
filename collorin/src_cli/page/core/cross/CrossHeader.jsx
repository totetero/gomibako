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

import "../load/SECloadTransition.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ヘッダクラス ページをまたぐクロス要素
class CrossHeader{
	static const _actionMax = 10;

	var lbtn : PartsButton;
	var rbtn : PartsButton;

	var _currentTextCvs : HTMLCanvasElement;
	var _currentType : string;
	var _nextText : string;
	var _nextType : string;
	var _skip : boolean;
	var _show : boolean;
	var _hAction = CrossHeader._actionMax;
	var _lAction = CrossHeader._actionMax;
	var _rAction = CrossHeader._actionMax;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this.lbtn = new PartsButton(225, 0, 45, 50, true);
		this.rbtn = new PartsButton(275, 0, 45, 50, true);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		this.lbtn.calc(this._lAction == 0);
		this.rbtn.calc(this._rAction == 0);

		// 展開処理
		if(this._hAction > 0 || (0 > this._hAction && this._show)){this._hAction++;}
		if(this._lAction > 0 || (0 > this._lAction && this._show)){this._lAction++;}
		if(this._rAction > 0 || (0 > this._rAction && this._show)){this._rAction++;}
		if(this._hAction > CrossHeader._actionMax){this._hAction = -CrossHeader._actionMax;}
		if(this._lAction > CrossHeader._actionMax){this._lAction = -CrossHeader._actionMax;}
		if(this._rAction > CrossHeader._actionMax){this._rAction = -CrossHeader._actionMax;}
		if(this._hAction == -CrossHeader._actionMax && this._show){if(this._skip){this._hAction = 0;} this._currentTextCvs = null;}
		if(this._lAction == -CrossHeader._actionMax && this._show){if(this._skip){this._lAction = 0;} this._currentType = "";}
		if(this._rAction == -CrossHeader._actionMax && this._show){if(this._skip){this._rAction = 0;}}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// ページ遷移中の場合通常のヘッダ描画はキャンセルされる
		if(SECloadTransition.invisibleHeaderCount > 0){return;}

		// ウインドウサイズに対する位置調整
		this.lbtn.x = Ctrl.screen.w - 95;
		this.rbtn.x = Ctrl.screen.w - 45;

		// 遷移座標計算
		var hmy = 50 * Math.abs(this._hAction / CrossHeader._actionMax);
		var lmy = 50 * Math.abs(this._lAction / CrossHeader._actionMax);
		var rmy = 50 * Math.abs(this._rAction / CrossHeader._actionMax);
		if(hmy >= 50 && lmy >= 50 && rmy >= 50){return;}

		// 箱描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], 5, 5 - hmy, Ctrl.screen.w - 105, 45);
		Ctrl.sctx.lineWidth = 2;
		Ctrl.sctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
		Ctrl.sctx.strokeRect(10, 10 - hmy, 40, 35);
		// 文字列描画
		if(this._nextText != ""){
			var pixelRatio = 2;
			if(this._currentTextCvs == null){this._currentTextCvs = Drawer.createText(this._nextText, 18 * pixelRatio, "black");}
			var w = this._currentTextCvs.width / pixelRatio;
			var h = this._currentTextCvs.height / pixelRatio;
			var x = 5 + 50;
			var y = 5 + (45 - h) * 0.5 - hmy;
			Ctrl.sctx.drawImage(this._currentTextCvs, x, y, w, h);
		}
		// ボタン描画
		if(this._currentType == ""){this._currentType = this._nextType;}
		var lImgCode = "img_system_button_header" + (this._currentType == "mypage" ? "Mypage" : "Top") + "_" + (this.lbtn.active ? "active" : "normal");
		var rImgCode = "img_system_button_headerMenu_" + (this.rbtn.active ? "active" : "normal");
		Ctrl.sctx.drawImage(Loader.imgs[lImgCode], this.lbtn.x, this.lbtn.y - lmy, this.lbtn.w, this.lbtn.h);
		Ctrl.sctx.drawImage(Loader.imgs[rImgCode], this.rbtn.x, this.rbtn.y - rmy, this.rbtn.w, this.rbtn.h);
	}

	// ----------------------------------------------------------------
	// 表示設定
	function setType(text : string, type : string) : void{
		if(text == "" || type == ""){
			// ヘッダを隠す
			this._show = false;
			this._hAction = (this._hAction == 0) ? 1 : Math.abs(this._hAction);
			this._lAction = (this._lAction == 0) ? 1 : Math.abs(this._lAction);
			this._rAction = (this._rAction == 0) ? 1 : Math.abs(this._rAction);
		}else{
			// ヘッダを表示
			this._show = true;
			// 箱展開
			if(this._nextText != text){
				if(this._nextText != ""){this._hAction = (this._hAction == 0) ? 1 : Math.abs(this._hAction);}
				this._nextText = text;
			}
			// 戻るボタン展開
			if(this._nextType != type){
				if(this._nextType != ""){this._lAction = (this._lAction == 0) ? 1 : Math.abs(this._lAction);}
				this._nextType = type;
			}
		}

		// 演出スキップ確認
		this._skip = (dom.window.localStorage.getItem("setting_transition") == "off");
		if(this._skip){
			this._hAction = CrossHeader._actionMax;
			this._lAction = CrossHeader._actionMax;
			this._rAction = CrossHeader._actionMax;
		}
	}

	// ----------------------------------------------------------------
	// 有効設定
	function setActive(isActive : boolean) : void{
		if(isActive){
			this.lbtn.inactive = false;
			this.rbtn.inactive = false;
			this.lbtn.trigger = false;
			this.rbtn.trigger = false;
		}else{
			this.lbtn.inactive = true;
			this.rbtn.inactive = true;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

