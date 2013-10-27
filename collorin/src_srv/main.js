var http = require("http");
var express = require("express");
var passport = require("passport");
var mongoose = require("mongoose");
var MongoStore = require("connect-mongo")(express);
var socketio = require("socket.io");
var connect = require("express/node_modules/connect")
var cookiemod = require("express/node_modules/cookie");

// データベース接続
mongoose.connect("mongodb://localhost/totetest");
var mongoStore = new MongoStore({db: mongoose.connections[0].db});

// expressサーバ設定
var app = express();
var srv = http.Server(app);
app.configure(function(){
	app.set("secretKey", "mySecret");
	app.set("views", __dirname + "/../src_cli");
	app.set("view engine", "ejs");
	app.use(express.logger("dev"));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(app.get("secretKey")));
	app.use(express.session({
		secret: "totalbeat",
		store: mongoStore,
		cookie: {httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000}
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.compress());
	app.use(app.router);
	app.use(express.static(__dirname + "/../public"));
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	app.use(function(req, res){res.status(404).render("404.ejs");});
});

// socket.io設定
io = socketio.listen(srv);
io.configure(function(){
	io.enable("browser client minification");
	io.set("authorization", function(handshakeData, callback){
		var cookie = cookiemod.parse(decodeURIComponent(handshakeData.headers.cookie))
		var cookie = connect.utils.parseSignedCookies(cookie, app.get('secretKey'));
		console.log(cookie);
		// 難航中
		// http://www.pxsta.net/blog/?p=3568
		
		if(handshakeData.headers.cookie){
			var cookie = handshakeData.headers.cookie;
			//console.log(handshakeData);
			console.log("認証成功DAYO!!");
			callback(null, true);
		}else{
			callback("Cookie が見つかりませんでした", false);
		}
	});
});

// 各ページ設定
require("./pages/auth/index").init(app);
require("./pages/game/index").init(app);
require("./pages/top/index").init(app);
require("./pages/mypage/index").init(app);
require("./pages/stage/index").init(app);
require("./pages/chat/index").init(app);
require("./pages/chat/socket").init(io);

srv.listen(10080);
console.log("Server running at http://127.0.0.1:10080/");

