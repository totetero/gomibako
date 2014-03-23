native class fs{
	static function statSync(path : string) : Stats;
	static function mkdirSync(path : string) : Buffer;
	static function readdirSync(path : string) : string[];
	static function readFileSync(filename : string) : Buffer;
	static function writeFileSync(filename : string, data : Buffer) : void;
} = """require("fs")""";

native class Stats{
	function isFile() : boolean;
	function isDirectory() : boolean;
}

native class Buffer{
	var length : int;
	function readUInt8(offset : int) : int;
	function writeUInt8(value : int, offset : int) : void;
}

native class crypto{
	static function createCipher(algorithm : string, password : string) : Chipher;
} = """require("crypto")""";

native class Chipher{
	function update(data : string, input_encoding : string, output_encoding : string) : string;
	function final(encoding : string) : string;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 画像ファイル名をハッシュ化

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		fs.mkdirSync("./content/imgCrypt");
		_Main.readdir("./content/img");
	}

	static function readdir(path : string) : void{
		var files = fs.readdirSync(path);
		for(var i = 0; i < files.length; i++){
			var srcFile = path + "/" + files[i];
			var stats = fs.statSync(srcFile);
			if(stats.isDirectory()){
				// ディレクトリなら再帰
				_Main.readdir(srcFile);
			}else if(stats.isFile()){
				// ファイルならタイプ確認
				var data = fs.readFileSync(srcFile);
				var cp0 = data.readUInt8(0);
				var cp1 = data.readUInt8(1);
				var cp2 = data.readUInt8(2);
				var cp3 = data.readUInt8(3);
				var cm1 = data.readUInt8(data.length - 1);
				var cm2 = data.readUInt8(data.length - 2);
				var isPng = (cp0 == 0x89 && cp1 == 0x50 && cp2 == 0x4e && cp3 == 0x47);
				var isGif = (cp0 == 0x47 && cp1 == 0x49 && cp2 == 0x46 && cp3 == 0x38);
				var isJpg = (cp0 == 0xff && cp1 == 0xd8 && cm2 == 0xff && cm1 == 0xd9);
				if(isPng || isGif || isJpg){
					// 画像ならパスをハッシュ化してコピー
					//var dstFile = srcFile.replace(/^.\/content\/img/, "/img");
					//var cipher = crypto.createCipher("aes192", "testImageSecretKey");
					//var filename = cipher.update(dstFile, "ascii", "base64") + cipher.final("base64");
					//dstFile = "./content/imgCrypt/" + String.encodeURIComponent(filename);
					var dstFile = "./content/imgCrypt/" + srcFile.replace(/^.\/content\/img/, "/img").replace(/\//g, "_");
					fs.writeFileSync(dstFile, data);
				}
			}
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

