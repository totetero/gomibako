import "require/nodejs.jsx";
import "require/express.jsx";

// 画像配信クラス
class ImageServer{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(url : string, path : string, app : ExApplication) : void{
		app.post(url, function(req : ExRequest, res : ExResponse, next : function():void) : void{
			if(typeof req.body == "object" && typeof req.body["urls"] == "object"){
				var urls = req.body["urls"] as Map.<string>;
				// 画像数を数える
				var count = 0;
				for(var tag in urls){count++;}
				if(count <= 0){
					// リクエスト無し
					res.send(null);
				}else if(req.body["isBin"] as boolean){
					// binary画像のリクエスト
					new ImageServer.ImageLoaderBin(path, urls, count, function(data : Buffer) : void{
						res.send(data);
					});
				}else{
					// base64画像のリクエスト
					new ImageServer.ImageLoaderB64(path, urls, count, function(data : string) : void{
						res.send(data);
					});
				}
			}else{
				// リクエスト書式異常
				res.send(null);
			}
		});
	}

	// ----------------------------------------------------------------
	// base64形式での画像読み込みクラス
	class ImageLoaderB64{
		var _callback : function(data:string):void;
		var _imgs = {} : Map.<string>;
		var _count : int;

		// コンストラクタ
		function constructor(path : string, urls : Map.<string>, count : int, callback : function(data:string):void){
			this._count = count;
			this._callback = callback;
			// 画像を読み込む
			for(var tag in urls){this.load(path + "/" + urls[tag], tag);}
		}

		// データのロード
		function load(url : string, tag : string) : void{
			fs.readFile(url, function (err : variant, data : Buffer){
				var type = "";
				var cp0 = data.readUInt8(0);
				var cp1 = data.readUInt8(1);
				var cp2 = data.readUInt8(2);
				var cp3 = data.readUInt8(3);
				var cm1 = data.readUInt8(data.length - 1);
				var cm2 = data.readUInt8(data.length - 2);
				if(cp0 == 0x89 && cp1 == 0x50 && cp2 == 0x4e && cp3 == 0x47){
					type = "data:image/png;base64,";
				}else if(cp0 == 0x47 && cp1 == 0x49 && cp2 == 0x46 && cp3 == 0x38){
					type = "data:image/gif;base64,";
				}else if(cp0 == 0xff && cp1 == 0xd8 && cm2 == 0xff && cm1 == 0xd9){
					type = "data:image/jpeg;base64,";
				}
				this._imgs[tag] = type + data.toString("base64");
				// すべてのロードが終わったらコールバック
				if(--this._count == 0){
					this._callback(JSON.stringify(this._imgs));
				}
			});
		}
	}

	// ----------------------------------------------------------------
	// binaryデータでの画像読み込みクラス
	class ImageLoaderBin{
		var _callback : function(data:Buffer):void;
		var _tags = {} : Map.<Buffer>;
		var _imgs = {} : Map.<Buffer>;
		var _count : int;
		var _totalLength = 0;

		// コンストラクタ
		function constructor(path : string, urls : Map.<string>, count : int, callback : function(data:Buffer):void){
			this._count = count;
			this._callback = callback;
			// 画像を読み込む
			for(var tag in urls){this.load(path + "/" + urls[tag], tag);}
		}

		// データのロード
		function load(url : string, tag0 : string) : void{
			fs.readFile(url, function (err : variant, data : Buffer){
				if(!err){
					// 読み込み成功
					this._tags[tag0] = new Buffer(tag0, "utf8");
					this._imgs[tag0] = data;
					this._totalLength += this._tags[tag0].length + this._imgs[tag0].length + 8;
				}else{
					// 読み込み失敗 TODO なんかデフォルトの透明画像でも用意しとく？
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
						this._tags[tag1].copy(data, index, 0, Math.min(length, 0xffffffff));
						index += length;
						// 画像データ
						var length = this._imgs[tag1].length;
						data.writeUInt8(length & 0xff, index++);
						data.writeUInt8((length >> 8) & 0xff, index++);
						data.writeUInt8((length >> 16) & 0xff, index++);
						data.writeUInt8((length >> 24) & 0xff, index++);
						this._imgs[tag1].copy(data, index, 0, Math.min(length, 0xffffffff));
						index += length;
					}
					this._callback(data);
				}
			});
		}
	}
}

