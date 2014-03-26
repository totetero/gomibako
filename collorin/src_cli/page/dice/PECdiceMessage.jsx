import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Util.jsx";

import "DicePage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくメッセージクラス
class PECdiceMessage extends EventCartridge{
	static const hide = -160;
	static var _current : PECdiceMessage;
	static var _position = PECdiceMessage.hide;
	var _page : DicePage;
	var _message : string;
	var _force : boolean;
	var _time : int;
	var _action : int = 0;
	var _exist = true;

	// メッセージ要素
	var _messageDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, message : string, force : boolean, time : int){
		this._page = page;
		this._message = message;
		this._force = force;
		this._time = time;
		// DOM獲得
		this._messageDiv = page.div.getElementsByClassName("message").item(0) as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 動作重複禁止
		if(PECdiceMessage._current != null){PECdiceMessage._current._exist = false;}
		PECdiceMessage._current = this;
		// 位置設定
		if(this._force){PECdiceMessage._position = PECdiceMessage.hide;}
		return true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._exist){
			if(this._message == ""){
				PECdiceMessage._position = PECdiceMessage.hide;
				this._messageDiv.style.opacity = "0";
				return false;
			}else{
				if(this._action == 0){this._messageDiv.innerHTML = this._message;}
				if(this._action++ < this._time || this._time < 0){
					var dpos = PECdiceMessage._position - 0;
					if(Math.abs(dpos) > 0.01){
						PECdiceMessage._position -= dpos * 0.2;
						Util.cssTranslate(this._messageDiv, 0, PECdiceMessage._position);
						this._messageDiv.style.opacity = (1 - PECdiceMessage._position / PECdiceMessage.hide) as string;
					}else if(this._time < 0){return false;}
					return true;
				}else{
					PECdiceMessage._position = PECdiceMessage.hide;
					this._messageDiv.style.opacity = "0";
					return false;
				}
			}
		}else{return false;}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECdiceMessage._current == this){PECdiceMessage._current = null;}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

