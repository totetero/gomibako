import "js.jsx";
import "js/web.jsx";

import "mock/MockServer.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 読み込みクラス
class Loader{
	// 画像リスト
	static var imgs = {} : Map.<HTMLImageElement>;
	static var csss = {} : Map.<string>;
	static var style : HTMLStyleElement;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// スタイルシート準備
		Loader.style = dom.document.createElement("style") as HTMLStyleElement;
		Loader.style.type = "text/css";
		dom.document.head.appendChild(Loader.style);
	}

	// ----------------------------------------------------------------
	// 画像リクエスト送信
	static function loadImg(request : Map.<string>, successFunc : function():void, failureFunc : function():void) : void{
		var localUrl = true ? "" : "file:///android_asset/imgCrypt";
		var networkUrl = "/img";

		// 画像重複ロード防止と数の確認
		var countUrl = function() : int{
			var count = 0;
			for(var tag in request){
				var hasImg = ((tag.indexOf("img_") == 0) && Loader.imgs[tag] != null);
				var hasCss = ((tag.indexOf("css_") == 0) && Loader.csss[tag] != null);
				if(hasImg || hasCss){
					delete request[tag];
				}else{
					count++;
				}
			}
			return count;
		};

		// ローカルから画像をとる ネイティブ用
		var loadLocal = function(callback : function():void) : void{
			// ローカルアドレスが無ければスキップ
			if(localUrl == ""){callback(); return;}
			// 数を数えてロードの必要がなければスキップ
			var count = countUrl();
			if(count <= 0){callback(); return;}
			// 画像ローカルロード
			for(var tag in request){
				(function(tag : string, url : string, img : HTMLImageElement){
					img.onload = function(e : Event){
						// ローカルにファイルがみつかった場合
						if(tag.indexOf("img_") == 0){
							// canvas用画像
							Loader.imgs[tag] = img;
						}else if(tag.indexOf("css_") == 0){
							// css用画像
							var sheet = Loader.style.sheet as CSSStyleSheet;
							Loader.csss[tag] = tag.replace(/^css_/, "cssimg_");
							sheet.insertRule("." + Loader.csss[tag] + "{background-image: url(" + url + ")}", sheet.cssRules.length);
						}
						if(--count == 0){callback();}
					};
					img.onerror = function(e : Event){
						// ローカルにファイルが存在しない場合
						if(--count == 0){callback();}
					};
					img.src = url;
				})(tag, localUrl + "/" + request[tag], dom.createElement("img") as HTMLImageElement);
			}
		};

		// ネットワークから画像をとる
		var loadNetwork = function(callback : function():void) : void{
			// 数を数えてロードの必要がなければスキップ
			var count = countUrl();
			if(count <= 0){callback(); return;}
			// ArrayBuffer対応確認
			var isBin = js.eval("!!dom.window.ArrayBuffer") as boolean;
			// リクエスト開始準備
			var xhr = new XMLHttpRequest();
			xhr.open("POST", networkUrl, true);
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
							dom.document.location.href = networkUrl;
						}else{
							// 受け取ったデータを処理
							var b64imgs = {} : Map.<string>;
							var count = 0;
							if(isBin){
								// 受け取ったデータをbase64形式に変更
								var buffer = xhr.response as ArrayBuffer;
								var buffers = Loader._buffer2buffers(buffer);
								for(var tag in buffers){
									var uint8Array = new Uint8Array(buffers[tag]);
									// ファイル形式の確認
									var type = "";
									var cp0 = uint8Array[0];
									var cp1 = uint8Array[1];
									var cp2 = uint8Array[2];
									var cp3 = uint8Array[3];
									var cm1 = uint8Array[uint8Array.length - 1];
									var cm2 = uint8Array[uint8Array.length - 2];
									if(cp0 == 0x89 && cp1 == 0x50 && cp2 == 0x4e && cp3 == 0x47){
										type = "data:image/png;base64,";
									}else if(cp0 == 0x47 && cp1 == 0x49 && cp2 == 0x46 && cp3 == 0x38){
										type = "data:image/gif;base64,";
									}else if(cp0 == 0xff && cp1 == 0xd8 && cm2 == 0xff && cm1 == 0xd9){
										type = "data:image/jpeg;base64,";
									}
									if(type != ""){
										var data = "";
										for(var i = 0; i < uint8Array.length; i++){data += String.fromCharCode(uint8Array[i]);}
										// base64情報GET!!
										count++;
										b64imgs[tag] = type + dom.window.btoa(data);
									}
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
											if(--count == 0){callback();}
										};
										img.src = b64imgs[tag];
										Loader.imgs[tag] = img;
									}else if(tag.indexOf("css_") == 0){
										// css用画像
										var sheet = Loader.style.sheet as CSSStyleSheet;
										Loader.csss[tag] = tag.replace(/^css_/, "cssimg_");
										sheet.insertRule("." + Loader.csss[tag] + "{background-image: url(" + b64imgs[tag] + ")}", sheet.cssRules.length);
										if(--count == 0){callback();}
									} 
								}
							}else{
								callback();
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
		};

		// ローカルでの存在を確認し、無ければネットワークからとってくる
		loadLocal(function() : void{
			loadNetwork(successFunc);
		});
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
						var buffers = Loader._buffer2buffers(buffer);
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
		// モックサーバ処理
		var response = MockServer.loadxhr(url, request);
		if(response != null){successFunc(response); return;}

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

	// ----------------------------------------------------------------
	// バッファを分割
	static function _buffer2buffers(buffer : ArrayBuffer) : Map.<ArrayBuffer>{
		var uint8Array = new Uint8Array(buffer);
		var buffers = {} : Map.<ArrayBuffer>;
		var index = 0;
		while(index < uint8Array.length){
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
		return buffers;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

