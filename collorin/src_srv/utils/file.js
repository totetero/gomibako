var fs = require("fs");

// ファイルを読み込んでjsonに書き出す
exports.file2json = function(js, css, imgs, callback){
	// ファイルロード
	jdat = {};
	if(js){jdat.js = [];}else{js = [];}
	if(css){jdat.css = [];}else{css = [];}
	if(imgs){jdat.imgs = {};}else{imgs = {};}
	var count = js.length + css.length;
	for(var i in imgs){count++;}
	// ジャバスクリプトロード
	for(var i = 0; i < js.length; i++){
		(function(index){
			jdat.js[index] = null;
			fs.readFile(js[i], "utf-8", function (err, data){
				jdat.js[index] = data;
				// すべてのロードが終わったらコールバック
				if(--count == 0){callback(jdat);}
			});
		})(i);
	}
	// スタイルシートロード
	for(var i = 0; i < css.length; i++){
		(function(index){
			jdat.css[index] = null;
			fs.readFile(css[i], "utf-8", function (err, data){
				jdat.css[index] = data;
				// すべてのロードが終わったらコールバック
				if(--count == 0){callback(jdat);}
			});
		})(i);
	}
	// 画像ロード
	for(var i in imgs){
		(function(tag){
			fs.readFile(imgs[i], function (err, data){
				jdat.imgs[tag] = "data:image/png;base64," + new Buffer(data).toString("base64");
				// すべてのロードが終わったらコールバック
				if(--count == 0){callback(jdat);}
			});
		})(i);
	}
};

/*
var exec = require("child_process").exec;
var fs = require("fs");

// コマンドテスト
exec("echo hogehoge", {timeout: 1000}, function(err, stdout, stderr){
	console.log("stdout: " + (stdout||'none'));
	console.log("stderr: " + (stderr||'none'));
})
// ファイルシステム
fs.readFile("./src_cli/test.html", "utf8", function (err, text){
	res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
	res.end(text);
});
fs.readFile("./src_cli/logout.html", "utf8", function (err, text){
	res.send(text, {"Content-Type": "text/html; charset=utf-8"}, 200);
});
*/

