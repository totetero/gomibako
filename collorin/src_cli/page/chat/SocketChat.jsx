import 'js/web.jsx';

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "../../util/Socket.jsx";

import "Bb3dChatCanvas.jsx";
import "Bb3dChatCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ソケット
class SocketChat{
	var _socket : SocketIOClientSocket;
	var _socketof : SocketIOClientSocket;
	var _packet = new variant[];
	var _strayPacket = new variant[];
	var _sendDst : int[];
	var _sendSerif : string;

	// 一定間隔の通信
	var _nextCount : int = 0;
	// プレイヤー次の移動先
	var nextDst : int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		Loading.show();
		SocketIOClient.connect(function(socket : SocketIOClientSocket) : void{
			this._socket = socket;
			this._socketof = this._socket.of("chat");

			// ゲーム情報獲得
			this._socketof.on("entry", function(uid : variant, uinfoListData : variant, contents : variant):void{
				Loader.loadContents(contents as Map.<string>, function() : void{
					// 画像ロード完了
					var uinfoList = uinfoListData as variant[];
					for(var i = 0; i < uinfoList.length; i++){
						this._packet.push({type: "add", uid: uid, uinfo: uinfoList[i]});
					}
				});
			});

			// ユーザー新規接続
			this._socketof.on("add", function(uinfo : variant, contents : variant):void{
				Loader.loadContents(contents as Map.<string>, function() : void{
					// 画像ロード完了
					this._packet.push({type: "add", uid: "", uinfo: uinfo});
				});
			});

			// ユーザー位置更新
			this._socketof.on("walk", function(uid : variant, dst : variant):void{
				this._packet.push({type: "walk", uid: uid, dst: dst});
			});

			// ユーザー台詞更新
			this._socketof.on("talk", function(uid : variant, serif : variant):void{
				this._packet.push({type: "talk", uid: uid, serif: serif});
			});

			// ユーザー退出
			this._socketof.on("kill", function(uid : variant):void{
				this._packet.push({type: "kill", uid: uid});
			});

			this._socketof.emit("entry");
		});
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(bcvs : Bb3dChatCanvas) : void{
		// パケット処理
		for(var i = 0; i < this._packet.length; i++){
			var packet = this._packet[i];
			var type = packet["type"] as string;
			var uid = packet["uid"] as string;

			if(type == "add"){
				// ---------------- 追加 ----------------
				var uinfo = packet["uinfo"] as variant;
				// uidが重複しているキャラクターがいたら除去
				for(var j = 0; j < bcvs.member.length; j++){
					if(uid == bcvs.member[j].uid){
						bcvs.member[j].dispose();
						bcvs.member.splice(j, 1);
					}
				}
				// 迷子パケットの適用確認
				var isKill = false;
				for(var j = 0; j < this._strayPacket.length; j++){
					var strayPacket = this._strayPacket[j];
					if(uinfo["uid"] == strayPacket["uid"]){
						var type = strayPacket["type"] as string;
						if(type == "walk"){
							// 移動
							uinfo["x"] = strayPacket["dst"][0];
							uinfo["y"] = strayPacket["dst"][1];
							uinfo["r"] = strayPacket["dst"][2];
						}else if(type == "talk"){
							// 発言
							uinfo["serif"] = strayPacket["serif"];
						}else if(type == "kill"){
							// 退出
							isKill = true;
						}
						this._strayPacket.splice(i--, 1);
					}
				}
				if(isKill){continue;}
				// キャラクター作成
				var isPlayer = (uid == uinfo["uid"]);
				var type = (isPlayer ? "自分" : ((uid == "") ? "新規" : "継続"));
				log type + " " + uinfo["uid"] as string + " " + uinfo["serif"] as string;
				var character = new Bb3dChatCharacter(bcvs, uinfo);
				bcvs.member.push(character);
				if(isPlayer){
					bcvs.player = character;
					Loading.hide();
				}
			}else{
				// 対象キャラ確認
				var isUse = false;
				for(var j = 0; j < bcvs.member.length; j++){
					if(uid == bcvs.member[j].uid){
						if(type == "walk"){
							// ---------------- 移動 ----------------
							var dst = packet["dst"] as int[];
							log "移動 " + uid + " " + dst[0] + " " + dst[1] + " " + dst[2];
							var sx = Math.floor(bcvs.member[j].x / 16);
							var sy = Math.floor(bcvs.member[j].y / 16);
							bcvs.member[j].dstList = bcvs.pathFinder.getDstList(sx, sy, dst);
						}else if(type == "talk"){
							// ---------------- 発言 ----------------
							var serif = packet["serif"] as string;
							log "発言 " + uid + " " + serif;
							bcvs.member[j].setTalk(serif);
						}else if(type == "kill"){
							// ---------------- 退出 ----------------
							log "退出 " + uid as string;
							bcvs.member[j].dispose();
							bcvs.member.splice(j--, 1);
						}
						isUse = true;
					}
				}
				// 迷子パケット保管
				if(!isUse){this._strayPacket.push(packet);}
			}
		}
		// パケット完了
		if(this._packet.length > 0){this._packet.length = 0;}

		// 一定間隔毎に位置の通信
		if((this._nextCount++) % 30 == 0){
			this.sendDestination(this.nextDst);
		}
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

