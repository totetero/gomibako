import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

/*// 非活性モッククラス
class MockMain{
	static function loadImg(request : Map.<string>, successFunc : function():void) : boolean{return false;}
	static function loadSnd(request : Map.<string>, successFunc : function(buffers:Map.<ArrayBuffer>):void) : boolean{return false;}
	static function loadxhr(url : string, request : variant, successFunc : function(response:variant):void) : boolean{return false;}
}//*/

//*// 活性モッククラス
import "../Loader.jsx";
import "MockDice.jsx";
class MockMain{
	// ----------------------------------------------------------------
	// 画像リクエストエミュレート
	static function loadImg(request : Map.<string>, successFunc : function():void) : boolean{
		if(dom.document.location.protocol != "file:"){return false;}
		
		// 画像ローカルロード
		var count = 0;
		for(var tag in request){count++;}
		if(count > 0){
			for(var tag in request){
				(function(tag : string){
					var url = request[tag].replace(/^\//, "");
					var img = dom.createElement("img") as HTMLImageElement;
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
						if(--count == 0){successFunc();}
					};
					img.onerror = function(e : Event){
						// ローカルにファイルが存在しない場合
						if(--count == 0){successFunc();}
					};
					img.src = url;
				})(tag);
			}
		}else{successFunc();}

		return true;
	}

	// ----------------------------------------------------------------
	// 音楽リクエストエミュレート
	static function loadSnd(request : Map.<string>, successFunc : function(buffers:Map.<ArrayBuffer>):void) : boolean{
		if(dom.document.location.protocol != "file:"){return false;}

		// 基本セット
		request = {
			"bgm_test01": "/snd/bgm/bgm_stagebgm_09_hq",
			"bgm_test02": "/snd/bgm/bgm_stagebgm_07_hq",
			"sef_ok": "/snd/se/se_maoudamashii_system28",
			"sef_ng": "/snd/se/se_maoudamashii_system25"
		};

		// 拡張子追加
		var extension = ".m4a";
		var userAgent = dom.window.navigator.userAgent.toLowerCase();
		if(userAgent.indexOf("firefox") != -1 || userAgent.indexOf("opera") != -1){extension = ".ogg";}
		for(var tag in request){request[tag] += extension;}

		// 音楽ローカルロード
		var count = 0;
		var buffers = {} : Map.<ArrayBuffer>;
		for(var tag in request){count++;}
		if(count > 0){
			for(var tag in request){
				(function(tag : string){
					var url = request[tag].replace(/^\//, "");
					var xhr = new XMLHttpRequest();
					xhr.open("GET", url);
					xhr.responseType = "arraybuffer";
					xhr.onreadystatechange = function(e : Event) : void{
						if(xhr.readyState == 4){
							// リクエスト終了
							if(xhr.status == 0 || xhr.status == 200){
								// リクエスト正常終了
								buffers[tag] = xhr.response as ArrayBuffer;
								if(--count == 0){successFunc(buffers);}
							}else{
								// リクエスト異常終了
								if(--count == 0){successFunc(buffers);}
							}
							xhr = null;
						}
					};
					// chromeなどのlocal cross originで止まられても困るのでtry&catch
					try{xhr.send();}catch(e : Error){log "---- maybe local cross origin ----";}
				})(tag);
			}
		}else{successFunc(null);}

		return true;
	}

	// ----------------------------------------------------------------
	// XMLhttpリクエストエミュレート
	static function loadxhr(url : string, request : variant, successFunc : function(response:variant):void) : boolean{
		if(dom.document.location.protocol != "file:"){return false;}
		
		if(url.indexOf("/mypage") == 0){
			successFunc({"test": "モックマイページ"});
		}else if(url.indexOf("/world") == 0){
			successFunc({"test": "モックワールド"});
		}else if(url.indexOf("/quest/curr") == 0){
			successFunc({"test": "モッククエスト 進行可能"});
		}else if(url.indexOf("/quest/fine") == 0){
			successFunc({"test": "モッククエスト 完了クエスト"});
		}else if(url.indexOf("/chara/team") == 0){
			//successFunc({"test": "モックキャラクタ 編成"});
			successFunc({
				"list":[
					{"name":"test00","code":"player1"},
					{"name":"test01","code":"enemy1"},
				],
				"imgs":{
					"css_icon_player1":"/img/character/player1/icon.png",
					"css_bust_player1":"/img/character/player1/bust.png",
					"css_icon_enemy1":"/img/character/enemy1/icon.png",
					"css_bust_enemy1":"/img/character/enemy1/bust.png"
				}
			});
		}else if(url.indexOf("/chara/supp") == 0){
			//successFunc({"test": "モックキャラクタ 補給"});
			successFunc({
				"list":[
					{"name":"test00","code":"player1"},
					{"name":"test01","code":"enemy1"},
				],
				"imgs":{
					"css_icon_player1":"/img/character/player1/icon.png",
					"css_bust_player1":"/img/character/player1/bust.png",
					"css_icon_enemy1":"/img/character/enemy1/icon.png",
					"css_bust_enemy1":"/img/character/enemy1/bust.png"
				}
			});
		}else if(url.indexOf("/chara/rest") == 0){
			successFunc({"test": "モックキャラクタ 休息"});
		}else if(url.indexOf("/chara/pwup") == 0){
			successFunc({"test": "モックキャラクタ 強化"});
		}else if(url.indexOf("/chara/sell") == 0){
			successFunc({"test": "モックキャラクタ 別れ"});
		}else if(url.indexOf("/item/list") == 0){
			successFunc({"test": "モックアイテム 一覧"});
		}else if(url.indexOf("/item/make") == 0){
			successFunc({"test": "モックアイテム 作成"});
		}else if(url.indexOf("/item/shop") == 0){
			successFunc({"test": "モックアイテム 購入"});
		}else if(url.indexOf("/friend") == 0){
			successFunc({"test": "モック友達"});
		}else if(url.indexOf("/refbook") == 0){
			successFunc({"test": "モック図鑑"});
		}else if(url.indexOf("/setting") == 0){
			successFunc({"test": "モック設定"});
		}else if(url.indexOf("/help") == 0){
			successFunc({"test": "モックヘルプ"});
		}else if(url.indexOf("/dice") == 0){
			//successFunc({"test": "モックすごろく"});
			MockDice.loadxhr(url, request, successFunc);
		}else if(url.indexOf("/chat") == 0){
			successFunc({"test": "モックチャット"});
		}
		return true;
	}
}//*/

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

