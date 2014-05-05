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
			contents["img_system_button_basic_normal"] = "/img/system/button/basic/normal.png";
			contents["img_system_button_basic_active"] = "/img/system/button/basic/active.png";
			contents["img_system_button_basic_select"] = "/img/system/button/basic/select.png";
			contents["img_system_button_basic_inactive"] = "/img/system/button/basic/inactive.png";
			contents["img_system_button_ctrlArrow_normal"] = "/img/system/button/ctrlArrow/normal.png";
			contents["img_system_button_ctrlArrow_active"] = "/img/system/button/ctrlArrow/active.png";
			contents["img_system_button_ctrlButton_normal"] = "/img/system/button/ctrlButton/normal.png";
			contents["img_system_button_ctrlButton_active"] = "/img/system/button/ctrlButton/active.png";
			contents["img_system_button_headerTop_normal"] = "/img/system/button/headerTop/normal.png";
			contents["img_system_button_headerTop_active"] = "/img/system/button/headerTop/active.png";
			contents["img_system_button_headerMenu_normal"] = "/img/system/button/headerMenu/normal.png";
			contents["img_system_button_headerMenu_active"] = "/img/system/button/headerMenu/active.png";
			contents["img_system_button_headerMypage_normal"] = "/img/system/button/headerMypage/normal.png";
			contents["img_system_button_headerMypage_active"] = "/img/system/button/headerMypage/active.png";
			contents["img_system_button_picker_normal"] = "/img/system/button/picker/normal.png";
			contents["img_system_button_picker_active"] = "/img/system/button/picker/active.png";
			contents["img_system_button_picker_inactive"] = "/img/system/button/picker/inactive.png";
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

