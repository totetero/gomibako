import "js.jsx";
import "js/web.jsx";

// キャラクター描画情報クラス TODO 一旦ここにおいておく
class DrawCharacterMotion{
	var parts : Map.<number[][]>;
	var pose : Map.<Map.<number[]>[]>;
	// コンストラクタ
	function constructor(dat : variant) {
		this.parts  = dat["parts"] as Map.<number[][]>;
		this.pose  = dat["pose"] as Map.<Map.<number[]>[]>;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 読み込みクラス
class Loader{
	// 画像リスト
	static var imgs = {} : Map.<HTMLImageElement>;
	// スタイル情報
	static var csss = new string[];
	static var style : HTMLStyleElement;
	// サウンドリスト
	static var snds = {} : Map.<AudioBuffer>;
	// モーションリスト
	static var mots = {} : Map.<DrawCharacterMotion>;

	// サウンドバッファ作成用コンテキスト 外部で登録する
	static var soundContext : AudioContext;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// スタイルシート準備
		Loader.style = dom.document.createElement("style") as HTMLStyleElement;
		Loader.style.type = "text/css";
		dom.document.head.appendChild(Loader.style);
	}

	// ----------------------------------------------------------------
	// XMLhttpリクエスト送信
	static function loadxhr(url : string, request : variant, callback : function(response:variant):void) : void{
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
						callback(JSON.parse(xhr.responseText));
					}
				}else{
					// リクエスト異常終了
					log "error " + xhr.status;
					// TODO 失敗時の処理
				}
				xhr = null;
			}
		};
		// 通信開始
		if(request != null){xhr.send(JSON.stringify(request));}
		else{xhr.send("");}
	}

	// ----------------------------------------------------------------
	// コンテンツリクエスト送信
	static function loadContents(request : Map.<string>, callback : function():void) : void{Loader._loadContents("", request, callback);}
	static function loadContents(type : string, callback : function():void) : void{Loader._loadContents(type, null, callback);}
	static function _loadContents(type : string, request : Map.<string>, callback : function():void) : void{
		var url = "/contents";

		// ロード確認
		var isLoad = false;
		if(request != null){
			// POSTリクエスト 重複ロードは阻止
			for(var tag in request){
				var hasImg = ((tag.indexOf("img_") == 0) && Loader.imgs[tag] != null);
				var hasCss = false; if(tag.indexOf("css_") == 0){for(var i = 0; i < Loader.csss.length; i++){if(Loader.csss[i] == tag){hasCss = true; break;}}}
				var hasBgm = ((tag.indexOf("bgm_") == 0) && Loader.snds[tag] != null);
				var hasSef = ((tag.indexOf("sef_") == 0) && Loader.snds[tag] != null);
				var hasMot = ((tag.indexOf("mot_") == 0) && Loader.mots[tag] != null);
				if(hasImg || hasCss || hasBgm || hasSef || hasMot){delete request[tag];}
				else{isLoad = true;}
			}
		}else if(type != ""){
			// GETリクエスト キャッシュに期待して必ず通信
			isLoad = true;
		}

		if(isLoad){
			// ArrayBuffer対応確認
			var isBin = js.eval("!!dom.window.ArrayBuffer") as boolean;
			// リクエスト開始準備
			var xhr = new XMLHttpRequest();
			if(request == null){url += "?type=" + type + "&isBin=" + isBin as string;}
			if(request != null){xhr.open("POST", url, true);}else{xhr.open("GET", url, true);}
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
							// 受け取ったデータを処理
							var b64Imgs = {} : Map.<string>;
							var cssImgs = {} : Map.<string>;
							var sndBufs = {} : Map.<ArrayBuffer>;
							var count = 0;
							if(xhr.response == null){
							}else if(isBin){
								var buffers = Loader._buffer2map(xhr.response as ArrayBuffer);
								for(var tag in buffers){
									if(tag.indexOf("img_") == 0){
										// 画像バッファをbase64画像に変換して記録
										var b64Data = Loader._createB64(buffers[tag]);
										if(b64Data != ""){
											count++;
											b64Imgs[tag] = b64Data;
										}
									}else if(tag.indexOf("css_") == 0){
										// 画像バッファをbase64画像に変換して記録
										var b64Data = Loader._createB64(buffers[tag]);
										if(b64Data != ""){cssImgs[tag] = b64Data;}
									}else if(tag.indexOf("bgm_") == 0 || tag.indexOf("sef_") == 0){
										// 音楽バッファを記録
										count++;
										sndBufs[tag] = buffers[tag];
									}else if(tag.indexOf("mot_") == 0){
										// モーションバッファをモーションデータに変換して記録
										var uint8Array = new Uint8Array(buffers[tag]);
										var data = "";
										for(var i = 0; i < uint8Array.length; i++){data += String.fromCharCode(uint8Array[i]);}
										Loader.mots[tag] = new DrawCharacterMotion(JSON.parse(data));
									}
								}
							}else{
								// ArrayBuffer非対応！！
								var strs = JSON.parse(xhr.responseText) as Map.<string>;
								for(var tag in strs){
									if(tag.indexOf("img_") == 0){
										count++;
										b64Imgs[tag] = strs[tag];
									}else if(tag.indexOf("css_") == 0){
										cssImgs[tag] = strs[tag];
									}else if(tag.indexOf("mot_") == 0){
										Loader.mots[tag] = new DrawCharacterMotion(JSON.parse(strs[tag]));
									}
								}
							}

							// css画像登録
							var sheet = Loader.style.sheet as CSSStyleSheet;
							for(var tag in cssImgs){
								Loader.csss.push(tag);
								sheet.insertRule("." + tag.replace(/^css_/, "cssimg_") + "{background-image: url(" + cssImgs[tag] + ")}", sheet.cssRules.length);
							}

							if(count > 0){
								// base64画像から画像オブジェクト作成と登録
								for(var tag in b64Imgs){
									Loader._createImg(b64Imgs[tag], tag, function() : void{
										// すべての登録が終わったらコールバック
										if(--count == 0){callback();}
									});
								}
								// バッファをサウンドバッファに変換と登録
								for(var tag in sndBufs){
									Loader._createSnd(sndBufs[tag], tag, function() : void{
										// すべての登録が終わったらコールバック
										if(--count == 0){callback();}
									});
								}
							}else{
								// 処理を遅延させる必要が無ければコールバック
								callback();
							}
						}
					}else{
						// リクエスト異常終了
						log "error " + xhr.status;
						// TODO 失敗時の処理
					}
					xhr = null;
				}
			};
			// 通信開始
			if(request != null){
				xhr.send(JSON.stringify({
					isBin: isBin,
					addrs: request
				}));
			}else{xhr.send("");}
		}else{
			// ロードの必要がなければスキップ
			callback();
		}
	}

	// ----------------------------------------------------------------
	// バッファを分割
	static function _buffer2map(buffer : ArrayBuffer) : Map.<ArrayBuffer>{
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
			if(js.eval("!!buffer.slice") as boolean){
				buffers[tag] = buffer.slice(index, index + length);
			}else{
				var newBuf = new ArrayBuffer(length);
				var newArr = new Uint8Array(newBuf);
				for(var i = 0; i < length; i++){newArr[i] = uint8Array[index + i];}
				buffers[tag] = newBuf;
			}
			index += length;
		}
		return buffers;
	}

	// ----------------------------------------------------------------
	// バッファからbase64画像作成
	static function _createB64(buffer : ArrayBuffer) : string{
		var uint8Array = new Uint8Array(buffer);
		var cp0 = uint8Array[0];
		var cp1 = uint8Array[1];
		var cp2 = uint8Array[2];
		var cp3 = uint8Array[3];
		var cm1 = uint8Array[uint8Array.length - 1];
		var cm2 = uint8Array[uint8Array.length - 2];
		var type = "";
		if(cp0 == 0x89 && cp1 == 0x50 && cp2 == 0x4e && cp3 == 0x47){type = "data:image/png;base64,";}
		if(cp0 == 0x47 && cp1 == 0x49 && cp2 == 0x46 && cp3 == 0x38){type = "data:image/gif;base64,";}
		if(cp0 == 0xff && cp1 == 0xd8 && cm2 == 0xff && cm1 == 0xd9){type = "data:image/jpeg;base64,";}
		if(type != ""){
			var data = "";
			for(var i = 0; i < uint8Array.length; i++){data += String.fromCharCode(uint8Array[i]);}
			return type + dom.window.btoa(data);
		}
		return "";
	}

	// ----------------------------------------------------------------
	// base64画像から画像オブジェクト作成と登録
	static function _createImg(b64img : string, tag : string, callback : function():void) : void{
		var img = dom.createElement("img") as HTMLImageElement;
		img.onload = function(e : Event){callback();};
		img.src = b64img;
		Loader.imgs[tag] = img;
	}

	// ----------------------------------------------------------------
	// バッファをサウンドバッファに変換と登録
	static function _createSnd(sndBuf : ArrayBuffer, tag : string, callback : function():void) : void{
		if(Loader.soundContext != null){
			Loader.soundContext.decodeAudioData(sndBuf, function(buffer : AudioBuffer){
				Loader.snds[tag] = buffer;
				callback();
			});
		}else{callback();}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

