var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var TwitterStrategy = require("passport-twitter").Strategy;
var crypto = require("crypto");

// データベースモデル
var UserModel = require("../../models/user").UserModel;

// Passport sessionのセットアップ
passport.serializeUser(function(user, done){done(null, user._id);});
passport.deserializeUser(function(id, done){UserModel.findById(id, function(err, user){done(err, user);});});

// ハッシュ値
var getHash = function(target){
	var hmac = crypto.createHmac("sha256", "testSecretKey");
	return hmac.update(target).digest("hex");
};

// ローカル用設定
passport.use(new LocalStrategy(
	{usernameField: "user", passwordField: "password"},
	function(name, pass, done){
		process.nextTick(function(){
			UserModel.findOne({domain: "local", uname: name}, function(err, user){
				if(err){return done(err);}
				if(user){
					if(getHash(pass) == user.uid){
						// 認証成功 データベース更新
						user.count++;
						user.save();
						return done(null, user);
					}else{
						return done(null, false, {message: "パスワードが間違っています。"});
					}
				}else{
					var testFlag = (name == "test01" || name == "test02" || name == "test03");
					if(testFlag){
						// テストユーザーのデータベース登録
						user = new UserModel();
						user.domain = "local";
						user.uid = getHash(pass);
						user.uname = name;
						user.imgurl = "";
						user.count = 1;
						user.save();
						return done(null, user);
					}else{
						return done(null, false, {message: "ユーザーが見つかりませんでした。"});
					}
				}
			});
		});
	}
));

// twitter用設定
passport.use(new TwitterStrategy({
		consumerKey: "qHPj2nZHSawplrhmx3BQ",
		consumerSecret: "pU2ssiGpZXuOZ20djoya3h15LORnuL6XJ7IxD0egk",
		callbackURL: "http://127.0.0.1:10080/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done){
		process.nextTick(function(){
			UserModel.findOne({domain: "twitter.com", uid: profile.id}, function(err, user){
				if(err){return done(err);}
				if(user){
					// データベース更新
					user.count++;
					user.save();
				}else{
					// データベース登録
					user = new UserModel();
					user.domain = "twitter.com";
					user.uid = profile.id;
					user.uname = profile.username;
					user.imgurl = profile._json.profile_image_url;
					user.count = 1;
					user.save();
				}
				return done(null, user);
			});
		});
	}
));

// ページ設定
exports.init = function(app){
	// ローカルログイン
	app.post("/auth/local", passport.authenticate("local", {successRedirect: "/", failureRedirect: "/auth/fail"}));
	// ログイン失敗
	app.get("/auth/fail", function(req, res){res.send("ログイン失敗<br><a href='/'>戻る</a>");});

	// twitterでのログイン
	app.get("/auth/twitter", passport.authenticate("twitter"));
	// twitterでのログインから戻ってきたとき
	app.get("/auth/twitter/callback", passport.authenticate("twitter", {successRedirect: "/", failureRedirect: "/"}));

	// ログインを促す画面
	app.get("/login", function(req, res){
		res.render("login.ejs");
	});

	// ログインチェック処理
	app.all("*", function(req, res, next){
		if(req.isAuthenticated()){
			next();
		}else if(req.url.indexOf("/login") == 0){
			next();
		}else{
			res.redirect("/login");
		}
	});

	// ログアウト処理
	app.get("/logout", function(req, res){
		req.logout();
		res.render("logout.ejs");
	});
};

