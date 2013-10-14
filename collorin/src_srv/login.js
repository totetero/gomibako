var passport = require("passport");
var TwitterStrategy = require('passport-twitter').Strategy;

// データベースモデル
var UserModel = require("./model").UserModel;

// Passport sessionのセットアップ
passport.serializeUser(function(user, done){done(null, user._id);});
passport.deserializeUser(function(id, done){UserModel.findById(id, function(err, user){done(err, user);});});

// twitter用設定
passport.use(new TwitterStrategy({
		consumerKey: "qHPj2nZHSawplrhmx3BQ",
		consumerSecret: "pU2ssiGpZXuOZ20djoya3h15LORnuL6XJ7IxD0egk",
		callbackURL: "http://127.0.0.1:10080/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done){
		// ログイン成功
		passport.session.oauth = {};
		passport.session.oauth.access_token = token;
		passport.session.userinfo = {};
		passport.session.userinfo.id = profile.id;
		// データベース確認
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
	}
));

exports.init = function(app){
	// twitterでのログイン
	app.get("/auth/twitter", passport.authenticate("twitter"));
	// twitterでのログインから戻ってきたとき
	app.get("/auth/twitter/callback", passport.authenticate("twitter", {successRedirect: "/", failureRedirect: "/"}));
};

