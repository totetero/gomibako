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
		// 画像重複ロード確認
		var count = 0;
		for(var tag in request){
			var isBase64 = (tag.indexOf("b64_") == 0);
			if(isBase64 && Loader.b64imgs[tag.substring(4)] != null){
				delete request[tag];
			}else if(!isBase64 && Loader.imgs[tag] != null){
				delete request[tag];
			}else{
				count++;
			}
		}

		if(count > 0){
			// リクエスト開始準備
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "/img", true);
			xhr.setRequestHeader("Content-Type","application/json");
			xhr.responseType = "arraybuffer";
			// リクエスト完了後の後片付け処理
			var callback = function(err : string) : void{
				if(err == ""){
					successFunc();
				}else{
					log err;
					failureFunc();
				}
				xhr = null;
			};
			xhr.onreadystatechange = function(e : Event) : void{
				if(xhr.readyState == 4){
					if(xhr.status == 200){
						// リクエスト正常終了 受け取ったバイナリをbase64形式に変更
						var b64imgs = {} : Map.<string>;
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
									if(--count == 0){callback("");}
								}else{
									// canvas用画像
									var img = dom.createElement("img") as HTMLImageElement;
									img.onload = function(e : Event){
										// すべての登録が終わったらコールバック
										if(--count == 0){callback("");}
									};
									img.src = b64imgs[tag];
									Loader.imgs[tag] = img;
								}
							}
						}else{
							callback("");
						}
					}else{
						// リクエスト異常終了
						callback("error");
					}
				}
			};
			// 通信開始
			xhr.send(JSON.stringify(request));
		}else{
			// 読み込むものが無い
			successFunc();
		}
	}

	// ----------------------------------------------------------------
	// XMLhttpリクエスト送信
	static function loadxhr(url : string, request : variant, successFunc : function(:variant):void, failureFunc : function():void) : void{
		// リクエスト開始準備
		var xhr = new XMLHttpRequest();
		if(request != null){xhr.open("POST", url, true);}else{xhr.open("GET", url, true);}
		xhr.setRequestHeader("Content-Type","application/json");
		xhr.responseType = "text";
		xhr.onreadystatechange = function(e : Event) : void{
			if(xhr.readyState == 4){
				// リクエスト終了
				if(xhr.status == 200){
					// リクエスト正常終了
					var resp = JSON.parse(xhr.responseText);
					if(resp["redirect"]){
						dom.document.location.href = resp["redirect"] as string;
					}else{
						successFunc(resp);
					}
				}else{
					// リクエスト異常終了
					log err;
					failureFunc();
				}
				xhr = null;
			}
		};
		// 通信開始
		xhr.send(JSON.stringify(request));
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

