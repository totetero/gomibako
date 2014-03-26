import "js/web.jsx";

import "../../util/EventCartridge.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくステータスゲージクラス
abstract class PECdiceGauge extends EventCartridge{
	static var _current : PECdiceGauge;
	var _page : DicePage;
	var _chara : DiceCharacter;
	var _time : int;
	var _action : int = 0;
	var _exist = true;

	// ステータスゲージ要素
	var _statusDiv : HTMLDivElement;
	var _iconDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, chara : DiceCharacter, time : int){
		this._page = page;
		this._chara = chara;
		this._time = time;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._exist){
			if(this._action == 0){
				// 要素設定
				if(this._chara != null){
					this._statusDiv.style.opacity = "1";
					this._iconDiv.className = "icon cssimg_icon_" + this._chara.code;
				}else{
					this._statusDiv.style.opacity = "0";
				}
			}
			if(this._chara != null && this._time > 0){
				// 時間が来たら要素を隠す
				if(this._action++ < this._time){
					return true;
				}else{
					this._statusDiv.style.opacity = "0";
					return false;
				}
			}else{
				return false;
			}
		}else{return false;}
	}
}

// すごろくプレイヤーステータスゲージクラス
class PECdicePlayerGauge extends PECdiceGauge{
	static var _current : PECdicePlayerGauge;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, chara : DiceCharacter, time : int){
		super(page, chara, time);
		// DOM獲得
		this._statusDiv = page.div.getElementsByClassName("status player").item(0) as HTMLDivElement;
		this._iconDiv = this._statusDiv.getElementsByClassName("icon").item(0) as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 動作重複禁止
		if(PECdicePlayerGauge._current != null){PECdicePlayerGauge._current._exist = false;}
		PECdicePlayerGauge._current = this;
		return true;
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
		super(page, chara, time);
		// DOM獲得
		this._statusDiv = page.div.getElementsByClassName("status enemy").item(0) as HTMLDivElement;
		this._iconDiv = this._statusDiv.getElementsByClassName("icon").item(0) as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 動作重複禁止
		if(PECdiceEnemyGauge._current != null){PECdiceEnemyGauge._current._exist = false;}
		PECdiceEnemyGauge._current = this;
		return true;
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

