import "../require/nodejs.jsx";

// ファイル操作ユーティリティ
class FileUtil{
}

// ファイルを読み込んで文字列として書き出す
class FileUtilJsonData{
	var count : int;
	var callback : function(data:FileUtilJsonData):void;

	var js : string[];
	var css : string[];
	var imgs : Map.<string>;
	var strs : Map.<string>;

	// コンストラクタ
	function constructor(js : string[], css : string[], imgs : Map.<string>, strs : Map.<string>, callback : function(data:FileUtilJsonData):void){
		this.count = 0;
		this.callback = callback;
		
		// カウント
		if(js != null){this.js = new string[]; this.count += js.length;}
		if(css != null){this.css = new string[]; this.count += css.length;}
		if(imgs != null){this.imgs = {} : Map.<string>; for(var j in imgs){this.count++;}}
		if(strs != null){this.strs = {} : Map.<string>; for(var j in strs){this.count++;}}

		// ロード
		if(js != null){for(var i = 0; i < js.length; i++){this.loadJs(js, i);}}
		if(css != null){for(var i = 0; i < css.length; i++){this.loadCss(css, i);}}
		if(imgs != null){for(var j in imgs){this.loadImgs(imgs, j);}}
		if(strs != null){for(var j in strs){this.loadStrs(strs, j);}}
	}

	// ジャバスクリプトロード
	function loadJs(js : string[], index : int) : void{
		this.js[index] = null;
		fs.readFile(js[index], "utf-8", function (err : variant, data : string) : void{
			this.js[index] = data;
			// すべてのロードが終わったらコールバック
			if(--this.count == 0){this.callback(this);}
		});
	}

	// スタイルシートロード
	function loadCss(css : string[], index : int) : void{
		this.css[index] = null;
		fs.readFile(css[index], "utf-8", function (err : variant, data : string) : void{
			this.css[index] = data;
			// すべてのロードが終わったらコールバック
			if(--this.count == 0){this.callback(this);}
		});
	}

	// 画像ロード
	function loadImgs(imgs : Map.<string>, tag : string) : void{
		fs.readFile(imgs[tag], function (err : variant, data : Buffer){
			this.imgs[tag] = "data:image/png;base64," + data.toString("base64");
			// すべてのロードが終わったらコールバック
			if(--this.count == 0){this.callback(this);}
		});
	}

	// 文字列ロード
	function loadStrs(strs : Map.<string>, tag : string) : void{
		fs.readFile(strs[tag], "utf-8", function (err : variant, data : string) : void{
			this.strs[tag] = data;
			// すべてのロードが終わったらコールバック
			if(--this.count == 0){this.callback(this);}
		});
	}
}


