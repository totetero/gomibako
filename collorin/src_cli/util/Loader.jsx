import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 読み込みクラス
class Loader{
	// 画像リスト
	static var imgs = {} : Map.<HTMLImageElement>;
	static var b64s = {} : Map.<string>;
	static var csss = {} : Map.<boolean>;

	// ----------------------------------------------------------------
	// 画像リクエスト送信
	static function loadImg(request : Map.<string>, successFunc : function():void, failureFunc : function():void) : void{
		var url = "/img";

		// 画像重複ロード確認
		var count = 0;
		for(var tag in request){
			var hasImg = ((tag.indexOf("img_") == 0) && Loader.imgs[tag] != null);
			var hasB64 = ((tag.indexOf("b64_") == 0) && Loader.b64s[tag] != null);
			var hasCss = ((tag.indexOf("css_") == 0) && Loader.csss[tag]);
			if(hasImg || hasB64 || hasCss){
				delete request[tag];
			}else{
				count++;
			}
		}

		if(count > 0){
			var isBin = js.eval("dom.window.ArrayBuffer") as boolean;
			// リクエスト開始準備
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type","application/json");
			xhr.responseType = isBin ? "arraybuffer" : "text";
			// リクエスト状態変化関数
			xhr.onreadystatechange = function(e : Event) : void{
				if(xhr.readyState == 4){
					if(xhr.status == 200){
						// リクエスト正常終了
						var ctype = xhr.getResponseHeader("Content-Type").toLowerCase();
						if(ctype.indexOf("application/json") < 0 && ctype.indexOf("application/octet-stream") < 0){
							// リダイレクトっぽい！！
							dom.document.location.href = url;
						}else{
							// 受け取ったデータをbase64形式に変更
							var b64imgs = {} : Map.<string>;
							var count = 0;
							if(isBin){
								var uint8Array = new Uint8Array(xhr.response as ArrayBuffer);
								var index = 0;
								var totalLength = uint8Array.length;
								while(index < totalLength){
									// ファイルのタグ名長さ読み取り
									var len1 = uint8Array[index++];
									var len2 = uint8Array[index++] << 8;
									var len3 = uint8Array[index++] << 16;
									var len4 = uint8Array[index++] << 24;
									var length = len1 + len2 + len3 + len4;
									// タグ名記録
									var tag = "";
									for(var i = 0; i < length; i++){tag += String.fromCharCode(uint8Array[index + i]);}
									index += length;
									// ファイルのバイナリ長さ読み取り
									var len1 = uint8Array[index++];
									var len2 = uint8Array[index++] << 8;
									var len3 = uint8Array[index++] << 16;
									var len4 = uint8Array[index++] << 24;
									var length = len1 + len2 + len3 + len4;
									// ファイル形式の確認
									var type = "";
									var cp0 = uint8Array[index + 0];
									var cp1 = uint8Array[index + 1];
									var cp2 = uint8Array[index + 2];
									var cp3 = uint8Array[index + 3];
									var cm1 = uint8Array[index + length - 1];
									var cm2 = uint8Array[index + length - 2];
									if(cp0 == 0x89 && cp1 == 0x50 && cp2 == 0x4e && cp3 == 0x47){
										type = "data:image/png;base64,";
									}else if(cp0 == 0x47 && cp1 == 0x49 && cp2 == 0x46 && cp3 == 0x38){
										type = "data:image/gif;base64,";
									}else if(cp0 == 0xff && cp1 == 0xd8 && cm2 == 0xff && cm1 == 0xd9){
										type = "data:image/jpeg;base64,";
									}
									if(type != ""){
										var data = "";
										for(var i = 0; i < length; i++){data += String.fromCharCode(uint8Array[index + i]);}
										// base64情報GET!!
										count++;
										b64imgs[tag] = type + dom.window.btoa(data);
									}
									index += length;
								}
							}else{
								// ArrayBuffer非対応！！
								b64imgs = JSON.parse(xhr.responseText) as Map.<string>;
								for(var tag in b64imgs){count++;}
							}

							// base64形式から画像オブジェクト作成
							if(count > 0){
								for(var tag in b64imgs){
									if(tag.indexOf("img_") == 0){
										// canvas用画像
										var img = dom.createElement("img") as HTMLImageElement;
										img.onload = function(e : Event){
											// すべての登録が終わったらコールバック
											if(--count == 0){successFunc();}
										};
										img.src = b64imgs[tag];
										Loader.imgs[tag] = img;
									}else if(tag.indexOf("b64_") == 0){
										// css用画像
										Loader.b64s[tag] = b64imgs[tag];
										if(--count == 0){successFunc();}
									} 
								}
							}else{
								successFunc();
							}
						}
					}else{
						// リクエスト異常終了
						log "error " + xhr.status;
						failureFunc();
					}
					xhr = null;
				}
			};
			// 通信開始
			xhr.send(JSON.stringify({
				isBin: isBin,
				urls: request
			}));
		}else{
			// 読み込むものが無い
			successFunc();
		}
	}

