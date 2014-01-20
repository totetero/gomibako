import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Loader{
	// 画像リスト
	static var imgs : Map.<HTMLImageElement>;
	static var b64imgs : Map.<string>;

	// ----------------------------------------------------------------
	// base64情報配列から画像登録
	static function regImg(b64imgs : Map.<string>, callback : function():void) : void{
		var count = 0;
		for(var i in b64imgs){count++;}
		if(count > 0){
			for(var i in b64imgs){
				if(i.search(/^b64_/) == 0){
					// css用画像
					Loader.b64imgs[i.substring(4)] = b64imgs[i];
					if(--count == 0){callback();}
				}else{
					// canvas用画像
					var img = dom.createElement("img") as HTMLImageElement;
					img.onload = function(e : Event){
						// すべての登録が終わったらコールバック
						if(--count == 0){callback();}
					};
					img.src = b64imgs[i];
					Loader.imgs[i] = img;
				}
			}
		}else{
			callback();
		}
	}

	// ----------------------------------------------------------------
	// XMLhttpリクエスト送信
	static function loadxhr(url : string, request : string, successFunc : function(:string):void, failureFunc : function():void) : void{
		// リクエスト開始準備
		var xhr = new XMLHttpRequest();
		if(request != ""){xhr.open("POST", url, true);}else{xhr.open("GET", url, true);}
		// リクエスト正常終了
		xhr.addEventListener("load", function(e : Event) : void{successFunc(xhr.responseText);});
		// リクエスト失敗
		xhr.addEventListener("abort", function(e : Event) : void{log "abort"; failureFunc();});
		xhr.addEventListener("error", function(e : Event) : void{log "error"; failureFunc();});
		xhr.addEventListener("timeout", function(e : Event) : void{log "timeout"; failureFunc();});
		// 通信開始
		xhr.send(request);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

