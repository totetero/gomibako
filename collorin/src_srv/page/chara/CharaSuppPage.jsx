import "../../require/express.jsx";

import "../../util/ImageServer.jsx";
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
						refbook: charaBase.refbookIndex,
						team: charaData.sortTeamIndex,
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
	}
}

