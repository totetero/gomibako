window.onload = function(){
	enchant();
	var game = new Game(320, 320);
	game.fps = 24;
	game.preload('key.png', 'btn.png', 'title.png', 'test.png');
	game.onload = function(){
		// ゲーム初期化
		game.pushScene(titleScene(game));
	}
	game.start();
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// タイトルシーン
function titleScene(game){
	var scene = new Scene();
	var sprite = new Sprite(game.width, game.height);
	sprite.image = game.assets['title.png'];
	sprite.addEventListener('touchend', function(e){
		// タッチしたとき
		game.pushScene(gameScene(game));
	});
	scene.addChild(sprite);
	return scene;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ゲームシーン
function gameScene(game){
	var scene = new Scene();
	var sprite = new Sprite(game.width, game.height);
	var surface = new Surface(game.width, game.height);
	var group = gameController(game, scene);
	sprite.image = surface;
	scene.addChild(sprite);
	scene.addChild(group);
	
	// 3d描画の初期化
	var rotv = 0;
	var roth = -0.7;
	var vect00 = new Vertex(-4,  4,  4, 0  , 0  );// 上
	var vect01 = new Vertex( 4,  4,  4, 0.5, 0  );
	var vect02 = new Vertex( 4,  4, -4, 0.5, 0.5);
	var vect03 = new Vertex(-4,  4, -4, 0  , 0.5);
	var vect10 = new Vertex(-4,  4, -4, 0  , 0.5);// 横1
	var vect11 = new Vertex( 4,  4, -4, 0.5, 0.5);
	var vect12 = new Vertex( 4, -4, -4, 0.5, 1  );
	var vect13 = new Vertex(-4, -4, -4, 0  , 1  );
	var vect20 = new Vertex(-4,  4,  4, 0.5, 0  );// 横2
	var vect21 = new Vertex(-4,  4, -4, 1  , 0  );
	var vect22 = new Vertex(-4, -4, -4, 1  , 0.5);
	var vect23 = new Vertex(-4, -4,  4, 0.5, 0.5);
	var vect30 = new Vertex( 4,  4, -4, 0.5, 0  );// 横3
	var vect31 = new Vertex( 4,  4,  4, 1  , 0  );
	var vect32 = new Vertex( 4, -4,  4, 1  , 0.5);
	var vect33 = new Vertex( 4, -4, -4, 0.5, 0.5);
	var vect40 = new Vertex( 4,  4,  4, 0  , 0.5);// 横4
	var vect41 = new Vertex(-4,  4,  4, 0.5, 0.5);
	var vect42 = new Vertex(-4, -4,  4, 0.5, 1  );
	var vect43 = new Vertex( 4, -4,  4, 0  , 1  );
	
	var tmpMat1 = new Object();
	var tmpMat2 = new Object();
	var tmpMat3 = new Object();
	
	var aspect = game.width / game.height;
	Mat44perspective(tmpMat1, aspect, 1, 1, 100);
	Mat44viewport(tmpMat2, 0, 0, game.width, game.height);
	Mat44mul(projectionMatrix, tmpMat1, tmpMat2);
	
	textureImage = game.assets['test.png']._element; // -------- enchant.jsの内部仕様が変わったら使えなくなるかも
	
	sprite.addEventListener('enterframe', function(e){
		// フレーム処理
		Mat44rotY(tmpMat2, rotv);
		Mat44rotX(tmpMat3, roth);
		Mat44mul(tmpMat1, tmpMat2, tmpMat3);
		Mat44translate(tmpMat2, 0, 0, 16);
		Mat44mul(tmpMat3, tmpMat1, tmpMat2);
		
		pushTriangle(textureImage, tmpMat3, vect00, vect01, vect03);
		pushTriangle(textureImage, tmpMat3, vect01, vect02, vect03);
		pushTriangle(textureImage, tmpMat3, vect10, vect11, vect13);
		pushTriangle(textureImage, tmpMat3, vect11, vect12, vect13);
		pushTriangle(textureImage, tmpMat3, vect20, vect21, vect23);
		pushTriangle(textureImage, tmpMat3, vect21, vect22, vect23);
		pushTriangle(textureImage, tmpMat3, vect30, vect31, vect33);
		pushTriangle(textureImage, tmpMat3, vect31, vect32, vect33);
		pushTriangle(textureImage, tmpMat3, vect40, vect41, vect43);
		pushTriangle(textureImage, tmpMat3, vect41, vect42, vect43);
		
		surface.context.fillStyle = "rgb(255, 255, 255)";
		surface.context.fillRect(0, 0, game.width, game.height);
		draw3d(surface.context);
	});
	
	var touchx;
	var touchy;
	var touchrv;
	var touchrh;
	
	// タッチ開始
	sprite.addEventListener('touchstart', function(e){
		touchx = e.x;
		touchy = e.y;
		touchrv = rotv;
		touchrh = roth;
	});
	
	// タッチ途中
	sprite.addEventListener('touchmove', function(e){
		rotv = touchrv - (e.x - touchx) * 0.03;
		roth = touchrh - (e.y - touchy) * 0.03;
	});
	
	// タッチ終了
	sprite.addEventListener('touchend', function(e){
		// タッチしたとき
		//game.popScene();
	});
	
	return scene;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ボタン操作スプライト
function gameController(game, scene){
	game.kup = 0;
	game.kdn = 0;
	game.krt = 0;
	game.klt = 0;
	game.k_z = 0;
	game.k_x = 0;
	
	var group = new Group();
	var sprite1 = new Sprite(112, 112);
	var sprite2 = new Sprite(128, 96);
	var surface1 = new Surface(112, 112);
	var surface2 = new Surface(128, 96);
	sprite1.image = surface1;
	sprite2.image = surface2;
	group.addChild(sprite1);
	group.addChild(sprite2);
	sprite1.x = 10;
	sprite1.y = game.height - 112 - 10;
	sprite2.x = game.width - 128 - 10;
	sprite2.y = game.height - 96 - 10;
	
	sprite1.addEventListener('enterframe', function(e){
		// フレーム処理
		surface1.clear();
		surface2.clear();
		
		// キーの方向確認
		var status1 = 0;
		if(game.kup && !game.kdn){
			if(game.krt && !game.klt){ // 右上
				status1 = 2; sprite1.rotation = 0;
			}else if(game.klt && !game.krt){ // 左上
				status1 = 2; sprite1.rotation = 270;
			}else{ // 上
				status1 = 1; sprite1.rotation = 0;
			}
		}else if(game.kdn && !game.kup){
			if(game.krt && !game.klt){ // 右下
				status1 = 2; sprite1.rotation = 90;
			}else if(game.klt && !game.krt){ // 左下
				status1 = 2; sprite1.rotation = 180;
			}else{ // 下
				status1 = 1; sprite1.rotation = 180;
			}
		}else if(game.krt && !game.klt){ // 右
			status1 = 1; sprite1.rotation = 90;
		}else if(game.klt && !game.krt){ // 左
			status1 = 1; sprite1.rotation = 270;
		}
		
		// キーの描画
		switch(status1){
			case 1: surface1.draw(game.assets['key.png'], 112, 0, 112, 112, 0, 0, 112, 112); break;
			case 2: surface1.draw(game.assets['key.png'], 224, 0, 112, 112, 0, 0, 112, 112); break;
			default: surface1.draw(game.assets['key.png'], 0, 0, 112, 112, 0, 0, 112, 112); break;
		}
		
		// ボタンの描画
		if(game.k_z && game.k_x){ // 同時押し
			surface2.draw(game.assets['btn.png'], 0, 288, 128,  96, 0, 0, 128,  96);
		}else if(game.k_z){ // z押し
			surface2.draw(game.assets['btn.png'], 0, 96, 128,  96, 0, 0, 128,  96);
		}else if(game.k_x){ // x押し
			surface2.draw(game.assets['btn.png'], 0, 192, 128,  96, 0, 0, 128,  96);
		}else{
			surface2.draw(game.assets['btn.png'], 0, 0, 128,  96, 0, 0, 128,  96);
		}
	});
	
	// キータッチ関数
	var keyFunction = function(e){
		var x = e.localX;
		var y = e.localY;
		if(40 < x && x < 72 && 0 < y && y < 40){
			game.kup = 1; game.kdn = game.krt = game.klt = 0; // 上
		}else if(40 < x && x < 72 && 72 < y && y < 112){
			game.kdn = 1; game.kup = game.krt = game.klt = 0; // 下
		}else if(72 < x && x < 112 && 40 < y && y < 72){
			game.krt = 1; game.kup = game.kdn = game.klt = 0; // 右
		}else if(0 < x && x < 40 && 40 < y && y < 72){
			game.klt = 1; game.kup = game.kdn = game.krt = 0; // 左
		}else if(72 < x && x < 112 && 0 < y && y < 40){
			game.kup = game.krt = 1; game.kdn = game.klt = 0; // 右上
		}else if(72 < x && x < 112 && 72 < y && y < 112){
			game.kdn = game.krt = 1; game.kup = game.klt = 0; // 右下
		}else if(0 < x && x < 40 && 0 < y && y < 40){
			game.kup = game.klt = 1; game.kdn = game.krt = 0; // 左上
		}else if(0 < x && x < 40 && 72 < y && y < 112){
			game.kdn = game.klt = 1; game.kup = game.krt = 0; // 左下
		}else{
			game.kup = game.kdn = game.krt = game.klt = 0;
		}
	}
	
	// ボタンタッチ関数
	var btnFunction = function(e){
		var x = e.localX;
		var y = e.localY;
		if(56 < x && x < 72 && 40 < y && y < 56){
			game.k_z = game.k_x = 1; // 同時押し
		}else if(0 < x && x < 64 && 32 < y && y < 96){
			game.k_z = 1; game.k_x = 0; // z押し
		}else if(64 < x && x < 128 && 0 < y && y < 64){
			game.k_x = 1; game.k_z = 0; // x押し
		}else{
			game.k_z = game.k_x = 0;
		}
	}
	
	// キータッチ開始
	sprite1.addEventListener('touchstart', keyFunction);
	// キータッチ途中
	sprite1.addEventListener('touchmove', keyFunction);
	// キータッチ終了
	sprite1.addEventListener('touchend', function(e){
		game.kup = game.kdn = game.krt = game.klt = 0;
	});
	
	// ボタンタッチ開始
	sprite2.addEventListener('touchstart', btnFunction);
	// ボタンタッチ途中
	sprite2.addEventListener('touchmove', btnFunction);
	// ボタンタッチ終了
	sprite2.addEventListener('touchend', function(e){
		game.k_z = game.k_x = 0;
	});
	
	// キーボード入力
	game.keybind(37, 'left');
	game.keybind(38, 'up');
	game.keybind(39, 'right');
	game.keybind(40, 'down');
	game.keybind(90, 'a');
	game.keybind(88, 'b');
	scene.addEventListener('upbuttondown', function(e){game.kup = 1;});
	scene.addEventListener('upbuttonup', function(e){game.kup = 0;});
	scene.addEventListener('downbuttondown', function(e){game.kdn = 1;});
	scene.addEventListener('downbuttonup', function(e){game.kdn = 0;});
	scene.addEventListener('rightbuttondown', function(e){game.krt = 1;});
	scene.addEventListener('rightbuttonup', function(e){game.krt = 0;});
	scene.addEventListener('leftbuttondown', function(e){game.klt = 1;});
	scene.addEventListener('leftbuttonup', function(e){game.klt = 0;});
	scene.addEventListener('abuttondown', function(e){game.k_z = 1;});
	scene.addEventListener('abuttonup', function(e){game.k_z = 0;});
	scene.addEventListener('bbuttondown', function(e){game.k_x = 1;});
	scene.addEventListener('bbuttonup', function(e){game.k_x = 0;});
	
	return group;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

