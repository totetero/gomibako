import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Main.jsx';
import 'Ctrl.jsx';
import 'Status.jsx';
import 'EventCartridge.jsx';
import 'Field.jsx';
import 'Character.jsx';
import 'Dice.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ゲーム変数
class Game{
	static var field : Field;
	static var player : Player;
	static var clist : DrawUnit[];
}

// ゲームクラス
class ECgame extends EventCartridge{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		Game.field = new Field();
		Game.clist = new DrawUnit[];
		Game.player = new Player();
		Ccvs.cx0 = Ccvs.cx1 = Game.player.x;
		Ccvs.cy0 = Ccvs.cy1 = Game.player.y;
		Ccvs.mode = 0;
		Ccvs.scale = 1;
		Ccvs.roth = Math.PI / 180 * 45;

		Status.setChara(Main.b64imgs["pstand"]);

		EventCartridge.serialPush(new ECmain());
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// 描画開始
		Ccvs.context.clearRect(0, 0, Ccvs.canvas.width, Ccvs.canvas.height);
		// フィールド描画
		Game.field.draw(Ccvs.cx0, Ccvs.cy0);
		// キャラクター描画
		Game.player.preDraw(Ccvs.cx0, Ccvs.cy0);
		DrawUnit.drawList(Game.clist);
		// さいころ描画
		ECdice.drawDice();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// メインループイベントカートリッジ

// メインイベントカートリッジ
class ECmain extends EventCartridge{
	// 初期化
	override function init() : void{
		// ボタンの設定
		Status.setBtn(-1, "サイコロ", "", "マップ", "メニュー");
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
		}else if(Cbtn.trigger_s){
			// メニュー表示ボタン
			EventCartridge.serialCutting(new ECmenu());
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
		Status.setBtn(1, "", "一歩戻る", "マップ", "メニュー");
		Cbtn.trigger_x = false;
		Cbtn.trigger_c = false;
		Cbtn.trigger_s = false;

		Status.setMsg("あと" + this._pip + "マス");

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
		}else if(Cbtn.trigger_s){
			// メニュー表示ボタン
			EventCartridge.serialCutting(new ECmenu());
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
				Status.setMsg("あと" + this._pip + "マス");
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
					Status.setMsg("あと" + this._pip + "マス");
				}
			}
		}else{
			// 移動完了
			Status.setMsg("");
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
// 割り込み系イベントカートリッジ

// メニュー表示イベントカートリッジ
class ECmenu extends EventCartridge{
	var _div0 : HTMLDivElement;
	var _div1 : HTMLDivElement;
	var _div2 : HTMLDivElement;
	var _m1sbtn : HTMLDivElement;
	var _m1ebtn : HTMLDivElement;
	var _m1cbtn : HTMLDivElement;
	var _m2ybtn : HTMLDivElement;
	var _m2nbtn : HTMLDivElement;

	var _mode : int = 1;
	var _button : int = 0;
	var _mdn : boolean = false;

	// 初期化
	override function init() : void{
		// DOM獲得
		this._div0 = dom.document.getElementsByClassName("jsx_ecmenu menu").item(0) as HTMLDivElement;
		this._div1 = this._div0.getElementsByClassName("menu1").item(0) as HTMLDivElement;
		this._div2 = this._div0.getElementsByClassName("menu2").item(0) as HTMLDivElement;
		this._m1sbtn = this._div1.getElementsByClassName("btn sound").item(0) as HTMLDivElement;
		this._m1ebtn = this._div1.getElementsByClassName("btn exit").item(0) as HTMLDivElement;
		this._m1cbtn = this._div1.getElementsByClassName("btn close").item(0) as HTMLDivElement;
		this._m2ybtn = this._div2.getElementsByClassName("btn yes").item(0) as HTMLDivElement;
		this._m2nbtn = this._div2.getElementsByClassName("btn no").item(0) as HTMLDivElement;
		this._div0.style.display = "block";
		// マップモード設定
		Ccvs.mode = -1;
		// ボタンの設定
		Status.setBtn(-1, "", "", "", "");
	}

	// 計算
	override function calc() : boolean{
		// ボタン範囲の確認
		var btnid = 1;
		if(Ccvs.mx < 0 || 320 < Ccvs.mx || Ccvs.my < 0 || 320 < Ccvs.my){
			btnid = 0;
		}else if(Math.abs(this._mode) == 1){
			var b1 = this._m1sbtn.getBoundingClientRect();
			var b2 = this._m1ebtn.getBoundingClientRect();
			var b3 = this._m1cbtn.getBoundingClientRect();
			if(b1.left < Ctrl.mx && Ctrl.mx < b1.right && b1.top < Ctrl.my && Ctrl.my < b1.bottom){btnid = 101;}
			else if(b2.left < Ctrl.mx && Ctrl.mx < b2.right && b2.top < Ctrl.my && Ctrl.my < b2.bottom){btnid = 102;}
			else if(b3.left < Ctrl.mx && Ctrl.mx < b3.right && b3.top < Ctrl.my && Ctrl.my < b3.bottom){btnid = 103;}
		}else if(Math.abs(this._mode) == 2){
			var b1 = this._m2ybtn.getBoundingClientRect();
			var b2 = this._m2nbtn.getBoundingClientRect();
			if(b1.left < Ctrl.mx && Ctrl.mx < b1.right && b1.top < Ctrl.my && Ctrl.my < b1.bottom){btnid = 201;}
			else if(b2.left < Ctrl.mx && Ctrl.mx < b2.right && b2.top < Ctrl.my && Ctrl.my < b2.bottom){btnid = 202;}
		}
		// 一通りの端末で動作確認するまでコメントとして残しておく
		//if(Ccvs.mx < 0 || 320 < Ccvs.mx || Ccvs.my < 0 || 320 < Ccvs.my){
		//	btnid = 0;
		//}else if(Math.abs(this._mode) == 1){
		//	if(60 < Ccvs.mx && Ccvs.mx < 260){
		//		if(110 < Ccvs.my && Ccvs.my < 140){btnid = 101;}
		//		else if(180 < Ccvs.my && Ccvs.my < 210){btnid = 102;}
		//		else if(250 < Ccvs.my && Ccvs.my < 280){btnid = 103;}
		//	}
		//}else if(Math.abs(this._mode) == 2){
		//	if(100 < Ccvs.mx && Ccvs.mx < 220){
		//		if(140 < Ccvs.my && Ccvs.my < 170){btnid = 201;}
		//		else if(230 < Ccvs.my && Ccvs.my < 260){btnid = 202;}
		//	}
		//}

		// マウスクリックの確認
		if(this._mdn != Ctrl.mdn){
			this._mdn = Ctrl.mdn;
			if(!this._mdn){
				if(btnid == 101){
					// 音系
				}else if(btnid == 102){
					// 中断確認
					this._mode = 2;
				}else if(btnid == 0 || btnid == 103 || btnid == 202){
					// メニューを閉じる
					this._div0.style.display = "none";
					Ccvs.mode = 0;
					return false;
				}else if(btnid == 201){
					// 中断
					this._mode = 3;
					dom.document.location.href = "/exit";
				}
			}
		}

		// ボタン押下状態の確認
		if(!this._mdn){btnid = 1;}
		if(Math.abs(this._button) != btnid){this._button = btnid;}

		return true;
	}

	// 描画
	override function draw() : void{
		// モードによる表示非表示
		if(this._mode == 1){
			this._div1.style.display = "block";
			this._div2.style.display = "none";
			this._mode = -1;
		}else if(this._mode == 2){
			this._div1.style.display = "none";
			this._div2.style.display = "block";
			this._mode = -2;
		}else if(this._mode == 3){
			this._div1.style.display = "none";
			this._div2.style.display = "none";
			this._mode = -3;
		}

		// ボタン押下状態の描画
		if(this._button > 0){
			this._m1sbtn.className = (this._button == 101) ? "btn sound hover" : "btn sound";
			this._m1ebtn.className = (this._button == 102) ? "btn exit hover" : "btn exit";
			this._m1cbtn.className = (this._button == 103) ? "btn close hover" : "btn close";
			this._m2ybtn.className = (this._button == 201) ? "btn yes hover" : "btn yes";
			this._m2nbtn.className = (this._button == 202) ? "btn no hover" : "btn no";
			this._button *= -1;
		}
	}
}


// マップ表示イベントカートリッジ
class ECmap extends EventCartridge{
	// 初期化
	override function init() : void{
		// マップモード設定
		Ccvs.mode = 1;
		// ボタンの設定
		Status.setBtn(0, "", "戻る", "", "");
		Cbtn.trigger_x = false;
	}

	// 計算
	override function calc() : boolean{
		// ボタン確認
		if(Cbtn.trigger_x){
			Ccvs.mode = 0;
			return false;
		}

		return true;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
class Player{
	var character : DrawCharacter;
	var x : number;
	var y : number;
	var r : number;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this.character = new DrawCharacter(Main.imgs["pdot"], "test", "test");
		Game.clist.push(this.character);
		this.x = Game.field.calcHexCoordx(2, 2);
		this.y = Game.field.calcHexCoordy(2, 2);
		this.r = Math.PI * 1.5;
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

		if(this.action > 0){
			// 移動
			this.character.setPose("walk", ((this.action / 6) as int) % 4);
		}else{
			// 静止
			this.character.setPose("stand", 0);
		}
		
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

