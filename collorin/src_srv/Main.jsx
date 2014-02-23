import "require/nodejs.jsx";
import "require/express.jsx";
import "require/mongo.jsx";
import "require/redis.jsx";
import "require/passport.jsx";
import "require/socket.io.jsx";

import "util/ImageServer.jsx";
import "page/AuthPage.jsx";
import "page/top/TopPage.jsx";
import "page/mypage/MyPage.jsx";
import "page/world/WorldPage.jsx";
import "page/dice/DicePage.jsx";
import "page/chat/ChatPage.jsx";

import "models/User.jsx";

import "data/CharacterDrawInfo.jsx";

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		// データ初期化
		CharacterDrawInfo.init();

		// データベース接続 mongo
		mongoose.connect("mongodb://localhost/totetest");
		// データベース接続 redis
		var redisPort = 6379;
		var redisHost = "127.0.0.1";
		var rcli = redis.createClient(redisPort, redisHost, null);
		var sessionStore = new RedisStore({host: redisHost, port: redisPort});
		var socketStore = new SocketRedisStore({
			redisPub: {host: redisHost, port: redisPort},
			redisSub: {host: redisHost, port: redisPort},
			redisClient: {host: redisHost, port: redisPort}
		});

		// expressサーバ設定
		var app = express.create();
		var srv = http.Server(app);
		app.configure(function(){
			app.set("secretKey", "totalbeat");
			app.set("views", node.__dirname + "/template");
			app.set("view engine", "ejs");
			app.use(express.logger("dev"));
			app.use(express.json({strict: false}));
			app.use(express.urlencoded());
			app.use(express.methodOverride());
			app.use(express.cookieParser());
			app.use(express.session({
				secret: app.get("secretKey"),
				store: sessionStore,
				cookie: {maxAge: 30 * 24 * 60 * 60 * 1000}
			}));
			app.use(passport.initialize());
			app.use(passport.session());
			app.use(express.compress());
			app.use(app.router);
			app.use(express.static_(node.__dirname + "/content"));
			app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
			app.use(function(req : ExRequest, res : ExResponse, next : function():void){
				res.status(404).render("404.ejs", null);
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
		AuthPage.setPassport({
			twitter: {
				consumerKey: "qHPj2nZHSawplrhmx3BQ",
				consumerSecret: "pU2ssiGpZXuOZ20djoya3h15LORnuL6XJ7IxD0egk",
				callbackURL: "http://127.0.0.1:10080/auth/twitter/callback"
			}
		});

		// 各ページ設定
		AuthPage.setPage(app);
		TopPage.setPage(app);
		_Main.setMainPage(app);
		MyPage.setPage(app);
		WorldPage.setPage(app);
		DicePage.setPage(app, rcli);
		ChatPage.setPage(app, rcli, io);

		// 画像サーバ
		ImageServer.setPage("/img", node.__dirname + "/content", app);

		srv.listen(10080);
		log "Server running at http://127.0.0.1:10080/";
	}

	// ----------------------------------------------------------------
	// メインページの設定
	static function setMainPage(app : ExApplication) : void{
		app.get("/main", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.render("main.ejs");
		});
	}
}

