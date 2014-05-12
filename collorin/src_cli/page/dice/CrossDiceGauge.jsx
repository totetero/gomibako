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
		if(this._lAction == 0 && this._lTime > 0 && --this._lTime == 0){this._lAction = 1; this.lChara = null;}
		if(this._rAction == 0 && this._rTime > 0 && --this._rTime == 0){this._rAction = 1; this.rChara = null;}
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

		if(this._currentLchara != null){
			Ctrl.sctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			Ctrl.sctx.fillRect(lx, 0, 50, 50);
			Ctrl.sctx.drawImage(Loader.imgs["img_chara_icon_" + this._currentLchara.code], lx, 0, 50, 50);
		}
	}

	// ----------------------------------------------------------------
	// 表示設定
	function setLeft(chara : DataChara, time : int) : void{
		this.lChara = chara;
		this._lTime = time;
		this._lAction = (this._lAction == 0) ? 1 : Math.abs(this._lAction);

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._lAction = (this.lChara != null) ? 0 : -CrossDiceGauge._actionMax;
			this._currentLchara = this.lChara;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

