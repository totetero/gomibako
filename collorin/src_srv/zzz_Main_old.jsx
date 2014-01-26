import "require/nodejs.jsx";
import "require/express.jsx";
import "require/mongo.jsx";
import "require/passport.jsx";

import "zzz_pages_old/*.jsx";

import "data/CharacterDrawInfo.jsx";

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		// データ初期化
		CharacterDrawInfo.init();

		// データベース接続
		mongoose.connect("mongodb://localhost/totetest");
		var mongoStore = new MongoStore({db: mongoose.connections[0]["db"]});

		// expressサーバ設定
		var app = express.create();
		var srv = http.Server(app);
		app.configure(function(){
			app.set("secretKey", "totalbeat");
			app.set("views", node.__dirname + "/src_cli_old");
			app.set("view engine", "ejs");
			app.use(express.logger("dev"));
			app.use(express.json({strict: false}));
			app.use(express.urlencoded());
			app.use(express.methodOverride());
			app.use(express.cookieParser());
			app.use(express.session({
				secret: app.get("secretKey"),
				store: mongoStore,
				cookie: {httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000}
			}));
			app.use(passport.initialize());
			app.use(passport.session());
			app.use(express.compress());
			app.use(app.router);
			app.use(express.static_(node.__dirname + "/public"));
			app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
			app.use(function(req : ExRequest, res : ExResponse, next : function():void){
				res.status(404).render("404.ejs", null);
			});
		});

		// passport認証設定
		AuthPage.setPassport();

		// 各ページ設定
		AuthPage.setPage(app);
		GamePage.setPage(app);
		TopPage.setPage(app);
		MyPage.setPage(app);
		StagePage.setPage(app);
		ChatPage.setPage(app);
		ChatPage.setSocket(app, srv, mongoStore);

		srv.listen(10080);
		log "Server running at http://127.0.0.1:10080/";
	}
}

