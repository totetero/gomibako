var express = require("express");
var passport = require("passport");
var mongoose = require("mongoose");
var MongoStore = require("connect-mongo")(express);

// サーバ設定
var app = express();
app.configure(function(){
	app.use(express.logger("dev"));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: "topsecret",
		store: new MongoStore({
			db: "totetest",
			host: "127.0.0.1",
			clear_interval: 60 * 60
		}),
		cookie: {
			httpOnly: false,
			maxAge: new Date(Date.now() + 60 * 60 * 1000)
		}
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(__dirname + "/../public"));
	app.use(app.router);
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

// データベース接続
mongoose.connect("mongodb://localhost/test");

// 各ページ設定
require("./pages/auth").init(app);
require("./pages/top").init(app);

app.listen(10080);
console.log("Server running at http://127.0.0.1:10080/");

