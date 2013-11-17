import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Main.jsx';
import 'Ctrl.jsx';
import 'EventCartridge.jsx';
import 'Field.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class Game{
	static var field : Field;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Game.field = new Field();

		Main.slist.push(new ECone(function(){
			log "test";
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
		Game.field.draw(Ccvs.fx, Ccvs.fy);
		// 描画test
		//Ctrl.context.drawImage(Main.imgs["player"], 0, 0);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

