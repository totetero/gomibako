window.onload = function(){
	enchant();
	var game = new Game(320, 320);
	game.fps = 24;
	game.preload('key.png', 'btn.png', 'title.png', 'mapchip.png');
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

var MapVertexes = null;
var mapx = 5;
var mapy = 5;
var mapz = 5;
var map = [[
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
],[
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[4, 0, 0, 5, 0],
	[4, 4, 0, 0, 0],
],[
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 6, 0],
	[0, 0, 6, 5, 6],
	[4, 0, 0, 6, 0],
],[
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 6, 0],
	[0, 0, 6, 5, 6],
	[0, 0, 0, 6, 0],
],[
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 6, 0],
	[0, 0, 0, 0, 0],
]];

function getChip(x, y, z){
	if(x < 0 || mapx <= x){return 0;}
	if(y < 0 || mapy <= y){return 0;}
	if(z < 0 || mapz <= z){return 0;}
	return map[z][y][x];
}

function drawMap(img, matrix){
	var num = MapVertexes.length / 4
	for(var i = 0; i < num; i++){
		pushTriangle(img, matrix, MapVertexes[i * 4 + 0], MapVertexes[i * 4 + 1], MapVertexes[i * 4 + 3]);
		pushTriangle(img, matrix, MapVertexes[i * 4 + 1], MapVertexes[i * 4 + 2], MapVertexes[i * 4 + 3]);
	}
}

function createMapVertexes(){
	MapVertexes = new Array();
	for(var i = 0; i < mapx; i++){
		for(var j = 0; j < mapy; j++){
			for(var k = 0; k < mapz; k++){
				if(map[k][j][i] > 0){
					if(getChip(i, j, k + 1) <= 0){pushSurfaces(i, j, k, 1);}
					if(getChip(i, j, k - 1) <= 0){pushSurfaces(i, j, k, 2);}
					if(getChip(i, j + 1, k) <= 0){pushSurfaces(i, j, k, 3);}
					if(getChip(i, j - 1, k) <= 0){pushSurfaces(i, j, k, 4);}
					if(getChip(i + 1, j, k) <= 0){pushSurfaces(i, j, k, 5);}
					if(getChip(i - 1, j, k) <= 0){pushSurfaces(i, j, k, 6);}
				}
			}
		}
	}
}

function pushSurfaces(x0, y0, z0, s){
	var x1 = x0 + 1;
	var y1 = y0 + 1;
	var z1 = z0 + 1;
	var chip = map[z0][y0][x0] - 1;
	var u0 = (chip % 2) * 0.5;
	var v0 = Math.floor(chip / 2) * 0.25;
	var v1 = v0 + 0.25;
	switch(s){
		case 1:
			var u1 = u0 + 0.125;
			MapVertexes.push(new Vertex(x0, z1, y1, u0, v1));
			MapVertexes.push(new Vertex(x1, z1, y1, u1, v1));
			MapVertexes.push(new Vertex(x1, z1, y0, u1, v0));
			MapVertexes.push(new Vertex(x0, z1, y0, u0, v0));
			break;
		case 2:
			u0 = u0 + 0.375;
			var u1 = u0 + 0.125;
			MapVertexes.push(new Vertex(x0, z0, y0, u0, v1));
			MapVertexes.push(new Vertex(x1, z0, y0, u1, v1));
			MapVertexes.push(new Vertex(x1, z0, y1, u1, v0));
			MapVertexes.push(new Vertex(x0, z0, y1, u0, v0));
			break;
		case 3:
			u0 = u0 + 0.125;
			var u1 = u0 + 0.125;
			MapVertexes.push(new Vertex(x0, z0, y1, u0, v1));
			MapVertexes.push(new Vertex(x1, z0, y1, u1, v1));
			MapVertexes.push(new Vertex(x1, z1, y1, u1, v0));
			MapVertexes.push(new Vertex(x0, z1, y1, u0, v0));
			break;
		case 4:
			u0 = u0 + 0.125;
			var u1 = u0 + 0.125;
			MapVertexes.push(new Vertex(x1, z0, y0, u0, v1));
			MapVertexes.push(new Vertex(x0, z0, y0, u1, v1));
			MapVertexes.push(new Vertex(x0, z1, y0, u1, v0));
			MapVertexes.push(new Vertex(x1, z1, y0, u0, v0));
			break;
		case 5:
			u0 = u0 + 0.250;
			var u1 = u0 + 0.125;
			MapVertexes.push(new Vertex(x1, z0, y1, u0, v1));
			MapVertexes.push(new Vertex(x1, z0, y0, u1, v1));
			MapVertexes.push(new Vertex(x1, z1, y0, u1, v0));
			MapVertexes.push(new Vertex(x1, z1, y1, u0, v0));
			break;
		case 6:
			u0 = u0 + 0.250;
			var u1 = u0 + 0.125;
			MapVertexes.push(new Vertex(x0, z0, y0, u0, v1));
			MapVertexes.push(new Vertex(x0, z0, y1, u1, v1));
			MapVertexes.push(new Vertex(x0, z1, y1, u1, v0));
			MapVertexes.push(new Vertex(x0, z1, y0, u0, v0));
			break;
	}
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
	createMapVertexes();
	
	var tmpMat1 = new Object();
	var tmpMat2 = new Object();
	var tmpMat3 = new Object();
	
	var aspect = game.width / game.height;
	Mat44perspective(tmpMat1, aspect, 1, 1, 100);
	Mat44viewport(tmpMat2, 0, 0, game.width, game.height);
	Mat44mul(projectionMatrix, tmpMat1, tmpMat2);
	
	textureImage = game.assets['mapchip.png']._element; // -------- enchant.jsの内部仕様が変わったら使えなくなるかも
	
	sprite.addEventListener('enterframe', function(e){
		// フレーム処理
		Mat44rotY(tmpMat2, rotv);
		Mat44rotX(tmpMat3, roth);
		Mat44mul(tmpMat1, tmpMat2, tmpMat3);
		Mat44translate(tmpMat2, 0, 0, 8);
		Mat44mul(tmpMat3, tmpMat1, tmpMat2);
		Mat44translate(tmpMat2, -2.5, -2.5, -2.5);
		Mat44mul(tmpMat1, tmpMat2, tmpMat3);
		
		drawMap(textureImage, tmpMat1);
		
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
		surface1.draw(game.assets['key.png'], 0, 0, 112, 112, 0, 0, 112, 112);
		if(game.kup){surface1.draw(game.assets['key.png'], 112,  0, 48, 56, 32,  0, 48, 56);}
		if(game.kdn){surface1.draw(game.assets['key.png'], 168, 48, 48, 56, 32, 56, 48, 56);}
		if(game.krt){surface1.draw(game.assets['key.png'], 160,  0, 56, 48, 56, 32, 56, 48);}
		if(game.klt){surface1.draw(game.assets['key.png'], 112, 56, 56, 48,  0, 32, 56, 48);}
		
		// ボタンの描画
		surface2.draw(game.assets['btn.png'], 0, 0, 128,  96, 0, 0, 128,  96);
		if(game.k_z){surface2.draw(game.assets['btn.png'],  0, 96, 64, 64,  0, 32, 64, 64);}// z押し
		if(game.k_x){surface2.draw(game.assets['btn.png'], 64, 96, 64, 64, 64,  0, 64, 64);}// x押し
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

