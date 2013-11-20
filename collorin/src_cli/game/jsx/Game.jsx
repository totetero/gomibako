import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Main.jsx';
import 'Ctrl.jsx';
import 'EventCartridge.jsx';
import 'Field.jsx';
import 'Character.jsx';

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

		Main.slist.push(new ECfix(function(){
			// ボタン確認
			if(Cbtn.trigger_z){
				Cbtn.trigger_z = false;
				Cbtn.setBtn(true, "Z : サイコロ", "X : アイテム", "C : マップ", "Sp : メニュー");
			}
			if(Cbtn.trigger_x){
				Cbtn.trigger_x = false;
				Cbtn.setBtn(false, "ボタン1", "ボタン2", "", "");
			}

			// プレイヤー計算
			Game.player.calc();
			Ccvs.px = Game.player.x;
			Ccvs.py = Game.player.y;
		}));
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		Cbtn.draw();
		// 描画開始
		Ctrl.context.clearRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		Ctrl.context.fillStyle = "pink";
		Ctrl.context.fillRect(0, 0, Ctrl.canvas.width, Ctrl.canvas.height);
		// フィールド描画
		Game.field.draw(Ccvs.fx, Ccvs.fy);
		// プレイヤー描画準備
		Game.player.preDraw(Ccvs.fx, Ccvs.fy);
		// キャラクター描画
		DrawUnit.drawList(Game.clist);
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

