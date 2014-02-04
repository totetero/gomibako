import "require/nodejs.jsx";
import "require/express.jsx";
import "require/mongo.jsx";
import "require/passport.jsx";
import "require/socket.io.jsx";

import "work/Auth.jsx";
import "work/ImageServer.jsx";
import "page/*.jsx";

import "models/User.jsx";

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
			app.set("views", node.__dirname + "/public");
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
			app.use(express.static_(app.get("views") as string));
			app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
			app.use(function(req : ExRequest, res : ExResponse, next : function():void){
				res.status(404).send("404エラー<br><a href='/'>戻る</a>");
			});
		});

		// socket.ioサーバ設定
		var io = SocketIO.listen(srv);
		io.configure(function() : void{
			//io.enable("browser client minification");
			// socket.ioグローバル認証
			io.set("authorization", function(handshakeData : variant, callback : function(err:variant,success:boolean):void) : void{
				var cookie = handshakeData["headers"]["cookie"] as string;
				if(!cookie){callback("cookieが見つかりませんでした", false); return;}
				var cookie = SocketUtil.parse1(String.decodeURIComponent(cookie))["connect.sid"];
				var sessionID = SocketUtil.parse2(cookie, app.get("secretKey") as string);
				mongoStore.get(sessionID, function(err : variant, session : variant) : void{
					if(err){callback("sessionが見つかりませんでした", false); return;}
					UserModel.findById(session["passport"]["user"] as string, function(err : variant, user : UserModel) : void{
						if(err){callback("userが見つかりませんでした", false); return;}
						log "認証成功DAYO!!";
						handshakeData["session"] = session;
						callback(null, true);
					});
				});
			});
		});

		// passport認証設定
		AuthPage.setPassport();
		// 認証ページ
		AuthPage.setPage(app);
		// トップページ
		app.get("/", function(req : ExRequest, res : ExResponse, next : function():void) : void{res.redirect("/top");});
		app.get("/top", function(req : ExRequest, res : ExResponse, next : function():void) : void{res.render("top/top.ejs");});
		// メインページ
		app.get("/main", function(req : ExRequest, res : ExResponse, next : function():void) : void{res.render("main/index.ejs");});
		// 画像サーバ
		ImageServer.setPage("/img", app.get("views") as string, app);
		// 各ページ設定
		MyPage.setPage(app);
		WorldPage.setPage(app);
		GamePage.setPage(app);
		ChatPage.setPage(app, io);

		srv.listen(10080);
		log "Server running at http://127.0.0.1:10080/";
	}
}

