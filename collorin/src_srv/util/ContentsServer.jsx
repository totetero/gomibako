import "../require/nodejs.jsx";
import "../require/express.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コンテンツ配信クラス
class ContentsServer{
	static var _key : string;

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, url : string, path : string, key : string) : void{
		ContentsServer._key = key;

		// リクエスト応答
		var addrResp = function(req : ExRequest, res : ExResponse, addrs : Map.<string>, isBin : boolean) : void{
			if(isBin){
				// 音楽ファイル拡張子追加
				var userAgent = (req.headers['user-agent'] as string).toLowerCase();
				var sndExtension = ".m4a";
				if(userAgent.indexOf("firefox") != -1 || userAgent.indexOf("opera") != -1){sndExtension = ".ogg";}
				for(var tag in addrs){
					if(tag.indexOf("bgm_") == 0){addrs[tag] += sndExtension;}
					if(tag.indexOf("sef_") == 0){addrs[tag] += sndExtension;}
				}

				// binaryコンテンツのリクエスト
				new ContentsServer.BinLoader(path, addrs, function(data : Buffer) : void{
					res.setHeader("Content-Type", "application/octet-stream");
					//res.setHeader("cache-control", "no-cache");
					res.send(data);
				});
			}else{
				// base64コンテンツのリクエスト
				new ContentsServer.B64ImageLoader(path, addrs, function(data : string) : void{
					res.setHeader("Content-Type", "application/json");
					//res.setHeader("cache-control", "no-cache");
					res.send(data);
				});
			}
		};

		// GETコンテンツリクエストの処理
		app.get(url, function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var list : string[] = null;
			var addrs : Map.<string> = null;

			switch(req.query["type"] as string){
				case "core":
					list = [
						"/img/system/box/basic.png",
						"/img/system/button/basic/normal.png",
						"/img/system/button/basic/active.png",
						"/img/system/button/basic/select.png",
						"/img/system/button/basic/inactive.png",
						"/img/system/button/ctrlArrow/normal.png",
						"/img/system/button/ctrlArrow/active.png",
						"/img/system/button/ctrlButton/normal.png",
						"/img/system/button/ctrlButton/active.png",
						"/img/system/button/headerTop/normal.png",
						"/img/system/button/headerTop/active.png",
						"/img/system/button/headerMenu/normal.png",
						"/img/system/button/headerMenu/active.png",
						"/img/system/button/headerMypage/normal.png",
						"/img/system/button/headerMypage/active.png",
						"/img/system/button/picker/normal.png",
						"/img/system/button/picker/active.png",
						"/img/system/button/picker/inactive.png",
						"/img/character/player0/dot.png",
					];
					addrs = {
						"mot_human": "/mot/human.json"
					};
					break;
				case "sound":
					addrs = {
						"bgm_test01": "/snd/bgm/bgm_stagebgm_09_hq",
						"bgm_test02": "/snd/bgm/bgm_stagebgm_07_hq",
						"sef_ok": "/snd/se/se_maoudamashii_system28",
						"sef_ng": "/snd/se/se_maoudamashii_system25"
					};
					break;
			}

			if(list != null){
				if(addrs == null){addrs = {} : Map.<string>;}
				for(var i = 0; i < list.length; i++){
					var code = list[i].replace(/\//g, "_");
					code = code.replace(/^_img/, "img");
					code = code.replace(/\.png$/, "");
					addrs[code] = list[i];
				}
			}

			addrResp(req, res, addrs, (req.query["isBin"] as string).toLowerCase() == "true");
		});

		// POSTコンテンツリクエストの処理
		app.post(url, function(req : ExRequest, res : ExResponse, next : function():void) : void{
			if(typeof req.body == "object" && typeof req.body["addrs"] == "object"){
				var addrs = req.body["addrs"] as Map.<string>;

				// アドレスの復号化
				for(var tag in addrs){
					var decipher = crypto.createDecipher("aes192", ContentsServer._key);
					var filename = String.decodeURIComponent(addrs[tag]);
					addrs[tag] = decipher.update(filename, "base64", "ascii") + decipher.final("ascii");
					//addrs[tag] = addrs[tag].replace(/_/g, "/");
				}

				if(addrs != null){
					addrResp(req, res, addrs, req.body["isBin"] as boolean);
				}else{
					// リクエスト無し
					res.setHeader("Content-Type", "application/json");
					//res.setHeader("cache-control", "no-cache");
					res.send(null);
				}
			}else{
				// リクエスト書式異常
				res.status(404).render("404.ejs");
			}
		});
	}

	// ----------------------------------------------------------------
	// アドレスを暗号化
	static function convertAddress(addrs : Map.<string>) : Map.<string>{
		for(var tag in addrs){
			var cipher = crypto.createCipher("aes192", ContentsServer._key);
			var filename = cipher.update(addrs[tag], "ascii", "base64") + cipher.final("base64");
			addrs[tag] = String.encodeURIComponent(filename);
			//addrs[tag] = addrs[tag].replace(/\//g, "_");
		}
		return addrs;
	}

	// ----------------------------------------------------------------
	// base64形式での画像読み込みクラス
	class B64ImageLoader{
		var _imgs = {} : Map.<string>;

		// コンストラクタ
		function constructor(path : string, addrs : Map.<string>, callback : function(data:string):void){
			var tags = new string[];
			for(var tag in addrs){
				if(tag.indexOf("img_") == 0){tags.push(tag);}
				if(tag.indexOf("css_") == 0){tags.push(tag);}
				if(tag.indexOf("mot_") == 0){tags.push(tag);}
			}
			// 画像を読み込む
			var count = tags.length;
			if(count > 0){
				for(var i = 0; i < tags.length; i++){
					this.load(path + addrs[tags[i]], tags[i], function() : void{
						if(--count == 0){
							// すべての読み込みが完了したら送信
							callback(JSON.stringify(this._imgs));
						}
					});
				}
			}else{callback("");}
		}

		// データのロード
		function load(addr : string, tag : string, callback : function():void) : void{
			fs.readFile(addr, function (err : variant, data : Buffer){
				if(!err){
					// 読み込み成功 ファイル形式の確認
					var type = "";
					var cp0 = data.readUInt8(0);
					var cp1 = data.readUInt8(1);
					var cp2 = data.readUInt8(2);
					var cp3 = data.readUInt8(3);
					var cm1 = data.readUInt8(data.length - 1);
					var cm2 = data.readUInt8(data.length - 2);
					if(cp0 == 0x89 && cp1 == 0x50 && cp2 == 0x4e && cp3 == 0x47){type = "data:image/png;base64,";}
					else if(cp0 == 0x47 && cp1 == 0x49 && cp2 == 0x46 && cp3 == 0x38){type = "data:image/gif;base64,";}
					else if(cp0 == 0xff && cp1 == 0xd8 && cm2 == 0xff && cm1 == 0xd9){type = "data:image/jpeg;base64,";}
					if(type != ""){this._imgs[tag] = type + data.toString("base64");}
				}else{
					// 読み込み失敗 TODO なんかデフォルト用意しとく？
				}
				callback();
			});
		}
	}

	// ----------------------------------------------------------------
	// binaryデータの読み込みクラス
	class BinLoader{
		var _tags = {} : Map.<Buffer>;
		var _bins = {} : Map.<Buffer>;
		var _totalLength = 0;

		// コンストラクタ
		function constructor(path : string, addrs : Map.<string>, callback : function(data:Buffer):void){
			var tags = new string[];
			for(var tag in addrs){
				if(tag.indexOf("img_") == 0){tags.push(tag);}
				if(tag.indexOf("css_") == 0){tags.push(tag);}
				if(tag.indexOf("bgm_") == 0){tags.push(tag);}
				if(tag.indexOf("sef_") == 0){tags.push(tag);}
				if(tag.indexOf("mot_") == 0){tags.push(tag);}
			}
			// 情報を読み込む
			var count = tags.length;
			if(count > 0){
				for(var i = 0; i < tags.length; i++){
					this.load(path + addrs[tags[i]], tags[i], function() : void{
						if(--count == 0){
							// すべての読み込みが完了したらバッファをまとめて送信
							var index = 0;
							var data = new Buffer(this._totalLength);
							for(var tag in this._tags){
								// タグ名
								var length = this._tags[tag].length;
								data.writeUInt8(length & 0xff, index++);
								data.writeUInt8((length >> 8) & 0xff, index++);
								data.writeUInt8((length >> 16) & 0xff, index++);
								data.writeUInt8((length >> 24) & 0xff, index++);
								this._tags[tag].copy(data, index, 0, length);
								index += length;
								// バイナリデータ
								var length = this._bins[tag].length;
								data.writeUInt8(length & 0xff, index++);
								data.writeUInt8((length >> 8) & 0xff, index++);
								data.writeUInt8((length >> 16) & 0xff, index++);
								data.writeUInt8((length >> 24) & 0xff, index++);
								this._bins[tag].copy(data, index, 0, length);
								index += length;
							}
							callback(data);
						}
					});
				}
			}else{callback(null);}
		}

		// データのロード
		function load(addr : string, tag : string, callback : function():void) : void{
			fs.readFile(addr, function (err : variant, data : Buffer){
				if(!err){
					// 読み込み成功
					this._tags[tag] = new Buffer(tag, "utf8");
					this._bins[tag] = data;
					this._totalLength += this._tags[tag].length + this._bins[tag].length + 8;
				}else{
					// 読み込み失敗 TODO なんかデフォルト用意しとく？
				}
				callback();
			});
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

