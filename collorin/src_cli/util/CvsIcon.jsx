import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// アイコン画像作成クラス
class CvsIcon{
	static var crc32table : int[];

	// ----------------------------------------------------------------
	// canvasをbase64に変換 
	static function toBase64(canvas : HTMLCanvasElement) : string{
		// toDataURL関数が存在すればそれを使う
		var b64 = canvas.toDataURL("image/png");
		if(b64 != "data:,"){return b64;}
		//if(js.eval("!!HTMLCanvasElement.prototype.toDataURL") as boolean){return canvas.toDataURL("image/png");}

		// 画像ピクセルの取得
		var context = canvas.getContext("2d") as CanvasRenderingContext2D;
		var imgRawData = context.getImageData(0, 0, canvas.width, canvas.height).data;
		var imgData = new int[];
		for(var i = 0; i < canvas.height; i++){
			imgData.push(0);
			for(var j = 0; j < canvas.width; j++){
				imgData.push(imgRawData[(canvas.width * i + j) * 4 + 0]);
				imgData.push(imgRawData[(canvas.width * i + j) * 4 + 1]);
				imgData.push(imgRawData[(canvas.width * i + j) * 4 + 2]);
				imgData.push(imgRawData[(canvas.width * i + j) * 4 + 3]);
			}
		}

		var charData = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

		var toUint = function(num : int) : int{return num < 0 ? num + 4294967296 : num;};
		var pushBytes32 = function(num : int) : void{charData.push((num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff);};
		var pushBytes16sw = function(num : int) : void{charData.push(num & 0xff, (num >>> 8) & 0xff);};
		var pushCrc32 = function(start : int, length : int) : void{
			if(CvsIcon.crc32table == null){
				CvsIcon.crc32table = new int[];
				for(var i = 0; i < 256; i++){
					var temp = i;
					for(var j = 0; j < 8; j++){temp = (temp & 1) ? (0xedb88320 ^ (temp >>> 1)) : (temp >>> 1);}
					CvsIcon.crc32table[i] = toUint(temp);
				}
			}
			var temp = 0xffffffff;
			for(var i = 0; i < length; i++){temp = CvsIcon.crc32table[(temp ^ charData[start + i]) & 0xff] ^ (temp >>> 8);}
			pushBytes32(toUint(temp ^ 0xffffffff));
		};

		// イメージヘッダ
		charData.push(0x00, 0x00, 0x00, 0x0d);
		var crcStart = charData.length;
		charData.push(0x49, 0x48, 0x44, 0x52);
		pushBytes32(canvas.width);
		pushBytes32(canvas.height);
		charData.push(0x08, 0x06, 0x00, 0x00, 0x00);
		var crcLength = charData.length - crcStart;
		pushCrc32(crcStart, crcLength);

		// イメージデータ
		var blocks = Math.ceil(imgData.length / 32768);
		pushBytes32(imgData.length + 5 * blocks + 6);
		var crcStart = charData.length;
		charData.push(0x49, 0x44, 0x41, 0x54, 0x78, 0x01);
		for(var i = 0; i < blocks; i++){
			var blockLen = Math.min(32768, imgData.length - (i * 32768));
			charData.push((i == (blocks - 1)) ? 0x01 : 0x00);
			pushBytes16sw(blockLen);
			pushBytes16sw(~blockLen);
			for(var j = 0; j < blockLen; j++){
				charData.push(imgData[32768 * i + j]);
			}
		}
		var lowerBytes = 1;
		var upperBytes = 0;
		for(var i = 0; i < imgData.length; i++){
			lowerBytes = (lowerBytes + imgData[i]) % 65521;
			upperBytes = (upperBytes + lowerBytes) % 65521;
		}
		pushBytes32(toUint((upperBytes << 16) | lowerBytes));
		var crcLength = charData.length - crcStart;
		pushCrc32(crcStart, crcLength);

		// イメージ終端
		charData.push(0x00, 0x00, 0x00, 0x00);
		var crcStart = charData.length;
		charData.push(0x49, 0x45, 0x4e, 0x44);
		var crcLength = charData.length - crcStart;
		pushCrc32(crcStart, crcLength);

		// base64情報GET!!
		var bin = "";
		for(var i = 0; i < charData.length; i++){bin += String.fromCharCode(charData[i]);}
		return "data:image/png;base64," + dom.window.btoa(bin);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

