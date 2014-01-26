import "require/nodejs.jsx";
import "require/express.jsx";

// 画像配信クラス
class ImageServer{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(url : string, path : string, app : ExApplication) : void{
		app.post(url, function(req : ExRequest, res : ExResponse, next : function():void) : void{
			if(typeof req.body == "object"){
				new ImageServer.ImageLoader(path, req.body as Map.<string>, function(data : Buffer) : void{
					res.send(data);
				});
			}else{
				// リクエスト書式異常
				res.send(null);
			}
		});
	}

	// ----------------------------------------------------------------
	// 画像読み込みクラス
	class ImageLoader{
		var callback : function(data:Buffer):void;
		var tags = {} : Map.<Buffer>;
		var imgs = {} : Map.<Buffer>;
		var count = 0;
		var totalLength = 0;

		// コンストラクタ
		function constructor(path : string, urls : Map.<string>, callback : function(data:Buffer):void){
			this.callback = callback;
			// 画像数を数える
			for(var tag in urls){this.count++;}
			if(this.count > 0){
				// 画像を読み込む
				for(var tag in urls){this.load(path + "/" + urls[tag], tag);}
			}else{
				// 読み込む画像数0
				this.callback(null);
			}
		}

		// ロード
		function load(url : string, tag0 : string) : void{
			fs.readFile(url, function (err : variant, data : Buffer){
				if(!err){
					// 読み込み成功
					this.tags[tag0] = new Buffer(tag0, "utf8");
					this.imgs[tag0] = data;
					this.totalLength += this.tags[tag0].length + this.imgs[tag0].length + 8;
				}else{
					// 読み込み失敗 TODO なんかデフォルトの透明画像でも用意しとく？
				}
	
				if(--this.count == 0){
					// すべての読み込みが完了したらバッファをまとめて送信
					var index = 0;
					var data = new Buffer(this.totalLength);
					for(var tag1 in this.tags){
						// タグ名
						var length = this.tags[tag1].length;
						data.writeUInt8(length & 0xff, index++);
						data.writeUInt8((length >> 8) & 0xff, index++);
						data.writeUInt8((length >> 16) & 0xff, index++);
						data.writeUInt8((length >> 24) & 0xff, index++);
						this.tags[tag1].copy(data, index, 0, Math.min(length, 0xffffffff));
						index += length;
						// 画像データ
						var length = this.imgs[tag1].length;
						data.writeUInt8(length & 0xff, index++);
						data.writeUInt8((length >> 8) & 0xff, index++);
						data.writeUInt8((length >> 16) & 0xff, index++);
						data.writeUInt8((length >> 24) & 0xff, index++);
						this.imgs[tag1].copy(data, index, 0, Math.min(length, 0xffffffff));
						index += length;
					}
					this.callback(data);
				}
			});
		}
	}
}

