import "../../require/express.jsx";

import "../../util/ImageServer.jsx";
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
			var imgs = {} : Map.<string>;
			var type = "get";

			// 受信パラメータ確認
			if(typeof req.query == "object"){
				switch(req.query["type"] as string){
					case "partner": type = "partner"; break; // charaId
					case "teamName": type = "teamName"; break; // teamId name
					case "teamMember": type = "teamMember"; break; // teamId index charaId
				}
			}

			var step = {} : Map.<function():void>;
			step["start"] = function() : void{
				if(type == "get"){
					step["getCharas1"]();
				}else{
					step["getPartner1"]();
				}
			};
			// ---------------- キャラクター情報獲得
			var charaInfoList = new variant[];
			step["getCharas1"] = function() : void{
				// キャラクター情報獲得
				CharacterModelUtil.getUserCharaList(req.user, function(charaBase : CharaBaseModel, charaData : CharaDataModel) : void{
					charaInfoList.push({
						id: charaData._id,
						name: charaBase.name,
						code: charaBase.imageCode,
						date: charaData.createDate,
						refbook: charaBase.refbookIndex,
						level: charaData.level,
					});
				}, function(err : variant) : void{
					step["getCharas2"]();
				});
			};
			step["getCharas2"] = function() : void{
				// キャラクター情報送信セット
				jdat["list"] = charaInfoList;
				for(var i = 0; i < charaInfoList.length; i++){
					var code = charaInfoList[i]["code"] as string;
					imgs["css_icon_" + code] = "/img/character/" + code + "/icon.png";
					imgs["css_bust_" + code] = "/img/character/" + code + "/bust.png";
				}
				step["getPartner1"]();
			};
			// ---------------- パートナー情報獲得
			var userStatusModel : UserStatusModel = null;
			step["getPartner1"] = function() : void{
				// パートナー情報獲得
				UserStatusModel.findOne({userId: req.user._id}, function(err : variant, model : UserStatusModel) : void{
					userStatusModel = model;
					if(type == "partner"){
						// パートナー変更コマンド
						step["getPartner2"]();
					}else{
						// 普通の情報取得
						step["getPartner3"]();
					}
				});
			};
			step["getPartner2"] = function() : void{
				// パートナー変更コマンド
				var charaId = req.query["charaId"] as string;
				// キャラクターの存在確認
				CharaDataModel.findById(charaId, function(err : variant, model : CharaDataModel) : void{
					if(model != null){
						// パートナー情報更新
						userStatusModel.partnerCharaId = charaId;
						userStatusModel.save(function(err : variant) : void{
							step["getPartner3"]();
						});
					}else{
						// そんなキャラクターは存在しなかった TODO エラー?
						step["getPartner3"]();
					}
				});
			};
			step["getPartner3"] = function() : void{
				// パートナー情報送信セット
				jdat["partner"] = userStatusModel.partnerCharaId;
				step["getTeams1"]();
			};
			// ---------------- 編成情報獲得
			var teamModelList : TeamModel[] = null;
			var teamModel : TeamModel= null;
			step["getTeams1"] = function() : void{
				TeamModel.find({userId: req.user._id}, function(err : variant, models : TeamModel[]) : void{
					teamModelList = models;
					if(type == "teamName" || type == "teamMember"){
						// 変更コマンド
						step["getTeams2"]();
					}else{
						// 普通の情報取得
						step["getTeams5"]();
					}
				});
			};
			step["getTeams2"] = function() : void{
				// 変更コマンド時のチーム存在確認
				for(var i = 0; i < teamModelList.length; i++){
					if(teamModelList[i]._id == req.query["teamId"]){
						teamModel = teamModelList[i];
					}
				}
				if(teamModel != null){
					if(type == "teamName"){
						// チーム名変更コマンド
						step["getTeams3"]();
					}else if(type == "teamMember"){
						// チームメンバー変更コマンド
						step["getTeams4"]();
					}
				}else{
					// そんなチームは存在しなかった TODO エラー?
					step["getTeams5"]();
				}
			};
			step["getTeams3"] = function() : void{
				// チーム名変更コマンド
				teamModel.name = req.query["name"] as string; // TODO タグとか
				teamModel.save(function(err : variant) : void{
					step["getTeams5"]();
				});
			};
			step["getTeams4"] = function() : void{
				// チームメンバー変更コマンド
				var charaId = req.query["charaId"] as string;
				if(charaId != ""){
					// キャラクターの存在確認
					CharaDataModel.findById(charaId, function(err : variant, model : CharaDataModel) : void{
						if(model != null){
							var index = req.query["index"] as int;
							var changedCharaId = "";
							var changedTeamModel : TeamModel = null;
							var changedindex = -1;

							// キャラクターの入れ替え確認
							switch(index){
								case 0: changedCharaId = teamModel.memberCharaId1; break;
								case 1: changedCharaId = teamModel.memberCharaId2; break;
								case 2: changedCharaId = teamModel.memberCharaId3; break;
							}
							for(var i = 0; i < teamModelList.length; i++){
								var temp = teamModelList[i];
								if(temp.memberCharaId1 == charaId){temp.memberCharaId1 = changedCharaId; changedTeamModel = temp; changedindex = 0; break;}
								if(temp.memberCharaId2 == charaId){temp.memberCharaId2 = changedCharaId; changedTeamModel = temp; changedindex = 1; break;}
								if(temp.memberCharaId3 == charaId){temp.memberCharaId3 = changedCharaId; changedTeamModel = temp; changedindex = 2; break;}
							}

							// チーム情報更新
							switch(index){
								case 0: teamModel.memberCharaId1 = charaId; break;
								case 1: teamModel.memberCharaId2 = charaId; break;
								case 2: teamModel.memberCharaId3 = charaId; break;
							}
							if(changedTeamModel != null && changedTeamModel != teamModel){
								var count = 2;
								changedTeamModel.save(function(err : variant) : void{
									if(--count == 0){step["getTeams5"]();}
								});
								teamModel.save(function(err : variant) : void{
									if(--count == 0){step["getTeams5"]();}
								});
							}else{
								teamModel.save(function(err : variant) : void{
									step["getTeams5"]();
								});
							}

							// キャラクターのチームソート情報更新 厳密である必要ないので処理待ちしない
							model.sortTeamIndex = teamModel.index * 3 + index;
							model.save(function(err : variant) : void{});
							if(changedCharaId != ""){
								CharaDataModel.findById(changedCharaId, function(err : variant, model : CharaDataModel) : void{
									if(model != null){
										model.sortTeamIndex = changedTeamModel.index * 3 + changedindex;
										model.save(function(err : variant) : void{});
									}
								});
							}
						}else{
							// そんなキャラクターは存在しなかった TODO エラー?
							step["getTeams5"]();
						}
					});
				}else{
					// キャラクターはずす
					var changedCharaId = "";
					switch(req.query["index"] as int){
						case 0: changedCharaId = teamModel.memberCharaId1; teamModel.memberCharaId1 = charaId; break;
						case 1: changedCharaId = teamModel.memberCharaId2; teamModel.memberCharaId2 = charaId; break;
						case 2: changedCharaId = teamModel.memberCharaId3; teamModel.memberCharaId3 = charaId; break;
					}
					teamModel.save(function(err : variant) : void{
						step["getTeams5"]();
					});

					// キャラクターのチームソート情報更新 厳密である必要ないので処理待ちしない
					CharaDataModel.findById(changedCharaId, function(err : variant, model : CharaDataModel) : void{
						if(model != null){
							model.sortTeamIndex = 65535;
							model.save(function(err : variant) : void{});
						}
					});
				}
			};
			step["getTeams5"] = function() : void{
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
						lock: teamModelList[i].lock,
						members: members,
					});
				}
				jdat["teams"] = teamInfoList;
				step["send"]();
			};
			// ---------------- 送信
			step["send"] = function() : void{
				jdat["imgs"] = ImageServer.convertAddress(imgs);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			};
			// プログラムステップ開始
			step["start"]();
		});
	}
}

