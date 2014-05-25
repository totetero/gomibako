import "../../require/express.jsx";

import "../../util/ContentsServer.jsx";
import "../../models/User.jsx";
import "../../models/Character.jsx";
import "../../models/Team.jsx";

// キャラクター編成ページ
class CharaTeamPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/chara/team", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var cont = {} : Map.<string>;
			var type = "get";

			// 受信パラメータ確認
			if(typeof req.query == "object"){
				switch(req.query["type"] as string){
					case "partner": type = "partner"; break; // charaId
					case "teamName": type = "teamName"; break; // teamId name
					case "teamMember": type = "teamMember"; break; // teamId index charaId
				}
			}

			// 所持可能キャラ数
			jdat["max"] = 100;

			var step = {} : Map.<function():void>;
			step["start"] = function() : void{
				if(type == "get"){
					step["getCharas"]();
				}else{
					step["getPartner"]();
				}
			};

			// ---------------- キャラクター情報獲得
			var charaInfoList = new variant[];
			step["getCharas"] = function() : void{
				// キャラクター情報獲得
				CharacterModelUtil.getUserCharaList(req.user, function(charaBase : CharaBaseModel, charaData : CharaDataModel) : void{
					charaInfoList.push({
						id: charaData._id,
						name: charaBase.name,
						code: charaBase.imageCode,
						date: charaData.createDate,
						refbook: charaBase.refbookIndex,
						level: charaData.level,
						favorite: charaData.favorite,
					});
				}, function(err : variant) : void{
					step["getCharas_jdat"]();
				});
			};
			step["getCharas_jdat"] = function() : void{
				// キャラクター情報送信セット
				jdat["list"] = charaInfoList;
				for(var i = 0; i < charaInfoList.length; i++){
					var code = charaInfoList[i]["code"] as string;
					cont["img_chara_icon_" + code] = "/img/character/" + code + "/icon.png";
					cont["img_chara_bust_" + code] = "/img/character/" + code + "/bust.png";
				}
				step["getPartner"]();
			};

			// ---------------- パートナー情報獲得
			var userStatusModel : UserStatusModel = null;
			step["getPartner"] = function() : void{
				// パートナー情報獲得
				UserStatusModel.findOne({userId: req.user._id}, function(err : variant, model : UserStatusModel) : void{
					userStatusModel = model;
					if(type == "partner"){
						// パートナー変更コマンド
						step["getPartner_change"]();
					}else{
						// 普通の情報取得
						step["getPartner_jdat"]();
					}
				});
			};
			step["getPartner_change"] = function() : void{
				// パートナー変更コマンド
				var charaId0 = req.query["charaId"] as string;
				// キャラクターの存在確認
				CharaDataModel.findById(charaId0, function(err : variant, model : CharaDataModel) : void{
					if(model != null){
						// パートナー情報更新
						var charaId1 = userStatusModel.partnerCharaId;
						userStatusModel.partnerCharaId = charaId0;
						var count = 3;
						userStatusModel.save(function(err : variant) : void{if(--count == 0){step["getPartner_jdat"]();}});
						model.partnerLock = true;
						model.save(function(err : variant) : void{if(--count == 0){step["getPartner_jdat"]();}});
						CharaDataModel.findById(charaId1, function(err : variant, model : CharaDataModel) : void{
							if(model != null){
								model.partnerLock = false;
								model.save(function(err : variant) : void{if(--count == 0){step["getPartner_jdat"]();}});
							}else{
								// そんなキャラクターは存在しなかった TODO エラー?
								if(--count == 0){step["getPartner_jdat"]();}
							}
						});
					}else{
						// そんなキャラクターは存在しなかった TODO エラー?
						step["getPartner_jdat"]();
					}
				});
			};
			step["getPartner_jdat"] = function() : void{
				// パートナー情報送信セット
				jdat["partner"] = userStatusModel.partnerCharaId;
				step["getTeams"]();
			};

			// ---------------- 編成情報獲得
			var teamModelList : TeamModel[] = null;
			var teamModel0 : TeamModel = null;
			var teamCharaDataModel0 : CharaDataModel = null;
			var teamCharaDataModel1 : CharaDataModel = null;
			step["getTeams"] = function() : void{
				TeamModel.find({userId: req.user._id}, function(err : variant, models : TeamModel[]) : void{
					teamModelList = models;
					if(type == "teamName" || type == "teamMember"){
						// 変更コマンド
						step["getTeams_change"]();
					}else{
						// 普通の情報取得
						step["getTeams_jdat"]();
					}
				});
			};
			step["getTeams_change"] = function() : void{
				// 変更コマンド時のチーム存在確認
				for(var i = 0; i < teamModelList.length; i++){
					if(teamModelList[i]._id == req.query["teamId"]){
						teamModel0 = teamModelList[i];
					}
				}
				if(teamModel0 != null){
					if(teamModel0.sortieLock){
						// 設定チームがロックされていた TODO エラー?
						step["getTeams_jdat"]();
					}else if(type == "teamName"){
						// チーム名変更コマンド
						step["getTeams_change_name"]();
					}else if(type == "teamMember"){
						// チームメンバー変更コマンド
						step["getTeams_change_member"]();
					}
				}else{
					// そんなチームは存在しなかった TODO エラー?
					step["getTeams_jdat"]();
				}
			};
			step["getTeams_change_name"] = function() : void{
				// チーム名変更コマンド
				teamModel0.name = req.query["name"] as string; // TODO タグとか
				teamModel0.save(function(err : variant) : void{
					step["getTeams_jdat"]();
				});
			};
			step["getTeams_change_member"] = function() : void{
				// チームメンバー変更コマンド キャラクターの存在確認
				var teamCharaId0 = req.query["charaId"] as string;
				var teamCharaId1 = "";
				switch(req.query["index"] as int){
					case 0: teamCharaId1 = teamModel0.memberCharaId1; break;
					case 1: teamCharaId1 = teamModel0.memberCharaId2; break;
					case 2: teamCharaId1 = teamModel0.memberCharaId3; break;
				}
				if(teamCharaId0 == teamCharaId1){
					// 何も起きない TODO エラー?
					step["getTeams_jdat"]();
				}else{
					var count = 0;
					if(teamCharaId0 != ""){count++;}
					if(teamCharaId1 != ""){count++;}
					if(teamCharaId0 != ""){CharaDataModel.findById(teamCharaId0, function(err : variant, model : CharaDataModel) : void{teamCharaDataModel0 = model; if(--count == 0){step["getTeams_change_member_checked"]();}});}
					if(teamCharaId1 != ""){CharaDataModel.findById(teamCharaId1, function(err : variant, model : CharaDataModel) : void{teamCharaDataModel1 = model; if(--count == 0){step["getTeams_change_member_checked"]();}});}
				}
			};
			step["getTeams_change_member_checked"] = function() : void{
				var teamModel1 : TeamModel = null;
				var teamIndex0 = req.query["index"] as int;
				var teamIndex1 = -1;
				// キャラクターの入れ替え確認
				if(teamCharaDataModel0 != null){
					for(var i = 0; i < teamModelList.length; i++){
						var temp = teamModelList[i];
						if(temp.memberCharaId1 == teamCharaDataModel0._id.toString()){teamModel1 = temp; teamIndex1 = 0; break;}
						if(temp.memberCharaId2 == teamCharaDataModel0._id.toString()){teamModel1 = temp; teamIndex1 = 1; break;}
						if(temp.memberCharaId3 == teamCharaDataModel0._id.toString()){teamModel1 = temp; teamIndex1 = 2; break;}
					}
				}
				if(teamModel1 != null && teamModel1.sortieLock){
					// 入れ替えチームがロックされていた TODO エラー?
					step["getTeams_jdat"]();
				}else{
					// 変更チーム情報更新
					var count = 1;
					var id = (teamCharaDataModel0 != null) ? teamCharaDataModel0._id : "";
					switch(teamIndex0){
						case 0: teamModel0.memberCharaId1 = id; break;
						case 1: teamModel0.memberCharaId2 = id; break;
						case 2: teamModel0.memberCharaId3 = id; break;
					}
					// 入れ替えチーム情報更新
					if(teamModel1 != null){
						var id = (teamCharaDataModel1 != null) ? teamCharaDataModel1._id : "";
						switch(teamIndex1){
							case 0: teamModel1.memberCharaId1 = id; break;
							case 1: teamModel1.memberCharaId2 = id; break;
							case 2: teamModel1.memberCharaId3 = id; break;
						}
						if(teamModel0 != teamModel1){count++;}
					}
					// キャラクターのチームソート情報更新
					if(teamCharaDataModel0 != null){teamCharaDataModel0.sortTeamIndex = (teamModel0 != null) ? teamModel0.index * 128 + teamIndex0 : 65535; count++;}
					if(teamCharaDataModel1 != null){teamCharaDataModel1.sortTeamIndex = (teamModel1 != null) ? teamModel1.index * 128 + teamIndex1 : 65535; count++;}
					// データベースアクセス
					teamModel0.save(function(err : variant) : void{if(--count == 0){step["getTeams_jdat"]();}});
					if(teamModel1 != null && teamModel0 != teamModel1){teamModel1.save(function(err : variant) : void{if(--count == 0){step["getTeams_jdat"]();}});}
					if(teamCharaDataModel0 != null){teamCharaDataModel0.save(function(err : variant) : void{if(--count == 0){step["getTeams_jdat"]();}});}
					if(teamCharaDataModel1 != null){teamCharaDataModel1.save(function(err : variant) : void{if(--count == 0){step["getTeams_jdat"]();}});}
				}
			};
			step["getTeams_jdat"] = function() : void{
				// 表示順ソート
				teamModelList.sort(function(t0 : Nullable.<TeamModel>, t1 : Nullable.<TeamModel>):number{return t0.index - t1.index;});
				// 編成情報送信セット
				var teamInfoList = new variant[];
				for(var i = 0; i < teamModelList.length; i++){
					var members = new string[];
					members.push(teamModelList[i].memberCharaId1);
					members.push(teamModelList[i].memberCharaId2);
					members.push(teamModelList[i].memberCharaId3);
					teamInfoList.push({
						id: teamModelList[i]._id,
						name: teamModelList[i].name,
						lock: teamModelList[i].sortieLock,
						members: members,
					});
				}
				jdat["teams"] = teamInfoList;
				step["send"]();
			};

			// ---------------- 送信
			step["send"] = function() : void{
				jdat["contents"] = ContentsServer.convertAddress(cont);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			};

			// プログラムステップ開始
			step["start"]();
		});
	}
}

