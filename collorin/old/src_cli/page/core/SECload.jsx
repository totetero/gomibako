import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Util.jsx";

import "Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 読み込み元締めクラス
class SECload extends EventCartridge{
	static var _div : HTMLDivElement;
	var eventPlayer : EventPlayer;
	var _action = 0;

	// ----------------------------------------------------------------
	// ロード画面表示
	static function loading(isDisplay : boolean, action : int) : void{
		var display = isDisplay ? "block" : "none";
		if(SECload._div.style.display != display){SECload._div.style.display = display;}

		if(isDisplay){
			// ロード文字列描画
			if(action % 10 == 0){
				switch(action / 10 % 4){
					case 0: SECload._div.setAttribute("txt", "loading"); break;
					case 1: SECload._div.setAttribute("txt", "loading."); break;
					case 2: SECload._div.setAttribute("txt", "loading.."); break;
					case 3: SECload._div.setAttribute("txt", "loading..."); break;
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// コンストラクタ 様々なロードに対応できるようにイベントプレイヤー式
	function constructor(){
		this.eventPlayer = new EventPlayer();
		if(SECload._div == null){SECload._div = dom.document.getElementById("loading") as HTMLDivElement;}
	}

	// ----------------------------------------------------------------
	// 基本情報読み込みコンストラクタ
	function constructor(url : string, request : variant, callback : function(response:variant):void){
		this();
		this.eventPlayer.serialPush(new ECloadInfo(url, request, function(response : variant) : void{
			this.eventPlayer.serialPush(new ECloadImgs(response["imgs"] as Map.<string>));
			this.eventPlayer.serialPush(new ECone(function() : void{
				callback(response);
			}));
		}));
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._action++;
		var exist = this.eventPlayer.calc();
		var display = (5 < this._action && (this._action < 15 || exist));
		SECload.loading(display, this._action);
		return (exist || (5 < this._action && this._action < 15));
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 情報読み込みクラス
class ECloadInfo extends EventCartridge{
	var _exist = false;
	var _url : string;
	var _request : variant;
	var _callback : function(response:variant):void;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(url : string, request : variant, callback : function(response:variant):void){
		this._url = url;
		this._request = request;
		this._callback = callback;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		if(!this._exist){
			this._exist = true;
			// 情報ロード開始
			Loader.loadxhr(this._url, this._request, function(response : variant) : void{
				// 情報ロード成功
				this._callback(response);
				this._exist = false;
			});
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		return this._exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// 画像読み込みクラス
class ECloadImgs extends EventCartridge{
	var _exist = false;
	var _request : Map.<string>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(request : Map.<string>){
		this._request = request;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		if(!this._exist){
			this._exist = true;
			// 画像ロード開始
			Loader.loadContents(this._request, function() : void{
				// 画像ロード成功
				this._exist = false;
			});
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		return this._exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

