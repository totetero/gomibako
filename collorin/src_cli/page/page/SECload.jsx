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
	var eventPlayer : EventPlayer;
	var _action = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this.eventPlayer = new EventPlayer();
	}

	// ----------------------------------------------------------------
	// 情報読み込みコンストラクタ
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
	override function init() : boolean{
		return true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var exist = this.eventPlayer.calc();
		this._action++;
		// ロード画面表示
		var display = ((exist || this._action < 15) && 5 < this._action) ? "block" : "none";
		if(Page.loadingDiv.style.display != display){Page.loadingDiv.style.display = display;}
		// ロード文字列描画
		if(this._action % 10 == 0){
			switch(this._action / 10 % 4){
				case 0: Page.loadingDiv.setAttribute("txt", "loading"); break;
				case 1: Page.loadingDiv.setAttribute("txt", "loading."); break;
				case 2: Page.loadingDiv.setAttribute("txt", "loading.."); break;
				case 3: Page.loadingDiv.setAttribute("txt", "loading..."); break;
			}
		}
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
	override function init() : boolean{
		if(!this._exist){
			this._exist = true;
			// 情報ロード開始
			Loader.loadxhr(this._url, this._request, function(response : variant) : void{
				// 情報ロード成功
				this._callback(response);
				this._exist = false;
			}, function() : void{
				// 情報ロード失敗
			});
		}
		return true;
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
	override function init() : boolean{
		if(!this._exist){
			this._exist = true;
			// 画像ロード開始
			Loader.loadImg(this._request, function() : void{
				// 画像ロード成功
				this._exist = false;
			}, function():void{
				// 画像ロード失敗
			});
		}
		return true;
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

