import "../../require/nodejs.jsx";
import "../../require/express.jsx";
import "../../require/redis.jsx";

import "../../util/ContentsServer.jsx";
import "../../models/User.jsx";

// test
import "MockDice.jsx";

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
				response["imgs"] = ContentsServer.convertAddress(response["imgs"] as Map.<string>);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(response));
			});
		});
	}
}