	// ----------------------------------------------------------------
	// 音楽リクエスト送信
	static function loadSnd(request : Map.<string>, successFunc : function(buffers:Map.<ArrayBuffer>):void, failureFunc : function():void) : void{
		var url = "/snd";

		// リクエスト開始準備
		var xhr = new XMLHttpRequest();
		if(request != null){xhr.open("POST", url, true);}else{xhr.open("GET", url, true);}
		xhr.setRequestHeader("Content-Type","application/json");
		xhr.responseType = "arraybuffer";
		// リクエスト状態変化関数
		xhr.onreadystatechange = function(e : Event) : void{
			if(xhr.readyState == 4){
				if(xhr.status == 200){
					// リクエスト正常終了
					var ctype = xhr.getResponseHeader("Content-Type").toLowerCase();
					if(ctype.indexOf("application/json") < 0 && ctype.indexOf("application/octet-stream") < 0){
						// リダイレクトっぽい！！
						dom.document.location.href = url;
					}else{
						// 受け取ったデータを処理
						var buffer = xhr.response as ArrayBuffer;
						var uint8Array = new Uint8Array(buffer);
						var buffers = {} : Map.<ArrayBuffer>;
						var index = 0;
						var totalLength = uint8Array.length;
						while(index < totalLength){
							// ファイルのタグ名長さ読み取り
							var len1 = uint8Array[index++];
							var len2 = uint8Array[index++] << 8;
							var len3 = uint8Array[index++] << 16;
							var len4 = uint8Array[index++] << 24;
							var length = len1 + len2 + len3 + len4;
							// タグ名記録
							var tag = "";
							for(var i = 0; i < length; i++){tag += String.fromCharCode(uint8Array[index + i]);}
							index += length;
							// ファイルのバイナリ長さ読み取り
							var len1 = uint8Array[index++];
							var len2 = uint8Array[index++] << 8;
							var len3 = uint8Array[index++] << 16;
							var len4 = uint8Array[index++] << 24;
							var length = len1 + len2 + len3 + len4;
							// バイナリ記録
							buffers[tag] = buffer.slice(index, index + length);
							index += length;
						}
						successFunc(buffers);
					}
				}else{
					// リクエスト異常終了
					log "error " + xhr.status;
					failureFunc();
				}
				xhr = null;
			}
		};
		// 通信開始
		xhr.send(JSON.stringify({
			urls: request
		}));
	}

	// ----------------------------------------------------------------
	// XMLhttpリクエスト送信
	static function loadxhr(url : string, request : variant, successFunc : function(response:variant):void, failureFunc : function():void) : void{
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
					var ctype = xhr.getResponseHeader("Content-Type").toLowerCase();
					if(ctype.indexOf("application/json") < 0){
						// リダイレクトっぽい！！
						dom.document.location.href = url;
					}else{
						successFunc(JSON.parse(xhr.responseText));
					}
				}else{
					// リクエスト異常終了
					log "error " + xhr.status;
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

