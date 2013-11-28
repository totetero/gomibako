import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Main.jsx';
import 'Ctrl.jsx';
import 'Message.jsx';
import 'EventCartridge.jsx';
import 'Field.jsx';
import 'Character.jsx';
import 'Dice.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class Game{
	static var field : Field;
	static var player : Player;
	static var clist : DrawUnit[];

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Game.field = new Field();
		Game.clist = new DrawUnit[];
		Game.player = new Player();
		Ccvs.cx0 = Ccvs.cx1 = Game.player.x;
		Ccvs.cy0 = Ccvs.cy1 = Game.player.y;

		EventCartridge.serialPush(new ECmain());
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// 描画開始
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		// フィールド描画
		Game.field.draw(Ccvs.cx0, Ccvs.cy0);
		// プレイヤー描画準備
		Game.player.preDraw(Ccvs.cx0, Ccvs.cy0);
		// キャラクター描画
		DrawUnit.drawList(Game.clist);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインイベントカートリッジ
class ECmain extends EventCartridge{
	// 初期化
	override function init() : void{
		// ボタンの設定
		Cbtn.setBtn(-1, "Z : サイコロ", "X : アイテム", "C : マップ", "Sp : メニュー");
		Cbtn.trigger_z = false;
		Cbtn.trigger_x = false;
		Cbtn.trigger_c = false;
		Cbtn.trigger_s = false;
	}

	// 計算
	override function calc() : boolean{
		// ボタン確認
		if(Cbtn.trigger_z){
			// さいころボタン
			EventCartridge.serialPush(new ECdice(function(pip : int) : void{
				// さいころ投げた時
				EventCartridge.serialPush(new ECmove(pip));
				EventCartridge.serialPush(new ECmain());
			}, function():void{
				// さいころキャンセル時
				EventCartridge.serialPush(new ECmain());
			}));
			return false;
		}else if(Cbtn.trigger_c){
			// マップ表示ボタン
			EventCartridge.serialCutting(new ECmap());
			return false;
		}

		return true;
	}
}

// マップ表示イベントカートリッジ
class ECmap extends EventCartridge{
	// 初期化
	override function init() : void{
		// マップモード設定
		Ccvs.mapFlag = true;
		// ボタンの設定
		Cbtn.setBtn(0, "", "X : 戻る", "", "");
		Cbtn.trigger_x = false;
	}

	// 計算
	override function calc() : boolean{
		// ボタン確認
		if(Cbtn.trigger_x){
			Ccvs.mapFlag = false;
			return false;
		}

		return true;
	}
}

// 移動イベントカートリッジ
class ECmove extends EventCartridge{
	var _pip : int;

	var _dstList : int[][];
	var _srcList : int[][];

	var _ecAssist : ECmove.ECassist = null;

	// コンストラクタ
	function constructor(pip : int){
		this._pip = pip;
		this._dstList = new int[][];
		this._srcList = new int[][];
	}

	// 初期化
	override function init() : void{
		// ボタンの設定
		Cbtn.setBtn(1, "", "X : 一つ戻る", "C : マップ", "Sp : メニュー");
		Cbtn.trigger_x = false;
		Cbtn.trigger_c = false;
		Cbtn.trigger_s = false;

		Message.setMsg("あと" + this._pip + "マス");

		// 補助クラス登録
		if(this._ecAssist == null){
			this._ecAssist = new ECmove.ECassist(this);
			EventCartridge.parallelPush(this._ecAssist);
		}
	}

