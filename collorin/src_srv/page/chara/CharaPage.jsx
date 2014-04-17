import "../../require/nodejs.jsx";
import "../../require/express.jsx";

import "../../util/ImageServer.jsx";
//import "../../models/User.jsx";
import "../../models/Character.jsx";

// キャラクターページ
class CharaPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// 編成
		app.get("/chara/team", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var imgs = {} : Map.<string>;

			var codeList = [
				"player0",
				"player1",
				"player2",
				"player3",
				"enemy1",
				"enemy2",
				"enemy3",
			];

			// キャラクター情報
			var charaInfoList = new variant[];
			for(var i = 0; i < 10; i++){
				var name = "test" + ("0" + i).slice(-2);
				//var code = codeList[Math.floor(Math.random() * codeList.length)];
				var code = codeList[i % codeList.length];
				charaInfoList.push({id: name, name: name, code: code});
			}

			// キャラクター情報の画像読み込み
			for(var i = 0; i < charaInfoList.length; i++){
				var code = charaInfoList[i]["code"] as string;
				imgs["css_icon_" + code] = "/img/character/" + code + "/icon.png";
				imgs["css_bust_" + code] = "/img/character/" + code + "/bust.png";
			}

			jdat["partner"] = "test00";
			jdat["teams"] = [
				{name: "ほげほげチーム", lock: true, members: ["test01", "test02", "test03"]},
				{name: "ふがふがチーム", lock: false, members: ["test04", "test05"]},
			];
			jdat["list"] = charaInfoList;
			jdat["imgs"] = ImageServer.convertAddress(imgs);
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify(jdat));
		});

		// 補給
		app.get("/chara/supp", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var imgs = {} : Map.<string>;

			var charaInfoList = new variant[];
			CharacterModelUtil.getUserCharaList(req.user, function(charaBase : CharaBaseModel, charaData : CharaDataModel) : void{
				// キャラクター情報獲得
				charaInfoList.push({
					id: charaData._id,
					name: charaBase.name,
					code: charaBase.imageCode,
					date: charaData.createDate,
					level: charaData.level,
				});
			}, function(err : variant) : void{
				// 画像情報獲得
				for(var i = 0; i < charaInfoList.length; i++){
					var code = charaInfoList[i]["code"] as string;
					imgs["css_icon_" + code] = "/img/character/" + code + "/icon.png";
					imgs["css_bust_" + code] = "/img/character/" + code + "/bust.png";
				}

				// 情報送信
				jdat["list"] = charaInfoList;
				jdat["imgs"] = ImageServer.convertAddress(imgs);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			});
		});

		// 休息
		app.get("/chara/rest", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 休息"}));
		});

		// 強化
		app.get("/chara/pwup", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 強化"}));
		});

		// 別れ
		app.get("/chara/sell", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 別れ"}));
		});
	}
}

