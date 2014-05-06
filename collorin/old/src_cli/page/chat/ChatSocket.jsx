import "../../util/Loader.jsx";
import "../../util/Socket.jsx";

import "ChatCanvas.jsx";
import "ChatCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ソケット
class ChatSocket{
	var _socket : SocketIOClientSocket;
	var _socketof : SocketIOClientSocket;
	var _strayPacket = new variant[];
	var _sendDst : int[];
	var _sendSerif : string;

	// ----------------------------------------------------------------
	// 初期化
	function init(ccvs : ChatCanvas) : void{
		SocketIOClient.connect(function(socket : SocketIOClientSocket) : void{
			this._socket = socket;
			this._socketof = this._socket.of("chat");

			// ゲーム情報獲得
			this._socketof.on("entry", function(uid : variant, uinfoListData : variant, imgs : variant):void{
				Loader.loadContents(imgs as Map.<string>, function() : void{
					// 画像ロード完了
					var uinfoList = uinfoListData as variant[];
					for(var i = 0; i < uinfoList.length; i++){
						this._create(ccvs, uid, uinfoList[i]);
					}
				});
			});

			// ユーザー新規接続
			this._socketof.on("add", function(uinfo : variant, imgs : variant):void{
				Loader.loadContents(imgs as Map.<string>, function() : void{
					// 画像ロード完了
					this._create(ccvs, null, uinfo);
				});
			});

			// ユーザー位置更新
			this._socketof.on("walk", function(uid : variant, dst : variant):void{
				log "移動 " + uid as string + " " + dst[0] as string + " " + dst[1] as string + " " + dst[2] as string;
				var isUse = false;
				for(var i = 0; i < ccvs.member.length; i++){
					if(uid == ccvs.member[i].uid){
						var sx = Math.floor(ccvs.member[i].x / 16);
						var sy = Math.floor(ccvs.member[i].y / 16);
						ccvs.member[i].dstList = ccvs.pathFinder.getDstList(sx, sy, dst as int[]);
						isUse = true;
					}
				}
				// 迷子パケット
				if(!isUse){this._strayPacket.push({type: "talk", dst: dst});}
			});

			// ユーザー台詞更新
			this._socketof.on("talk", function(uid : variant, serif : variant):void{
				log "発言 " + uid as string + " " + serif as string;
				var isUse = false;
				for(var i = 0; i < ccvs.member.length; i++){
					if(uid == ccvs.member[i].uid){
						ccvs.member[i].setTalk(serif as string);
						isUse = true;
					}
				}
				// 迷子パケット
				if(!isUse){this._strayPacket.push({type: "talk", uid: uid, serif: serif});}
			});

			// ユーザー退出
			this._socketof.on("kill", function(uid : variant):void{
				log "退出 " + uid as string;
				var isUse = this._kill(ccvs, uid);
				// 迷子パケット
				if(!isUse){this._strayPacket.push({type: "kill", uid: uid});}
			});

			this._socketof.emit("entry");
		});
	}

	// ----------------------------------------------------------------
	// キャラクターを作成
	function _create(ccvs : ChatCanvas, uid : variant, uinfo : variant) : void{
		if(!this._strayPacketCheck(uinfo)){return;} // 迷子パケットの適用確認
		this._kill(ccvs, uinfo["uid"]); // uidが重複しているキャラクターがいたら除去
		var isPlayer = (uid == uinfo["uid"]);
		var type = (isPlayer ? "自分" : ((uid == null) ? "新規" : "継続"));
		log type + " " + uinfo["uid"] as string + " " + uinfo["serif"] as string;
		// キャラクター作成
		var character = new ChatCharacter(ccvs, uinfo);
		ccvs.member.push(character);
		if(isPlayer){ccvs.player = character;}
	}

	// ----------------------------------------------------------------
	// 指定したuidのキャラクターを除去
	function _kill(ccvs : ChatCanvas, uid : variant) : boolean{
		var isUse = false;
		for(var i = 0; i < ccvs.member.length; i++){
			if(uid == ccvs.member[i].uid){
				ccvs.member[i].dispose();
				ccvs.member.splice(i--, 1);
				isUse = true;
			}
		}
		return isUse;
	}

	// ----------------------------------------------------------------
	// 迷子パケットの適用確認
	function _strayPacketCheck(uinfo : variant) : boolean{
		var exist = true;
		for(var i = 0; i < this._strayPacket.length; i++){
			if(uinfo["uid"] == this._strayPacket[i]["uid"]){
				var type = this._strayPacket[i]["type"] as string;
				if(type == "walk"){
					// 移動
					uinfo["x"] = this._strayPacket[i]["dst"][0];
					uinfo["y"] = this._strayPacket[i]["dst"][1];
					uinfo["r"] = this._strayPacket[i]["dst"][2];
				}else if(type == "talk"){
					// 発言
					uinfo["serif"] = this._strayPacket[i]["serif"];
				}else if(type == "kill"){
					// 退出
					exist = false;
				}else{continue;}
				this._strayPacket.splice(i--, 1);
			}
		}
		return exist;
	}

	// ----------------------------------------------------------------
	// 位置送信
	function sendDestination(dst : int[]) : void{
		if(this._socket != null){
			if(dst != null && this._sendDst != dst){
				this._sendDst = dst;
				this._socketof.emit("walk", dst);
			}
		}
	}

	// ----------------------------------------------------------------
	// 台詞送信
	function sendSerif(serif : string) : void{
		if(this._socket != null){
			if(this._sendSerif != serif){
				this._sendSerif = serif;
				this._socketof.emit("talk", serif);
			}
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		if(this._socket != null){
			// ソケット切断
			this._socket.disconnect();
			this._socketof.removeAllListeners();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

