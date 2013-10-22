import "js.jsx";

import "Game.jsx";
import "util/Ctrl.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// socket.io.jsラッパクラス

native __fake__ class _socketio{
	function on(command : string, f : function():void) : void;
	function on(command : string, f : function(uidx : int):void) : void;
	function on(command : string, f : function(wid : int, unum : int, uidx : int, udata : SocketUserData[]):void) : void;
	function on(command : string, f : function(keys : int[]):void) : void;
	function on(command : string, f : function(uidx : int, txt : string):void) : void;
	function emit(command : string, udata : SocketUserData) : void;
	function emit(command : string, key : int) : void;
	function emit(command : string, txt : string) : void;
}

class SocketUserData{
	var name : string;
	var type : int;
}

class Socket{
	static var socket : _socketio;
	static var connect : boolean;
	static var start : boolean;
	static var wid : int;
	static var unum : int;
	static var uidx : int;
	static var udata : SocketUserData[];
	static var keys : int[];

	// ----------------------------------------------------------------
	// 初期化
	static function init(name : string, type : int) : void{
		Socket.connect = false;
		Socket.start = false;

		if(js.eval("typeof io != 'undefined'") as boolean){
			var url = js.global["nodehost"] as string + ":" + js.global["nodeport"] as string;
			Socket.socket = js.eval("io.connect('" + url + "')") as __noconvert__ _socketio;

			// 接続切断
			Socket.socket.on('connect', function(){
				var udata = new SocketUserData();
				udata.name = name;
				udata.type = type;
				Socket.connect = true;
				Socket.socket.emit("entry", udata);
				log "サーバに接続したよ";

			});
			Socket.socket.on('disconnect', function(){Socket.connect = false; log "サーバが落ちたよ";});

			Socket.socket.on('wait', function(uidx : int){
				log "待機 " + uidx as string;
			});

			// ゲーム開始
			Socket.socket.on('start', function(wid : int, unum : int, uidx : int, udata : SocketUserData[]){
				log "開始 " + wid as string + " " + uidx as string;
				Socket.wid = wid;
				Socket.unum = unum;
				Socket.uidx = uidx;
				Socket.udata = udata;
				Socket.start = true;
				Socket.sendKey();
			});

			// キー情報受信
			Socket.socket.on('key', function(keys : int[]){
				Socket.keys = keys;
			});

			// チャット受信
			Socket.socket.on('msg', function(uidx : int, txt : string){
				Game.gpList[uidx].talk.setText(txt, 30);
			});

			// 切断
			Socket.socket.on('kill', function(uidx : int){
				log "切断 " + uidx as string;
				Game.gpList[uidx].exist = false;
			});

		}else{
			log "サーバに接続できなかったよ";
			Socket.wid = -1;
			Socket.unum = 1;
			Socket.uidx = 0;
			Socket.udata = new SocketUserData[];
			Socket.udata[0] = new SocketUserData();
			Socket.udata[0].type = type;
			Socket.start = true;
		}
	}

	// ----------------------------------------------------------------
	// キー情報送信
	static function sendKey() : void{
		var key = (Ctrl.kup ? (1 << 0) : 0) + (Ctrl.kdn ? (1 << 1) : 0) + (Ctrl.krt ? (1 << 2) : 0) +  (Ctrl.klt ? (1 << 3) : 0) + (Ctrl.k_z ? (1 << 4) : 0) + (Ctrl.k_x ? (1 << 5) : 0) + (Ctrl.k_s ? (1 << 6) : 0);
		var rot = (Ctrl.rotv * 360 / Math.PI) as int;
		while(rot < 0){rot += 720;}
		while(rot > 720){rot -= 720;}
		Socket.socket.emit("key", key + rot * 128);
	}

	// ----------------------------------------------------------------
	// チャット送信
	static function sendText(txt : string) : void{
		if(txt == "罵倒"){
			switch((Math.random() * 3) as int){
				case 0: txt = "ばーか"; break;
				case 1: txt = "あんぽんたん"; break;
				case 2: txt = "ジャガイモにも劣るわ"; break;
			}
		}
		if(Socket.connect){Socket.socket.emit("msg", txt);}
		else{Game.gpList[Socket.uidx].talk.setText(txt, 30);}
	}

	// ----------------------------------------------------------------
	// 計算
	static var prevTime : number = 0;
	static function calc(elapsed : number) : boolean{
		if((elapsed - Socket.prevTime) > 50){
			Socket.prevTime = elapsed;
			if(Socket.connect){
				if(Socket.keys != null){
					for(var i = 0; i < Socket.unum; i++){
						var key = Socket.keys[i] % 128;
						Game.gpList[i].kup = (key & (1 << 0)) > 0;
						Game.gpList[i].kdn = (key & (1 << 1)) > 0;
						Game.gpList[i].krt = (key & (1 << 2)) > 0;
						Game.gpList[i].klt = (key & (1 << 3)) > 0;
						Game.gpList[i].k_z = (key & (1 << 4)) > 0;
						Game.gpList[i].k_x = (key & (1 << 5)) > 0;
						Game.gpList[i].k_s = (key & (1 << 6)) > 0;
						Game.gpList[i].k_rotv = ((Socket.keys[i] / 128) as int) * Math.PI / 360;
					}
					Socket.keys = null;
					Socket.sendKey();
					return true;
				}
			}else{
				Game.gpList[Socket.uidx].kup = Ctrl.kup;
				Game.gpList[Socket.uidx].kdn = Ctrl.kdn;
				Game.gpList[Socket.uidx].krt = Ctrl.krt;
				Game.gpList[Socket.uidx].klt = Ctrl.klt;
				Game.gpList[Socket.uidx].k_z = Ctrl.k_z;
				Game.gpList[Socket.uidx].k_x = Ctrl.k_x;
				Game.gpList[Socket.uidx].k_s = Ctrl.k_s;
				Game.gpList[Socket.uidx].k_rotv = Ctrl.rotv;
				return true;
			}
		}
		return false;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

