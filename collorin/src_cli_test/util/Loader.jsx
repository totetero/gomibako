import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Loader{
	// 画像リスト
	static var imgs = {} : Map.<HTMLImageElement>;
	static var b64imgs = {} : Map.<string>;

	// ----------------------------------------------------------------
	// 画像リクエスト送信
	static function loadImg(request : Map.<string>, successFunc : function():void, failureFunc : function():void) : void{
		var b64imgs = {} : Map.<string>;

		// 画像重複ロード確認
		for(var tag in request){
			if(tag.indexOf("b64_") == 0){
				if(Loader.b64imgs[tag.substring(4)] != null){
					delete request[tag];
				}
			}else{
				if(Loader.imgs[tag] != null){
					delete request[tag];
				}
			}
		}
		
		// リクエスト開始準備
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/img", true);
		xhr.setRequestHeader("Content-Type","application/json");
		xhr.responseType = "arraybuffer";
		// リクエスト正常終了
		xhr.addEventListener("load", function(e : Event) : void{
			if(xhr.readyState == 4){
				if(xhr.status == 200){
					// 受け取ったバイナリをbase64形式に変更
					var uInt8Array = new Uint8Array(xhr.response as ArrayBuffer);
					var index = 0;
					var count = 0;
					var totalLength = uInt8Array.length;
					while(index < totalLength){
						var len1 = uInt8Array[index++];
						var len2 = uInt8Array[index++] << 8;
						var len3 = uInt8Array[index++] << 16;
						var len4 = uInt8Array[index++] << 24;
						var length = len1 + len2 + len3 + len4;
						var tag = "";
						for(var i = 0; i < length; i++){tag += String.fromCharCode(uInt8Array[index + i]);}
						index += length;
						var len1 = uInt8Array[index++];
						var len2 = uInt8Array[index++] << 8;
						var len3 = uInt8Array[index++] << 16;
						var len4 = uInt8Array[index++] << 24;
						var length = len1 + len2 + len3 + len4;
						var data = "";
						for(var i = 0; i < length; i++){data += String.fromCharCode(uInt8Array[index + i]);}
						index += length;

						// base64情報GET!!
						count++;
						b64imgs[tag] = "data:image/png;base64," + dom.window.btoa(data);
					}

					// base64形式から画像オブジェクト作成
					if(count > 0){
						for(var tag in b64imgs){
							if(tag.indexOf("b64_") == 0){
								// css用画像
								Loader.b64imgs[tag.substring(4)] = b64imgs[tag];
								if(--count == 0){successFunc();}
							}else{
								// canvas用画像
								var img = dom.createElement("img") as HTMLImageElement;
								img.onload = function(e : Event){
									// すべての登録が終わったらコールバック
									if(--count == 0){successFunc();}
								};
								img.src = b64imgs[tag];
								Loader.imgs[tag] = img;
							}
						}
					}else{
						successFunc();
					}
				}
			}else{
				log "server error";
				failureFunc();
			}
		});
		// リクエスト失敗
		xhr.addEventListener("abort", function(e : Event) : void{log "abort"; failureFunc();});
		xhr.addEventListener("error", function(e : Event) : void{log "error"; failureFunc();});
		xhr.addEventListener("timeout", function(e : Event) : void{log "timeout"; failureFunc();});
		// 通信開始
		xhr.send(JSON.stringify(request));
	}

	// ----------------------------------------------------------------
	// XMLhttpリクエスト送信
	static function loadxhr(url : string, request : variant, successFunc : function(:string):void, failureFunc : function():void) : void{
		// リクエスト開始準備
		var xhr = new XMLHttpRequest();
		if(request != null){xhr.open("POST", url, true);}else{xhr.open("GET", url, true);}
		xhr.setRequestHeader("Content-Type","application/json");
		// リクエスト正常終了
		xhr.addEventListener("load", function(e : Event) : void{successFunc(xhr.responseText);});
		// リクエスト失敗
		xhr.addEventListener("abort", function(e : Event) : void{log "abort"; failureFunc();});
		xhr.addEventListener("error", function(e : Event) : void{log "error"; failureFunc();});
		xhr.addEventListener("timeout", function(e : Event) : void{log "timeout"; failureFunc();});
		// 通信開始
		xhr.send(JSON.stringify(request));
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

