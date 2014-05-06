import "../../require/express.jsx";

import "../../util/ContentsServer.jsx";
import "../../models/User.jsx";
import "../../models/Character.jsx";

// キャラクター補給ページ
class CharaSuppPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/chara/supp", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var imgs = {} : Map.<string>;

			var step = {} : Map.<function():void>;
			step["start"] = function() : void{step["getCharas"]();};
			// キャラクター情報獲得
			var charaInfoList = new variant[];
			step["getCharas"] = function() : void{
				CharacterModelUtil.getUserCharaList(req.user, function(charaBase : CharaBaseModel, charaData : CharaDataModel) : void{
					// キャラクター情報獲得
					charaInfoList.push({
						id: charaData._id,
						name: charaBase.name,
						code: charaBase.imageCode,
						date: charaData.createDate,
						refbook: charaBase.refbookIndex,
						team: charaData.sortTeamIndex,
						level: charaData.level,
						favorite: charaData.favorite,
						partner: charaData.partnerLock,
					});
				}, function(err : variant) : void{
					step["getCharas_jdat"]();
				});
			};
			step["getCharas_jdat"] = function() : void{
				// キャラクター情報整理
				jdat["list"] = charaInfoList;
				for(var i = 0; i < charaInfoList.length; i++){
					var code = charaInfoList[i]["code"] as string;
					imgs["css_chara_icon_" + code] = "/img/character/" + code + "/icon.png";
					imgs["css_chara_bust_" + code] = "/img/character/" + code + "/bust.png";
				}
				step["send"]();
			};
			// 送信
			step["send"] = function() : void{
				imgs["css_core_chara_partner"] = "/img/system/character/partner.png";
				imgs["css_core_chara_favorite1"] = "/img/system/character/favorite1.png";
				imgs["css_core_chara_favorite2"] = "/img/system/character/favorite2.png";
				imgs["css_core_chara_favorite3"] = "/img/system/character/favorite3.png";
				imgs["css_core_chara_team1"] = "/img/system/character/team1.png";
				imgs["css_core_chara_team2"] = "/img/system/character/team2.png";
				imgs["css_core_chara_team3"] = "/img/system/character/team3.png";
				jdat["imgs"] = ContentsServer.convertAddress(imgs);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			};
			// プログラムステップ開始
			step["start"]();
		});
	}
}

