import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/data/DataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくゲージクラス カートリッジをまたぐクロス要素
class CrossDiceGauge{
	static const _actionMax = 10;

	var lActive : boolean;
	var rActive : boolean;
	var lChara : DataChara;
	var rChara : DataChara;

	var _skip : boolean;
	var _currentLchara : DataChara;
	var _currentRchara : DataChara;
	var _lAction = -CrossDiceGauge._actionMax;
	var _rAction = -CrossDiceGauge._actionMax;
	var _lTime : int;
	var _rTime : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		this.lActive = false;
		this.rActive = false;

		// 展開処理
		if(this._lAction > 0 || (0 > this._lAction && this.lChara != null)){this._lAction++;}
		if(this._rAction > 0 || (0 > this._rAction && this.rChara != null)){this._rAction++;}
		if(this._lAction == 0 && this._lTime > 0 && --this._lTime == 0){this.lChara = null; this._lAction = this._skip ? -CrossDiceGauge._actionMax : 1;}
		if(this._rAction == 0 && this._rTime > 0 && --this._rTime == 0){this.rChara = null; this._rAction = this._skip ? -CrossDiceGauge._actionMax : 1;}
		if(this._lAction > CrossDiceGauge._actionMax){this._lAction = -CrossDiceGauge._actionMax;}
		if(this._rAction > CrossDiceGauge._actionMax){this._rAction = -CrossDiceGauge._actionMax;}
		if(this._lAction == -CrossDiceGauge._actionMax && this.lChara != null){this._currentLchara = this.lChara;}
		if(this._rAction == -CrossDiceGauge._actionMax && this.rChara != null){this._currentRchara = this.rChara;}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		var lx = -50 * Math.abs(this._lAction / CrossDiceGauge._actionMax);
		var rx = Ctrl.sw - 50 * (1 - Math.abs(this._rAction / CrossDiceGauge._actionMax));

		// 左表示
		if(this._currentLchara != null){
			var chara = this._currentLchara;
			Ctrl.sctx.fillStyle = this.lActive ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";
			Ctrl.sctx.fillRect(lx, 0, 50, 50);
			Ctrl.sctx.drawImage(Loader.imgs["img_chara_icon_" + chara.code], lx, 0, 50, 50);
			Ctrl.sctx.fillStyle = "#cccccc";
			Ctrl.sctx.fillRect(lx, 55, 50, 10);
			Ctrl.sctx.fillRect(lx, 70, 50, 10);
			Ctrl.sctx.fillStyle = "red";
			Ctrl.sctx.fillRect(lx, 55, (chara.hp / chara.maxhp) * 50, 10);
			Ctrl.sctx.fillStyle = "blue";
			Ctrl.sctx.fillRect(lx, 70, (chara.sp / chara.maxsp) * 50, 10);
		}

		// 右表示
		if(this._currentRchara != null){
			var chara = this._currentRchara;
			Ctrl.sctx.fillStyle = this.rActive ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";
			Ctrl.sctx.fillRect(rx, 0, 50, 50);
			Ctrl.sctx.drawImage(Loader.imgs["img_chara_icon_" + chara.code], rx, 0, 50, 50);
			Ctrl.sctx.fillStyle = "#cccccc";
			Ctrl.sctx.fillRect(rx, 55, 50, 10);
			Ctrl.sctx.fillRect(rx, 70, 50, 10);
			Ctrl.sctx.fillStyle = "red";
			Ctrl.sctx.fillRect(rx, 55, (chara.hp / chara.maxhp) * 50, 10);
			Ctrl.sctx.fillStyle = "blue";
			Ctrl.sctx.fillRect(rx, 70, (chara.sp / chara.maxsp) * 50, 10);
		}
	}

	// ----------------------------------------------------------------
	// 左表示設定
	function setLeft(chara : DataChara, time : int) : void{
		if(this.lChara != chara){
			this.lChara = chara;
			this._lAction = (this._lAction == 0) ? 1 : Math.abs(this._lAction);
		}
		this._lTime = time;

		// 演出スキップ確認
		this._skip = (dom.window.localStorage.getItem("setting_transition") == "off");
		if(this._skip){
			this._lAction = (this.lChara != null) ? 0 : -CrossDiceGauge._actionMax;
			this._currentLchara = this.lChara;
		}
	}


	// ----------------------------------------------------------------
	// 右表示設定
	function setRight(chara : DataChara, time : int) : void{
		if(this.rChara != chara){
			this.rChara = chara;
			this._rAction = (this._rAction == 0) ? 1 : Math.abs(this._rAction);
		}
		this._rTime = time;

		// 演出スキップ確認
		this._skip = (dom.window.localStorage.getItem("setting_transition") == "off");
		if(this._skip){
			this._rAction = (this.rChara != null) ? 0 : -CrossDiceGauge._actionMax;
			this._currentLchara = this.rChara;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

