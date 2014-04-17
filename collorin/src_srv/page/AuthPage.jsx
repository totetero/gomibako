import "../require/nodejs.jsx";
import "../require/express.jsx";
import "../require/passport.jsx";

import "../models/User.jsx";

// 認証ページ
class AuthPage{
	// ----------------------------------------------------------------
	// passportの設定
	static function setPassport(strategies : variant) : void{
		// passportのsessionをセットアップ
		passport.serializeUser(
			function(user : UserModel, done : function(err:variant,id:string):void){
				done(null, user._id);
			}
		);
		passport.deserializeUser(
			function(id : string, done : function(err:variant,user:UserModel):void){
				UserModel.findById(id, function(err : variant, user : UserModel) : void{
					done(err, user);
				});
			}
		);

		// ローカル用設定
		if(strategies["local"] != null){
			var secretKey = strategies["local"]["secretKey"] as string;
			passport.use(new LocalStrategy({
				usernameField: "user",
				passwordField: "password"
			}, function(name : string, pass : string, done : function(err:variant,user:UserModel,info:variant):void){
				process.nextTick(function(){
					UserModel.findOne({domain: "local", name: name}, function(err : variant, user : UserModel){
						if(err){done(err, null, null);}
						else if(user){
							if(AuthPage.getHash(pass, secretKey) == user.pass){
								// 認証成功 データベース更新
								user.count++;
								user.save(function(err : variant) : void{
									done(null, user, null);
								});
							}else{
								done(null, null, {message: "パスワードが間違っています。"});
							}
						}else{
							var testFlag = (name == "test01" || name == "test02" || name == "test03");
							if(testFlag){
								// テストユーザーのデータベース登録
								UserModelUtil.createUser(function(model : UserModel) : void{
									model.domain = "local";
									model.name = name;
									model.pass = AuthPage.getHash(pass, secretKey);
									model.nickname = name;
									model.imgurl = "";
								}, function(err : variant, model : UserModel) : void{
									done(err, model, null);
								});
							}else{
								done(null, null, {message: "ユーザーが見つかりませんでした。"});
							}
						}
					});
				});
			}));
		}

		// twitter用設定
		if(strategies["twitter"] != null){
			passport.use(new TwitterStrategy(strategies["twitter"], function(token:string, tokenSecret : string, profile : TwitterProfile, done : function(err:variant,user:UserModel,info:variant):void){
				process.nextTick(function(){
					UserModel.findOne({domain: "twitter.com", pass: profile.id}, function(err : variant, user : UserModel){
						if(err){done(err, null, null);}
						else if(user){
							// データベース更新
							user.name = profile.username;
							user.imgurl = profile._json["profile_image_url"] as string;
							user.count++;
							user.save(function(err : variant) : void{
								done(null, user, null);
							});
						}else{
							// データベース登録
							UserModelUtil.createUser(function(model : UserModel) : void{
								model.domain = "twitter.com";
								model.name = profile.username;
								model.pass = profile.id;
								model.nickname = profile.displayName;
								model.imgurl = profile._json["profile_image_url"] as string;
							}, function(err : variant, model : UserModel) : void{
								done(err, model, null);
							});
						}
					});
				});
			}));
		}
	}

	// ----------------------------------------------------------------
	// ハッシュ値
	static function getHash(target : string, key : string) : string{
		var hmac = crypto.createHmac("sha256", key);
		return hmac.update(target).digest("hex");
	}

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// passportログイン関数
		var authenticate = function(strategy : string, options : variant) : function(req:ExRequest,res:ExResponse,next:function():void) : void{
			return function(req : ExRequest, res : ExResponse, next : function():void) : void{
				if(req.isAuthenticated()){
					next();
				}else{
					passport.authenticate(strategy, options)(req, res, next);
				}
			};
		};
		// ローカルログイン
		app.post("/auth/local", authenticate("local", {successRedirect: "/", failureRedirect: "/auth/fail"}));
		// twitterでのログイン
		app.get("/auth/twitter", authenticate("twitter", null));
		app.get("/auth/twitter/callback", authenticate("twitter", {successRedirect: "/", failureRedirect: "/"}));

		// ログイン失敗
		app.get("/auth/fail", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			if(req.isAuthenticated()){
				next();
			}else{
				res.send("ログイン失敗<br><a href='/'>戻る</a>");
			}
		});

		// ログインを促す画面
		app.get("/login", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			if(req.isAuthenticated()){
				next();
			}else{
				res.render("login.ejs");
			}
		});

		// ログインチェック処理
		app.all("*", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			if(req.isAuthenticated()){
				next();
			}else if(req.url.indexOf("/public") == 0){
				next();
			}else{
				res.redirect("/login");
			}
		});

		// ログアウト処理
		app.get("/logout", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			req.logout();
			res.render("logout.ejs");
		});
	}
}

