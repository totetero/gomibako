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
import "Bb3dJumpCanvas.jsx";
import "Bb3dJumpCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ソケット
class SocketJump{
	var _socket : SocketIOClientSocket;
	var _socketof : SocketIOClientSocket;
	var _packet = new variant[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		Loading.show();
		SocketIOClient.connect(function(socket : SocketIOClientSocket) : void{
			this._socket = socket;
			this._socketof = this._socket.of("jump");

			// ゲーム情報獲得
			this._socketof.on("entry", function(uid : variant, uinfoListData : variant, contents : variant):void{
				Loader.loadContents(contents as Map.<string>, function() : void{
					// 画像ロード完了
					var uinfoList = uinfoListData as variant[];
					for(var i = 0; i < uinfoList.length; i++){
						this._packet.push({type: "add", uid: uid, uinfo: uinfoList[i]});
					}
					Loading.hide();
				});
			});

			// ユーザー新規接続
			this._socketof.on("add", function(uinfo : variant, contents : variant):void{
				Loader.loadContents(contents as Map.<string>, function() : void{
					// 画像ロード完了
					this._packet.push({type: "add", uid: "", uinfo: uinfo});
				});
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
	function calc(bcvs : Bb3dJumpCanvas) : void{
		// パケット処理
		for(var i = 0; i < this._packet.length; i++){
			var packet = this._packet[i];
			var type = packet["type"] as string;

			if(type == "add"){
				log "add " + packet["uinfo"]["uid"] as string;
			}else if(type == "kill"){
				log "kill " + packet["uid"] as string;
			}
		}
		// パケット完了
		if(this._packet.length > 0){this._packet.length = 0;}
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

