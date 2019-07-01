// 本ソースコードと"btn.png", "key.png"のライセンスはMITライセンスではなく
// バンザイライセンスです。ソースコードの一部もしくは全部を使用したものを配布するまえに
// 「ばんじゃーい」と3回叫んでください。叫ばないと再配布権がないので誰も見てなくても叫んで下さい。
// 作者は、ソフトウェアに関してなんら責任を負いません。

// コントローラー構造体
var ctrlStruct = new Object();
ctrlStruct.kup = 0;
ctrlStruct.kdn = 0;
ctrlStruct.krt = 0;
ctrlStruct.klt = 0;
ctrlStruct.k_z = 0;
ctrlStruct.k_x = 0;
ctrlStruct.rotv = 0;
ctrlStruct.roth = -0.3;

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コントローラー ボタン操作スプライト
function initController(game, scene, sprite){
	var group = new Group();
	var sprite1 = new Sprite(112, 112);
	var sprite2 = new Sprite(128, 96);
	var surface1 = new Surface(112, 112);
	var surface2 = new Surface(128, 96);
	
	sprite1.image = surface1;
	sprite2.image = surface2;
	group.addChild(sprite1);
	group.addChild(sprite2);
	scene.addChild(group);
	sprite1.x = 10;
	sprite1.y = game.height - 112 - 10;
	sprite2.x = game.width - 128 - 10;
	sprite2.y = game.height - 96 - 10;
	
	sprite1.addEventListener('enterframe', function(e){
		// フレーム処理
		surface1.clear();
		surface2.clear();
		
		// キーの方向確認
		surface1.draw(game.assets['img/key.png'], 0, 0, 112, 112, 0, 0, 112, 112);
		if(ctrlStruct.kup){surface1.draw(game.assets['img/key.png'], 112,  0, 48, 56, 32,  0, 48, 56);}
		if(ctrlStruct.kdn){surface1.draw(game.assets['img/key.png'], 168, 48, 48, 56, 32, 56, 48, 56);}
		if(ctrlStruct.krt){surface1.draw(game.assets['img/key.png'], 160,  0, 56, 48, 56, 32, 56, 48);}
		if(ctrlStruct.klt){surface1.draw(game.assets['img/key.png'], 112, 56, 56, 48,  0, 32, 56, 48);}
		
		// ボタンの描画
		surface2.draw(game.assets['img/btn.png'], 0, 0, 128,  96, 0, 0, 128,  96);
		if(ctrlStruct.k_z){surface2.draw(game.assets['img/btn.png'],  0, 96, 64, 64,  0, 32, 64, 64);}// z押し
		if(ctrlStruct.k_x){surface2.draw(game.assets['img/btn.png'], 64, 96, 64, 64, 64,  0, 64, 64);}// x押し
	});
	
	// ----------------------------------------------------------------
	
	// キータッチ関数
	var keyFunction = function(e){
		var x = e.localX;
		var y = e.localY;
		if(40 < x && x < 72 && 0 < y && y < 40){
			ctrlStruct.kup = 1; ctrlStruct.kdn = ctrlStruct.krt = ctrlStruct.klt = 0; // 上
		}else if(40 < x && x < 72 && 72 < y && y < 112){
			ctrlStruct.kdn = 1; ctrlStruct.kup = ctrlStruct.krt = ctrlStruct.klt = 0; // 下
		}else if(72 < x && x < 112 && 40 < y && y < 72){
			ctrlStruct.krt = 1; ctrlStruct.kup = ctrlStruct.kdn = ctrlStruct.klt = 0; // 右
		}else if(0 < x && x < 40 && 40 < y && y < 72){
			ctrlStruct.klt = 1; ctrlStruct.kup = ctrlStruct.kdn = ctrlStruct.krt = 0; // 左
		}else if(72 < x && x < 112 && 0 < y && y < 40){
			ctrlStruct.kup = ctrlStruct.krt = 1; ctrlStruct.kdn = ctrlStruct.klt = 0; // 右上
		}else if(72 < x && x < 112 && 72 < y && y < 112){
			ctrlStruct.kdn = ctrlStruct.krt = 1; ctrlStruct.kup = ctrlStruct.klt = 0; // 右下
		}else if(0 < x && x < 40 && 0 < y && y < 40){
			ctrlStruct.kup = ctrlStruct.klt = 1; ctrlStruct.kdn = ctrlStruct.krt = 0; // 左上
		}else if(0 < x && x < 40 && 72 < y && y < 112){
			ctrlStruct.kdn = ctrlStruct.klt = 1; ctrlStruct.kup = ctrlStruct.krt = 0; // 左下
		}else if(50 < x && x < 62 && 50 < y && y < 62){
			ctrlStruct.kup = ctrlStruct.kdn = ctrlStruct.krt = ctrlStruct.klt = 0; // 中心
		}else if(40 < x && x < 72 && 40 < y && y < 72){
			var xx = x - 56;
			var yy = y - 56;
			if(xx > yy && xx < -yy){ctrlStruct.kup = 1; ctrlStruct.kdn = ctrlStruct.krt = ctrlStruct.klt = 0;} // 上
			if(xx < yy && xx > -yy){ctrlStruct.kdn = 1; ctrlStruct.kup = ctrlStruct.krt = ctrlStruct.klt = 0;} // 下
			if(xx > yy && xx > -yy){ctrlStruct.krt = 1; ctrlStruct.kup = ctrlStruct.kdn = ctrlStruct.klt = 0;} // 右
			if(xx < yy && xx < -yy){ctrlStruct.klt = 1; ctrlStruct.kup = ctrlStruct.kdn = ctrlStruct.krt = 0;} // 左
		}else{
			ctrlStruct.kup = ctrlStruct.kdn = ctrlStruct.krt = ctrlStruct.klt = 0; // 押していない
		}
	}
	
	// ボタンタッチ関数
	var btnFunction = function(e){
		var x = e.localX;
		var y = e.localY;
		if(56 < x && x < 72 && 40 < y && y < 56){
			ctrlStruct.k_z = ctrlStruct.k_x = 1; // 同時押し
		}else if(0 < x && x < 64 && 32 < y && y < 96){
			ctrlStruct.k_z = 1; ctrlStruct.k_x = 0; // z押し
		}else if(64 < x && x < 128 && 0 < y && y < 64){
			ctrlStruct.k_x = 1; ctrlStruct.k_z = 0; // x押し
		}else{
			ctrlStruct.k_z = ctrlStruct.k_x = 0;
		}
	}
	
	// キータッチ開始
	sprite1.addEventListener('touchstart', keyFunction);
	// キータッチ途中
	sprite1.addEventListener('touchmove', keyFunction);
	// キータッチ終了
	sprite1.addEventListener('touchend', function(e){
		ctrlStruct.kup = ctrlStruct.kdn = ctrlStruct.krt = ctrlStruct.klt = 0;
	});
	
	// ボタンタッチ開始
	sprite2.addEventListener('touchstart', btnFunction);
	// ボタンタッチ途中
	sprite2.addEventListener('touchmove', btnFunction);
	// ボタンタッチ終了
	sprite2.addEventListener('touchend', function(e){
		ctrlStruct.k_z = ctrlStruct.k_x = 0;
	});
	
	// キーボード入力
	game.keybind(37, 'left');
	game.keybind(38, 'up');
	game.keybind(39, 'right');
	game.keybind(40, 'down');
	game.keybind(90, 'a');
	game.keybind(88, 'b');
	scene.addEventListener('upbuttondown', function(e){ctrlStruct.kup = 1;});
	scene.addEventListener('upbuttonup', function(e){ctrlStruct.kup = 0;});
	scene.addEventListener('downbuttondown', function(e){ctrlStruct.kdn = 1;});
	scene.addEventListener('downbuttonup', function(e){ctrlStruct.kdn = 0;});
	scene.addEventListener('rightbuttondown', function(e){ctrlStruct.krt = 1;});
	scene.addEventListener('rightbuttonup', function(e){ctrlStruct.krt = 0;});
	scene.addEventListener('leftbuttondown', function(e){ctrlStruct.klt = 1;});
	scene.addEventListener('leftbuttonup', function(e){ctrlStruct.klt = 0;});
	scene.addEventListener('abuttondown', function(e){ctrlStruct.k_z = 1;});
	scene.addEventListener('abuttonup', function(e){ctrlStruct.k_z = 0;});
	scene.addEventListener('bbuttondown', function(e){ctrlStruct.k_x = 1;});
	scene.addEventListener('bbuttonup', function(e){ctrlStruct.k_x = 0;});
	
	// ----------------------------------------------------------------
	var touchx;
	var touchy;
	var touchrv;
	var touchrh;
	var roth_max = Math.PI / 180 * 80;
	
	// タッチ開始
	sprite.addEventListener('touchstart', function(e){
		touchx = e.x;
		touchy = e.y;
		touchrv = ctrlStruct.rotv;
		touchrh = ctrlStruct.roth;
	});
	
	// タッチ途中
	sprite.addEventListener('touchmove', function(e){
		ctrlStruct.rotv = touchrv + (e.x - touchx) * 0.03;
		ctrlStruct.roth = touchrh + (e.y - touchy) * 0.03;
		
		if(ctrlStruct.roth >  roth_max){ctrlStruct.roth =  roth_max;}
		if(ctrlStruct.roth < -roth_max){ctrlStruct.roth = -roth_max;}
	});
	
	// ----------------------------------------------------------------
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

