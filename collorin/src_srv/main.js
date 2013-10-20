var express = require("express");
var passport = require("passport");
var mongoose = require("mongoose");
var MongoStore = require("connect-mongo")(express);

// データベース接続
mongoose.connect("mongodb://localhost/totetest");

// サーバ設定
var app = express();
app.configure(function(){
	app.set("views", __dirname + "/../src_cli");
	app.set("view engine", "ejs");
	app.use(express.logger("dev"));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: "totalbeat",
		store: new MongoStore({db: mongoose.connections[0].db}),
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

// 各ページ設定
require("./pages/auth/index").init(app);
require("./pages/game/index").init(app);
require("./pages/top/index").init(app);
require("./pages/mypage/index").init(app);
require("./pages/stage/index").init(app);
require("./pages/chat/index").init(app);

app.listen(10080);
console.log("Server running at http://127.0.0.1:10080/");

