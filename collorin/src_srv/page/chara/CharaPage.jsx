import "../../require/nodejs.jsx";
import "../../require/express.jsx";

import "../../util/ImageServer.jsx";
import "../../models/User.jsx";
import "../../models/Character.jsx";
import "../../models/Team.jsx";

// キャラクターページ
class CharaPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// -------- 編成 --------
		app.get("/chara/team", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var imgs = {} : Map.<string>;
			var charaInfoList = new variant[];
			var teamInfoList = new variant[];

			var step = {} : Map.<function():void>;
			step["start"] = function() : void{step["getCharas"]();};
			// キャラクター情報獲得
			step["getCharas"] = function() : void{
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
					step["getPartner"]();
				});
			};
			// パートナー情報獲得
			step["getPartner"] = function() : void{
				UserStatusModel.findOne({userId: req.user._id}, function(err : variant, userStatus : UserStatusModel) : void{
					jdat["partner"] = userStatus.partnerCharaId;
					step["getTeams"]();
				});
			};
			// 編成情報獲得
			step["getTeams"] = function() : void{
				TeamModel.find({userId: req.user._id}, function(err : variant, TeamModelList : TeamModel[]) : void{
					// 表示順ソート
					TeamModelList.sort(function(t0 : Nullable.<TeamModel>, t1 : Nullable.<TeamModel>):number{return t0.index - t1.index;});
					for(var i = 0; i < TeamModelList.length; i++){
						var members = new string[];
						if(TeamModelList[i].memberCharaId1 != ""){members.push(TeamModelList[i].memberCharaId1);}
						if(TeamModelList[i].memberCharaId2 != ""){members.push(TeamModelList[i].memberCharaId2);}
						if(TeamModelList[i].memberCharaId3 != ""){members.push(TeamModelList[i].memberCharaId3);}
						teamInfoList.push({
							name: TeamModelList[i].name,
							lock: TeamModelList[i].lock,
							members: members,
						});
					}
					step["getImgs"]();
					step["send"]();
				});
			};
			// 画像情報整理
			step["getImgs"] = function() : void{
				for(var i = 0; i < charaInfoList.length; i++){
					var code = charaInfoList[i]["code"] as string;
					imgs["css_icon_" + code] = "/img/character/" + code + "/icon.png";
					imgs["css_bust_" + code] = "/img/character/" + code + "/bust.png";
				}
			};
			// 送信
			step["send"] = function() : void{
				jdat["list"] = charaInfoList;
				jdat["teams"] = teamInfoList;
				jdat["imgs"] = ImageServer.convertAddress(imgs);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			};
			// プログラムステップ開始
			step["start"]();
		});

		// -------- 補給 --------
		app.get("/chara/supp", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var imgs = {} : Map.<string>;
			var charaInfoList = new variant[];

			var step = {} : Map.<function():void>;
			step["start"] = function() : void{step["getCharas"]();};
			// キャラクター情報獲得
			step["getCharas"] = function() : void{
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
					step["getImgs"]();
					step["send"]();
				});
			};
			// 画像情報整理
			step["getImgs"] = function() : void{
				for(var i = 0; i < charaInfoList.length; i++){
					var code = charaInfoList[i]["code"] as string;
					imgs["css_icon_" + code] = "/img/character/" + code + "/icon.png";
					imgs["css_bust_" + code] = "/img/character/" + code + "/bust.png";
				}
			};
			// 送信
			step["send"] = function() : void{
				jdat["list"] = charaInfoList;
				jdat["imgs"] = ImageServer.convertAddress(imgs);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			};
			// プログラムステップ開始
			step["start"]();
		});

		// -------- 休息 --------
		app.get("/chara/rest", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 休息"}));
		});

		// -------- 強化 --------
		app.get("/chara/pwup", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 強化"}));
		});

		// -------- 別れ --------
		app.get("/chara/sell", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 別れ"}));
		});
	}
}

