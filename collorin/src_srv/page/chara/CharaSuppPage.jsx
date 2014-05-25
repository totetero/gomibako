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
			var cont = {} : Map.<string>;

			// 所持可能キャラ数
			jdat["max"] = 100;

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
					cont["img_chara_icon_" + code] = "/img/character/" + code + "/icon.png";
					cont["img_chara_bust_" + code] = "/img/character/" + code + "/bust.png";
				}
				step["send"]();
			};
			// 送信
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

