import "require/nodejs.jsx";
import "require/express.jsx";
import "require/mongo.jsx";
import "require/redis.jsx";
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

		// ゲーム情報管理データベース接続
		mongoose.connect("mongodb://localhost/totetest");
		// セッション管理データベース接続
		var redisOption = {
			host: "127.0.0.1",
			port: 6379
		};
		var sessionStore = new RedisStore(redisOption);
		var socketStore = new SocketRedisStore({
			redisPub: redisOption,
			redisSub: redisOption,
			redisClient: redisOption
		});

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
				store: sessionStore,
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
		var io = SocketIO.listen(10081);
		io.configure(function() : void{
			io.enable("browser client minification");
			io.set("store", socketStore);
			// socket.ioグローバル認証
			io.set("authorization", function(handshakeData : SocketHandshake, callback : function(err:variant,success:boolean):void) : void{
				var errMsg = "cookieが見つかりませんでした";
				if(handshakeData == null){callback(errMsg, false); return;}
				if(handshakeData.headers == null){callback(errMsg, false); return;}
				var rowCookie = handshakeData.headers["cookie"] as string;
				var cookie = SocketUtil.parse1(String.decodeURIComponent(rowCookie))["connect.sid"];
				if(cookie == null){callback(errMsg, false); return;}
				var sessionID = SocketUtil.parse2(cookie, app.get("secretKey") as string);
				sessionStore.get(sessionID, function(err : variant, session : ExSession) : void{
					var errMsg = "sessionが見つかりませんでした";
					if(err){callback(errMsg, false); return;}
					if(session == null){callback(errMsg, false); return;}
					if(session.passport == null){callback(errMsg, false); return;}
					var userID = session.passport["user"] as string;
					UserModel.findById(userID, function(err : variant, user : UserModel) : void{
						if(err){callback("userが見つかりませんでした", false); return;}
						handshakeData.session = session;
						handshakeData.user = user;
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