	// 計算
	override function calc() : boolean{
		if(Cbtn.trigger_c){
			// マップ表示ボタン
			EventCartridge.serialCutting(new ECmap());
			return false;
		}else if(this._dstList.length > 0){
			// ヘックス目的地に向かう
			// 補助クラスに任せる
		}else if(Cbtn.trigger_x){
			// 一つ戻るボタン
			Cbtn.trigger_x = false;
			if(this._srcList.length > 0){
				this._pip++;
				this._dstList.unshift(this._srcList.shift());
				Message.setMsg("あと" + this._pip + "マス");
			}
		}else if(this._pip > 0){
			// ヘックス目的地の十字キー指定
			var dir = 0;
			var moveFlag = true;
			if     (Cbtn.krt && Cbtn.kup){dir = 1.75;}
			else if(Cbtn.klt && Cbtn.kup){dir = 1.25;}
			else if(Cbtn.klt && Cbtn.kdn){dir = 0.75;}
			else if(Cbtn.krt && Cbtn.kdn){dir = 0.25;}
			else if(Cbtn.krt){dir = 0.00;}
			else if(Cbtn.kup){dir = 1.50;}
			else if(Cbtn.klt){dir = 1.00;}
			else if(Cbtn.kdn){dir = 0.50;}
			else{moveFlag = false;}
			if(moveFlag){
				// プレイヤーの現在座標
				var pos = Game.field.getHexFromCoordinate(Game.player.x, Game.player.y);
				var x = pos.x;
				var y = pos.y;
				// 周囲の存在するヘックスを調べる
				var movable0 = (Game.field.getHexFromIndex(x + 1, y + 0).type > 0);
				var movable1 = (Game.field.getHexFromIndex(x + 0, y + 1).type > 0);
				var movable2 = (Game.field.getHexFromIndex(x - 1, y + 1).type > 0);
				var movable3 = (Game.field.getHexFromIndex(x - 1, y + 0).type > 0);
				var movable4 = (Game.field.getHexFromIndex(x + 0, y - 1).type > 0);
				var movable5 = (Game.field.getHexFromIndex(x + 1, y - 1).type > 0);
				// 角度を使いやすい形に変換する
				dir = 180 * (dir - Ccvs.rotv / Math.PI);
				while(dir < 0){dir += 360;}
				while(dir > 360){dir -= 360;}
				// 十字キーの先のヘックスを調べる
				var index = -1;
				if(movable0 && (dir < 30 + 45 || 330 - 45 < dir)){index = 0;}
				//if(movable1 &&  30 - 45 < dir && dir <  90 + 45){index = (index < 0) ? 1 : 6;}
				if(movable1 && (dir < 90 + 45 || 30 - 45 + 360 < dir)){index = (index < 0) ? 1 : 6;}
				if(movable2 &&  90 - 45 < dir && dir < 150 + 45){index = (index < 0) ? 2 : 6;}
				if(movable3 && 150 - 45 < dir && dir < 210 + 45){index = (index < 0) ? 3 : 6;}
				if(movable4 && 210 - 45 < dir && dir < 270 + 45){index = (index < 0) ? 4 : 6;}
				//if(movable5 && 270 - 45 < dir && dir < 330 + 45){index = (index < 0) ? 5 : 6;}
				if(movable5 && (dir < 330 + 45 - 360 || 270 - 45 < dir)){index = (index < 0) ? 5 : 6;}
				// 移動可能なヘックスに移動する
				switch(index){
					case 0: this._dstList.unshift([x + 1, y + 0] : int[]); break;
					case 1: this._dstList.unshift([x + 0, y + 1] : int[]); break;
					case 2: this._dstList.unshift([x - 1, y + 1] : int[]); break;
					case 3: this._dstList.unshift([x - 1, y + 0] : int[]); break;
					case 4: this._dstList.unshift([x + 0, y - 1] : int[]); break;
					case 5: this._dstList.unshift([x + 1, y - 1] : int[]); break;
					default: moveFlag = false; Game.player.r = dir / 180 * Math.PI; break;
				}
				// テスト
				if(moveFlag){
					if(this._srcList.length > 0){
						if(this._dstList[0][0] == this._srcList[0][0] && this._dstList[0][1] == this._srcList[0][1]){
							this._pip++;
							this._srcList.shift();
						}else{
							this._pip--;
							this._srcList.unshift([x, y] : int[]);
						}
					}else{
						this._pip--;
						this._srcList.unshift([x, y] : int[]);
					}
					Message.setMsg("あと" + this._pip + "マス");
				}
			}
		}else{
			// 移動完了
			Message.setMsg("");
			this._ecAssist = null;
			return false;
		}

		return true;
	}

	// 補助クラス
	class ECassist extends EventCartridge{
		var _parent : ECmove;
		// コンストラクタ
		function constructor(parentEC : ECmove){this._parent = parentEC;}
		// 計算
		override function calc() : boolean{
			if(this._parent._dstList.length > 0){
				// ヘックス目的地に向かう
				var px = Game.field.calcHexCoordx(this._parent._dstList[0][0], this._parent._dstList[0][1]);
				var py = Game.field.calcHexCoordy(this._parent._dstList[0][0], this._parent._dstList[0][1]);
				var x = px - Game.player.x;
				var y = py - Game.player.y;
				var speed = 3.0;
				if(x * x + y * y < speed * speed){
					Game.player.x = px;
					Game.player.y = py;
					this._parent._dstList.shift();
				}else{
					Game.player.r = Math.atan2(y, x);
					Game.player.x += speed * Math.cos(Game.player.r);
					Game.player.y += speed * Math.sin(Game.player.r);
				}
				Ccvs.cx1 = Game.player.x;
				Ccvs.cy1 = Game.player.y;
				Game.player.action++;
			}else{
				Game.player.action = 0;
			}
			return (this._parent._ecAssist != null);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
class Player{
	var character : DrawPlayer;
	var x : number;
	var y : number;
	var r : number;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this.character = new DrawPlayer(Main.imgs["player"]);
		Game.clist.push(this.character);
		this.x = Game.field.calcHexCoordx(2, 2);
		this.y = Game.field.calcHexCoordy(2, 2);
		this.r = Math.PI * 0.5;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		this.action++;
		if     (Cbtn.krt && Cbtn.kup){this.r = Math.PI * 1.74 - Ccvs.rotv;}
		else if(Cbtn.klt && Cbtn.kup){this.r = Math.PI * 1.26 - Ccvs.rotv;}
		else if(Cbtn.klt && Cbtn.kdn){this.r = Math.PI * 0.74 - Ccvs.rotv;}
		else if(Cbtn.krt && Cbtn.kdn){this.r = Math.PI * 0.26 - Ccvs.rotv;}
		else if(Cbtn.krt){this.r = Math.PI * 0.00 - Ccvs.rotv;}
		else if(Cbtn.kup){this.r = Math.PI * 1.50 - Ccvs.rotv;}
		else if(Cbtn.klt){this.r = Math.PI * 1.00 - Ccvs.rotv;}
		else if(Cbtn.kdn){this.r = Math.PI * 0.50 - Ccvs.rotv;}
		else{this.action = 0;}
		if(this.action > 0){
			var speed = 3;
			this.x += speed * Math.cos(this.r);
			this.y += speed * Math.sin(this.r);
		}
		Ccvs.cx1 = Game.player.x;
		Ccvs.cy1 = Game.player.y;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number) : void{
		this.character.preDraw(this.x - x, this.y - y, 0, this.r, 1.2);
		this.character.setPose(this.action);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

