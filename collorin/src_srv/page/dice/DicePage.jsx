import "../../require/nodejs.jsx";
import "../../require/express.jsx";
import "../../require/redis.jsx";

import "../../util/ImageServer.jsx";
import "../../models/User.jsx";
import "../../data/CharacterDrawInfo.jsx";

// test
import "../../../src_cli/util/mock/MockDice.jsx";

// マイページ
class DicePage{
	static var _rcli : RedisClient;
	static const _rhead = "dice:";

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, rcli : RedisClient) : void{
		DicePage._rcli = rcli;

		// -------- expressページ --------
		app.post("/dice", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			// test
			MockDice.loadxhr("/dice", req.body, function(response : variant) : void{
				response["imgs"] = ImageServer.convertAddress(response["imgs"] as Map.<string>);
				res.contentType("application/json").send(JSON.stringify(response));
			});
		});
	}
}

