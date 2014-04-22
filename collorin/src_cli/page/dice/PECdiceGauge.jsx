import "js/web.jsx";

import "../../util/EventCartridge.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくステータスゲージクラス
abstract class PECdiceGauge extends EventCartridge{
	var chara : DiceCharacter;
	var _time : int;
	var _action : int = 0;
	var exist = true;
	var hprate0 : number;
	var sprate0 : number;
	var hprate1 : number;
	var sprate1 : number;
	var _hpDrawn = false;
	var _spDrawn = false;

	// ステータスゲージ要素
	var _statusDiv : HTMLDivElement;
	var _iconDiv : HTMLDivElement;
	var _underHpDiv : HTMLDivElement;
	var _underSpDiv : HTMLDivElement;
	var _overHpDiv : HTMLDivElement;
	var _overSpDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(statusDiv : HTMLDivElement, chara : DiceCharacter, time : int){
		this.chara = chara;
		this._time = time;
		// DOM獲得
		this._statusDiv = statusDiv;
		this._iconDiv = statusDiv.getElementsByClassName("icon").item(0) as HTMLDivElement;
		var hpgaugeDiv = statusDiv.getElementsByClassName("gauge hp").item(0) as HTMLDivElement;
		var spgaugeDiv = statusDiv.getElementsByClassName("gauge sp").item(0) as HTMLDivElement;
		this._underHpDiv = hpgaugeDiv.getElementsByClassName("param under").item(0) as HTMLDivElement;
		this._underSpDiv = spgaugeDiv.getElementsByClassName("param under").item(0) as HTMLDivElement;
		this._overHpDiv = hpgaugeDiv.getElementsByClassName("param over").item(0) as HTMLDivElement;
		this._overSpDiv = spgaugeDiv.getElementsByClassName("param over").item(0) as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this.exist){
			if(this.chara != null){
				var setWidth = function(elem : HTMLDivElement, rate : number) : void{elem.style.width = Math.max(0, Math.min(80, Math.floor(rate * 81))) + "px";};
				if(this._action == 0){
					// 要素設定
					this._statusDiv.style.opacity = "1";
					this._iconDiv.className = "icon cssimg_chara_icon_" + this.chara.code;
					// 変化後ゲージ描画
					if(this.hprate1 > this.hprate0){setWidth(this._underHpDiv, this.hprate1);}else{setWidth(this._overHpDiv, this.hprate1);}
					if(this.sprate1 > this.sprate0){setWidth(this._underSpDiv, this.sprate1);}else{setWidth(this._overSpDiv, this.sprate1);}
				}

				// HPゲージ描画
				var dhp = this.hprate0 - this.hprate1;
				if(Math.abs(dhp) > 0.01){
					this.hprate0 -= dhp * 0.1;
					if(this.hprate0 >= this.hprate1){setWidth(this._underHpDiv, this.hprate0);}else{setWidth(this._overHpDiv, this.hprate0);}
				}else if(!this._hpDrawn){
					this._hpDrawn = true;
					this.hprate0 = this.hprate1;
					setWidth(this._overHpDiv, this.hprate0);
					setWidth(this._underHpDiv, this.hprate0);
				}

				// SPゲージ描画
				var dsp = this.sprate0 - this.sprate1;
				if(Math.abs(dsp) > 0.01){
					this.sprate0 -= dsp * 0.1;
					if(this.sprate0 >= this.sprate1){setWidth(this._underSpDiv, this.sprate0);}else{setWidth(this._overSpDiv, this.sprate0);}
				}else if(!this._spDrawn){
					this._spDrawn = true;
					this.sprate0 = this.sprate1;
					setWidth(this._overSpDiv, this.sprate0);
					setWidth(this._underSpDiv, this.sprate0);
				}

				// ゲージ描画が終わり、時間が来てたら要素を隠す
				if(this._hpDrawn && this._spDrawn && this._time > 0 && this._action >= this._time){
					this._statusDiv.style.opacity = "0";
					return false;
				}

				this._action++;
				return true;
			}else{
				this._statusDiv.style.opacity = "0";
				return false;
			}
		}else{return false;}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// すごろくプレイヤーステータスゲージクラス
class PECdicePlayerGauge extends PECdiceGauge{
	static var _current : PECdicePlayerGauge;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, chara : DiceCharacter, time : int){
		super(page.div.getElementsByClassName("status player").item(0) as HTMLDivElement, chara, time);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this.hprate0 = this.hprate1 = this.chara.hp / this.chara.maxhp;
		this.sprate0 = this.sprate1 = this.chara.sp / this.chara.maxsp;

		// ゲージの引き継ぎと動作重複禁止
		if(PECdicePlayerGauge._current != null){
			if(this.chara == PECdicePlayerGauge._current.chara){
				this.hprate0 = PECdicePlayerGauge._current.hprate0;
				this.sprate0 = PECdicePlayerGauge._current.sprate0;
			}
			PECdicePlayerGauge._current.exist = false;
		}
		PECdicePlayerGauge._current = this;

		// 同キャラの同時出現禁止
		if(PECdiceEnemyGauge._current != null){
			if(this.chara == PECdiceEnemyGauge._current.chara){
				PECdiceEnemyGauge._current.exist = false;
				PECdiceEnemyGauge._current._statusDiv.style.opacity = "0";
			}
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECdicePlayerGauge._current == this){PECdicePlayerGauge._current = null;}
	}
}

// すごろくエネミーステータスゲージクラス
class PECdiceEnemyGauge extends PECdiceGauge{
	static var _current : PECdiceEnemyGauge;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, chara : DiceCharacter, time : int){
		super(page.div.getElementsByClassName("status enemy").item(0) as HTMLDivElement, chara, time);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this.hprate0 = this.hprate1 = this.chara.hp / this.chara.maxhp;
		this.sprate0 = this.sprate1 = this.chara.sp / this.chara.maxsp;

		// ゲージの引き継ぎと動作重複禁止
		if(PECdiceEnemyGauge._current != null){
			if(this.chara == PECdiceEnemyGauge._current.chara){
				this.hprate0 = PECdiceEnemyGauge._current.hprate0;
				this.sprate0 = PECdiceEnemyGauge._current.sprate0;
			}
			PECdiceEnemyGauge._current.exist = false;
		}
		PECdiceEnemyGauge._current = this;

		// 同キャラの同時出現禁止
		if(PECdicePlayerGauge._current != null){
			if(this.chara == PECdicePlayerGauge._current.chara){
				PECdicePlayerGauge._current.exist = false;
				PECdicePlayerGauge._current._statusDiv.style.opacity = "0";
			}
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECdiceEnemyGauge._current == this){PECdiceEnemyGauge._current = null;}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

