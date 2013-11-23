import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Main.jsx';
import 'Ctrl.jsx';
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
		Ccvs.px = Ccvs.fx = Game.player.x;
		Ccvs.py = Ccvs.fy = Game.player.y;

		Main.slist.push(new ECmain());
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		Cbtn.draw();
		// 描画開始
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		// フィールド描画
		Game.field.draw(Ccvs.fx, Ccvs.fy);
		// プレイヤー描画準備
		Game.player.preDraw(Ccvs.fx, Ccvs.fy);
		// キャラクター描画
		DrawUnit.drawList(Game.clist);
	}
}

// メインイベントカートリッジ
class ECmain extends EventCartridge{
	// コンストラクタ
	function constructor(){
	}

	// 初期化
	override function init() : void{
		// ボタンの設定
		Cbtn.setBtn(true, "Z : サイコロ", "X : アイテム", "C : マップ", "Sp : メニュー");
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
			Main.slist.push(new ECdice(1, function():void{
				// さいころ投げる時
			}, function():void{
				// さいころキャンセル時
				Main.slist.push(new ECmain());
			}));
			return false;
		}

		// プレイヤー計算
		Game.player.calc();
		Ccvs.px = Game.player.x;
		Ccvs.py = Game.player.y;

		return true;
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
		this.x = 100;
		this.y = 100;
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

