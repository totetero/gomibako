import "../require/nodejs.jsx";
import "../require/express.jsx";

// 音楽配信クラス
class SoundServer{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, url : string, path : string) : void{
		// urlリクエスト応答
		var urlResp = function(req : ExRequest, res : ExResponse, urls : Map.<string>) : void{
			if(urls != null){
				// 拡張子追加
				var extension = ".m4a";
				var userAgent = (req.headers['user-agent'] as string).toLowerCase();
				if(userAgent.indexOf("firefox") != -1 || userAgent.indexOf("opera") != -1){extension = ".ogg";}
				for(var tag in urls){urls[tag] += extension;}

				// binary音楽のリクエスト
				new SoundServer.soundLoaderBin(path, urls, function(data : Buffer) : void{
					res.contentType("application/octet-stream").send(data);
				});
			}else{
				// リクエスト無し
				res.contentType("application/json").send(null);
			}
		};

		// GET音楽リクエストの処理
		app.get(url, function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var urls : Map.<string> = null;

			// 基本セット
			urls = {
				"bgm_test01": "/snd/bgm/bgm_stagebgm_09_hq",
				"bgm_test02": "/snd/bgm/bgm_stagebgm_07_hq",
				"sef_ok": "/snd/se/se_maoudamashii_system28",
				"sef_ng": "/snd/se/se_maoudamashii_system25"
			};

			urlResp(req, res, urls);
		});

		// POST音楽リクエストの処理
		app.post(url, function(req : ExRequest, res : ExResponse, next : function():void) : void{
			if(typeof req.body == "object" && typeof req.body["urls"] == "object"){
				var urls = req.body["urls"] as Map.<string>;

				urlResp(req, res, urls);
			}else{
				// リクエスト書式異常
				res.status(404).render("404.ejs", null);
			}
		});

		// GETとPOST以外のリクエストは404
		app.all(url + "/*", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.status(404).render("404.ejs", null);
		});
	}

	// ----------------------------------------------------------------
	// binaryデータでの画像読み込みクラス
	class soundLoaderBin{
		var _count : int;
		var _callback : function(data:Buffer):void;
		var _tags = {} : Map.<Buffer>;
		var _snds = {} : Map.<Buffer>;
		var _totalLength = 0;

		// コンストラクタ
		function constructor(path : string, urls : Map.<string>, callback : function(data:Buffer):void){
			this._count = 0;
			this._callback = callback;
			// 画像を読み込む
			for(var tag in urls){this._count++;}
			if(this._count > 0){for(var tag in urls){this.load(path + urls[tag], tag);}}
			else{this._callback(null);}
		}

		// データのロード
		function load(url : string, tag0 : string) : void{
			fs.readFile(url, function (err : variant, data : Buffer){
				if(!err){
					// 読み込み成功
					this._tags[tag0] = new Buffer(tag0, "utf8");
					this._snds[tag0] = data;
					this._totalLength += this._tags[tag0].length + this._snds[tag0].length + 8;
				}else{
					// 読み込み失敗 TODO なんかデフォルトの無音でも用意しとく？
				}

				if(--this._count == 0){
					// すべての読み込みが完了したらバッファをまとめて送信
					var index = 0;
					var data = new Buffer(this._totalLength);
					for(var tag1 in this._tags){
						// タグ名
						var length = this._tags[tag1].length;
						data.writeUInt8(length & 0xff, index++);
						data.writeUInt8((length >> 8) & 0xff, index++);
						data.writeUInt8((length >> 16) & 0xff, index++);
						data.writeUInt8((length >> 24) & 0xff, index++);
						this._tags[tag1].copy(data, index, 0, length);
						index += length;
						// 音楽データ
						var length = this._snds[tag1].length;
						data.writeUInt8(length & 0xff, index++);
						data.writeUInt8((length >> 8) & 0xff, index++);
						data.writeUInt8((length >> 16) & 0xff, index++);
						data.writeUInt8((length >> 24) & 0xff, index++);
						this._snds[tag1].copy(data, index, 0, length);
						index += length;
					}
					this._callback(data);
				}
			});
		}
	}
}

