import "require/nodejs.jsx";
import "require/express.jsx";

import "util/ContentsServer.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		// expressサーバ設定
		var app = express.create();
		var srv = http.Server(app);

		app.set("views", node.__dirname + "/template");
		app.set("view engine", "ejs");
		app.use(express.json({strict: false}));
		app.use(express.static_(node.__dirname + "/content"));

		// コンテンツサーバ
		ContentsServer.setPage(app, "/contents", node.__dirname + "/content", "testContentsSecretKey");

		// testページ
		app.get("/", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.render("main.ejs");
		});

		// test通信
		app.get("/test", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var contents = {} : Map.<string>;

			jdat["test"] = "にょろん";

			contents["img_system_box_basic"] = "/img/system/box/basic.png";
			jdat["contents"] = ContentsServer.convertAddress(contents);

			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify(jdat));
		});

		srv.listen(10080);
		log "Server running at http://127.0.0.1:10080/";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

