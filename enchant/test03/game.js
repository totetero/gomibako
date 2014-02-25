window.onload = function(){
	enchant();
	var game = new Game(320, 320);
	game.fps = 24;
	game.preload('key.png', 'btn.png', 'title.png', 'mapchip.png', 'ball.png', 'shadow.png');
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
	sprite.image = surface;
	scene.addChild(sprite);
	
	scene.addChild(gameController(game, scene));
	touchRotater(sprite);
	
	// 3d描画の初期化

	createMapVertexes();
	
	var player = new Player();
	var sv0 = new Vertex( -0.3, 0.1,  0.3, 0, 1);
	var sv1 = new Vertex(  0.3, 0.1,  0.3, 1, 1);
	var sv2 = new Vertex(  0.3, 0.1, -0.3, 1, 0);
	var sv3 = new Vertex( -0.3, 0.1, -0.3, 0, 0);
	
	var tmpMat1 = new Object();
	var tmpMat2 = new Object();
	var tmpMat3 = new Object();
	var worldMat = new Object();
	var aspect = game.width / game.height;
	Mat44perspective(tmpMat1, aspect, 1, 1, 100);
	Mat44viewport(tmpMat2, 0, 0, game.width, game.height);
	Mat44mul(engineStruct.projectionMatrix, tmpMat2, tmpMat1);
	
	textureImage1 = game.assets['mapchip.png']._element; // -------- enchant.jsの内部仕様が変わったら使えなくなるかも
	textureImage2 = game.assets['ball.png']._element;
	textureImage3 = game.assets['shadow.png']._element;
	
	sprite.addEventListener('enterframe', function(e){
		// フレーム処理
		
		player.calc();
		if(player.z < -30){
			player.x = 2.5;
			player.y = 2.5;
			player.z = 6;
			player.mode = 0;
			player.velh = 0;
			player.velv = 0;
		}
		
		Mat44rotY(tmpMat2, ctrlStruct.rotv);
		Mat44rotX(tmpMat3, ctrlStruct.roth);
		Mat44mul(tmpMat1, tmpMat3, tmpMat2);
		Mat44translate(tmpMat2, 0, 0, 8);
		Mat44mul(worldMat, tmpMat2, tmpMat1);
		
		var z = player.z > 0 ? -player.z : 0;
		Mat44translate(tmpMat2, -player.x, z, -player.y);
		Mat44mul(tmpMat1, worldMat, tmpMat2);
		drawMap(textureImage1, tmpMat1);
		
		z = player.z > 0 ? 0 : player.z;
		player.draw(textureImage2, worldMat, 0, z, 0);
		if(player.height >= 0){
			Mat44translate(tmpMat2, 0, -player.height, 0);
			Mat44mul(tmpMat1, worldMat, tmpMat2);
			pushTriangle(textureImage3, tmpMat1, sv0, sv1, sv3);
			pushTriangle(textureImage3, tmpMat1, sv1, sv2, sv3);
		}
		
		surface.context.fillStyle = "rgb(255, 255, 255)";
		surface.context.fillRect(0, 0, game.width, game.height);
		draw3d(surface.context);
	});
	
	return scene;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 地形構造体
var mapStruct = new Object();
mapStruct.vertexes = null;
mapStruct.x = 5;
mapStruct.y = 5;
mapStruct.z = 5;
mapStruct.map = [[
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
],[
	[0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0],
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
	[0, 0, 0, 0, 7],
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

// マップチップの範囲外チェック
function getMapChip(x, y, z){
	if(x < 0 || mapStruct.x <= x){return 0;}
	if(y < 0 || mapStruct.y <= y){return 0;}
	if(z < 0 || mapStruct.z <= z){return 0;}
	return mapStruct.map[z][y][x];
}

// マップチップの透過チェック
function isMapChipVisible(x, y, z){
	return getMapChip(x, y, z) != 0;
}

// マップチップのあたりチェック
function isMapChipHit(x, y, z){
	var chip = getMapChip(x, y, z);
	return chip != 0 && chip != 6;
}
function isMapChipHit2(x, y, z0, z1){return isMapChipHit(x, y, z0) || isMapChipHit(x, y, z1);}


// 地形の頂点配列作成
function createMapVertexes(){
	mapStruct.vertexes = new Array();
	for(var i = 0; i < mapStruct.x; i++){
		for(var j = 0; j < mapStruct.y; j++){
			for(var k = 0; k < mapStruct.z; k++){
				if(mapStruct.map[k][j][i] > 0){
					if(!isMapChipVisible(i, j, k + 1)){pushSurfaces(i, j, k, 1);}
					if(!isMapChipVisible(i, j, k - 1)){pushSurfaces(i, j, k, 2);}
					if(!isMapChipVisible(i, j + 1, k)){pushSurfaces(i, j, k, 3);}
					if(!isMapChipVisible(i, j - 1, k)){pushSurfaces(i, j, k, 4);}
					if(!isMapChipVisible(i + 1, j, k)){pushSurfaces(i, j, k, 5);}
					if(!isMapChipVisible(i - 1, j, k)){pushSurfaces(i, j, k, 6);}
				}
			}
		}
	}
}

// 面の頂点配列作成
function pushSurfaces(x0, y0, z0, s){
	var x1 = x0 + 1;
	var y1 = y0 + 1;
	var z1 = z0 + 1;
	var chip = mapStruct.map[z0][y0][x0] - 1;
	var u0 = (chip % 2) * 0.5;
	var v0 = Math.floor(chip / 2) * 0.25;
	var v1 = v0 + 0.25;
	switch(s){
		case 1:
			var u1 = u0 + 0.125;
			mapStruct.vertexes.push(new Vertex(x0, z1, y1, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y1, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y0, u1, v0));
			mapStruct.vertexes.push(new Vertex(x0, z1, y0, u0, v0));
			break;
		case 2:
			u0 = u0 + 0.375;
			var u1 = u0 + 0.125;
			mapStruct.vertexes.push(new Vertex(x0, z0, y0, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y0, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y1, u1, v0));
			mapStruct.vertexes.push(new Vertex(x0, z0, y1, u0, v0));
			break;
		case 3:
			u0 = u0 + 0.125;
			var u1 = u0 + 0.125;
			mapStruct.vertexes.push(new Vertex(x0, z0, y1, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y1, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y1, u1, v0));
			mapStruct.vertexes.push(new Vertex(x0, z1, y1, u0, v0));
			break;
		case 4:
			u0 = u0 + 0.125;
			var u1 = u0 + 0.125;
			mapStruct.vertexes.push(new Vertex(x1, z0, y0, u0, v1));
			mapStruct.vertexes.push(new Vertex(x0, z0, y0, u1, v1));
			mapStruct.vertexes.push(new Vertex(x0, z1, y0, u1, v0));
			mapStruct.vertexes.push(new Vertex(x1, z1, y0, u0, v0));
			break;
		case 5:
			u0 = u0 + 0.250;
			var u1 = u0 + 0.125;
			mapStruct.vertexes.push(new Vertex(x1, z0, y1, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y0, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y0, u1, v0));
			mapStruct.vertexes.push(new Vertex(x1, z1, y1, u0, v0));
			break;
		case 6:
			u0 = u0 + 0.250;
			var u1 = u0 + 0.125;
			mapStruct.vertexes.push(new Vertex(x0, z0, y0, u0, v1));
			mapStruct.vertexes.push(new Vertex(x0, z0, y1, u1, v1));
			mapStruct.vertexes.push(new Vertex(x0, z1, y1, u1, v0));
			mapStruct.vertexes.push(new Vertex(x0, z1, y0, u0, v0));
			break;
	}
}

// 頂点配列から地形描画
function drawMap(img, matrix){
	var num = mapStruct.vertexes.length / 4
	for(var i = 0; i < num; i++){
		pushTriangle(img, matrix, mapStruct.vertexes[i * 4 + 0], mapStruct.vertexes[i * 4 + 1], mapStruct.vertexes[i * 4 + 3]);
		pushTriangle(img, matrix, mapStruct.vertexes[i * 4 + 1], mapStruct.vertexes[i * 4 + 2], mapStruct.vertexes[i * 4 + 3]);
	}
}

// あたり判定
function mapCollision(character, r, h){
	// 垂直軸あたり判定
	var x0 = Math.floor(character.x);
	var y0 = Math.floor(character.y);
	var z0 = Math.floor(character.z);
	var z1 = Math.floor(character.z + h);
	character.ground = false;
	if(isMapChipHit(x0, y0, z0)){
		// 下方向
		character.ground = true;
		character.z = z0 + 0.99;
		if(character.velv < 0){character.velv = 0;}
	}else if(isMapChipHit(x0, y0, z1)){
		// 上方向
		character.z = z1 - h - 0.01;
		if(character.velv > 0){character.velv = 0;}
	}
	
	// 高さ測定
	if(!character.ground){
		for(var i = z0; i >= 0; i--){
			if(isMapChipHit(x0, y0, i)){break;}
		}
		if(i == -1){
			character.height = -1;
		}else{
			character.height = character.z - i - 1;
		}
	}else{
		character.height = 0;
	}
	
	// 水平軸直角あたり判定
	var x1 = Math.floor(character.x + r);
	var y1 = Math.floor(character.y + r);
	var x2 = Math.floor(character.x - r);
	var y2 = Math.floor(character.y - r);
	z0 = Math.floor(character.z + 0.02);
	z1 = Math.floor(character.z + h);
	if(isMapChipHit2(x1, y0, z0, z1)){character.x = x1 - r;}// x軸正方向
	else if(isMapChipHit(x2, y0, z0, z1)){character.x = x2 + r + 1;}// x軸負方向
	if(isMapChipHit2(x0, y1, z0, z1)){character.y = y1 - r;}// y軸正方向
	else if(isMapChipHit2(x0, y2, z0, z1)){character.y = y2 + r + 1;}// y軸負方向
	
	// 水平軸斜めあたり判定
	x1 = character.x - x0;
	y1 = character.y - y0;
	x2 = x0 + 1 - character.x;
	y2 = y0 + 1 - character.y;
	var rr = r * r;
	var dd = x1 * x1 + y1 * y1;
	if(dd < rr && isMapChipHit2(x0 - 1, y0 - 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x += x1 * d;
		character.y += y1 * d;
	}
	dd = x2 * x2 + y1 * y1;
	if(dd < rr && isMapChipHit2(x0 + 1, y0 - 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x -= x2 * d;
		character.y += y1 * d;
	}
	dd = x1 * x1 + y2 * y2;
	if(dd < rr && isMapChipHit2(x0 - 1, y0 + 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x += x1 * d;
		character.y -= y2 * d;
	}
	dd = x2 * x2 + y2 * y2;
	if(dd < rr && isMapChipHit2(x0 + 1, y0 + 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x -= x2 * d;
		character.y -= y2 * d;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ビルボード構造体
var billBoardStruct = new Object();
billBoardStruct.tmpMat1 = new Object();
billBoardStruct.tmpMat2 = new Object();
billBoardStruct.tmpMat3 = new Object();

// キャラクター体勢の描画
function drawCharacter(img, mat, id, size, x, y, z, r){
	// ワールド座標系拡大回転移動
	Mat44translate(billBoardStruct.tmpMat1, x, y, z);
	Mat44mul(billBoardStruct.tmpMat3, mat, billBoardStruct.tmpMat1);
	Mat44rotY(billBoardStruct.tmpMat2, -r);
	Mat44mul(billBoardStruct.tmpMat1, billBoardStruct.tmpMat3, billBoardStruct.tmpMat2);
	Mat44scale(billBoardStruct.tmpMat2, size, size, size);
	Mat44mul(billBoardStruct.tmpMat3, billBoardStruct.tmpMat1, billBoardStruct.tmpMat2);
	switch(id){
		case 0:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.50, r);// 歩き1
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.25, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.05, -0.08, 0.12, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.05,  0.08, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.05, -0.16, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.05,  0.16, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.48, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.48, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.38, r); break;
		case 1:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.52, r);// 歩き2
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.27, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.00, -0.08, 0.11, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.00,  0.08, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.02, -0.18, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.02,  0.18, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.50, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.50, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.40, r); break;
		case 2:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.50, r);// 歩き3
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.25, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.05, -0.08, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.05,  0.08, 0.12, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.05, -0.18, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.05,  0.18, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.48, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.48, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.38, r); break;
		case 3:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.52, r);// 歩き4
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.27, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.00, -0.08, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.00,  0.08, 0.11, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.02, -0.16, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.02,  0.16, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.50, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.50, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.40, r); break;
		case 4:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.45, r);// 走り1
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.23, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.20, -0.07, 0.20, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.10,  0.07, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.10, -0.15, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.10,  0.15, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.33, r); break;
		case 5:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.47, r);// 走り2
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.26, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.00, -0.07, 0.15, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.00,  0.07, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.05, -0.18, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.05,  0.18, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.45, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.45, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.35, r); break;
		case 6:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.45, r);// 走り3
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.23, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.10, -0.07, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.20,  0.07, 0.20, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.10, -0.15, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.10,  0.15, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.33, r); break;
		case 7:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.47, r);// 走り4
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.26, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.00, -0.07, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.00,  0.07, 0.15, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.05, -0.18, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.05,  0.18, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.45, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.45, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.35, r); break;
		case 8:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.43, r);// しゃがむ
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.22, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.02, -0.10, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.02,  0.10, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.05, -0.18, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.05,  0.18, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.41, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.41, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.31, r); break;
		case 9:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.45, r);// ジャンプ
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.20, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.12, -0.10, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.12,  0.10, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.02, -0.20, 0.28);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.02,  0.20, 0.28);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.05,  0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.05, -0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.15,  0.00, 0.33, r); break;
		case 10:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.45, r);// 落下
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.20, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25,  0.12, -0.10, 0.10, r + Math.PI);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25,  0.12,  0.10, 0.10, r + Math.PI);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.02, -0.20, 0.28);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.02,  0.20, 0.28);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.05,  0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.05, -0.20, 0.43, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.15,  0.00, 0.33, r); break;
		case 11:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.30, r);// 飛び込み
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.20, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.18, -0.07, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.18,  0.07, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.20, -0.13, 0.17);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.20,  0.13, 0.17);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.28, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.28, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.06,  0.00, 0.30, r); break;
		case 12:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,  -0.06, -0.00, 0.6 - 0.38, r + Math.PI, 1);// 前転1
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,   0.02, -0.00, 0.6 - 0.15, r + Math.PI, 1);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.14,  0.07, 0.6 - 0.10, r,           1);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25, -0.14, -0.07, 0.6 - 0.10, r,           1);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.12,  0.15, 0.6 - 0.10);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.12, -0.14, 0.6 - 0.10);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.01, -0.20, 0.6 - 0.36, r + Math.PI, 1);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,   0.01,  0.20, 0.6 - 0.36, r + Math.PI, 1);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,   0.12, -0.00, 0.6 - 0.26, r + Math.PI, 1); break;
		case 13:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.06,  0.00, 0.38, r);// 前転2
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.15, r);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25,  0.14, -0.07, 0.10, r + Math.PI);
			drawBall2(img, billBoardStruct.tmpMat3, 32,  96,  8, size * 0.25,  0.14,  0.07, 0.10, r + Math.PI);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.12, -0.15, 0.10);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.12,  0.14, 0.10);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.01,  0.20, 0.36, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.01, -0.20, 0.36, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.12,  0.00, 0.26, r); break;
		default:
			drawBall2(img, billBoardStruct.tmpMat3,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.52, r);// 棒立ち
			drawBall2(img, billBoardStruct.tmpMat3,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.27, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25, -0.02, -0.10, 0.10, r);
			drawBall2(img, billBoardStruct.tmpMat3,  0,  96,  8, size * 0.25,  0.02,  0.10, 0.10, r);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25,  0.02, -0.20, 0.25);
			drawBall1(img, billBoardStruct.tmpMat3,  0, 120,  8, size * 0.25, -0.02,  0.20, 0.25);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.05,  0.20, 0.50, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,   0, 16, size * 0.5,  -0.05, -0.20, 0.50, r);
			drawBall2(img, billBoardStruct.tmpMat3, 64,  48, 16, size * 0.5,  -0.15,  0.00, 0.40, r); break;
	}
}

// 球体の描画 全方向同じ絵柄
function drawBall1(img, mat, u0, v0, uv, size, x, y, z){
	// ローカル座標系移動
	Mat44translate(billBoardStruct.tmpMat2, x, z, y);
	Mat44mul(billBoardStruct.tmpMat1, mat, billBoardStruct.tmpMat2);
	
	pushBillBoard(img, billBoardStruct.tmpMat1, size, u0, v0, uv, uv);
}

// 球体の描画 方向によって絵柄が変わる
function drawBall2(img, mat, u0, v0, uv, size, x, y, z, r, turn){
	// ローカル座標系移動
	Mat44translate(billBoardStruct.tmpMat2, x, z, y);
	Mat44mul(billBoardStruct.tmpMat1, mat, billBoardStruct.tmpMat2);
	
	// ワールド座標系での向きを求める
	var u, v;
	var mx = billBoardStruct.tmpMat1._41;
	var my = billBoardStruct.tmpMat1._42;
	var mz = billBoardStruct.tmpMat1._43;
	var anglev = 180 / Math.PI * (-ctrlStruct.rotv + Math.atan2(mz, mx) + r);
	var angleh = 180 / Math.PI * (-ctrlStruct.roth + Math.atan2(my, Math.sqrt(mx * mx + mz * mz)));
	while(anglev >  360 - 45){anglev -= 360;}
	while(anglev <=   0 - 45){anglev += 360;}
	
	if(turn){
		// 反転時
		if(anglev < 45){u = 3;}
		else if(anglev <= 135){u = 2;}
		else if(anglev < 225){u = 1;}
		else{u = 0;}
	
		if(angleh < -30){v = 0;}
		else if(angleh <  30){v = 1;}
		else{v = 2;}
	}else{
		if(anglev < 45){u = 1;}
		else if(anglev <= 135){u = 2;}
		else if(anglev < 225){u = 3;}
		else{u = 0;}
	
		if(angleh < -30){v = 2;}
		else if(angleh <  30){v = 1;}
		else{v = 0;}
	}
	
	u = u0 + u * uv;
	v = v0 + v * uv;
	
	pushBillBoard(img, billBoardStruct.tmpMat1, size, u, v, uv, uv, turn);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
function Player(){
	this.mode = 0;
	this.action = 0;
	this.x = 2.5;
	this.y = 2.5;
	this.z = 0;
	this.velh = 0;
	this.velv = 0;
	this.rot = -Math.PI / 2;
	this.ground = true;
	this.height = 0;
	
	// 計算
	this.calc = function(){
		this.action += 1;
		
		if(this.mode == 6 && this.action < 4){
			// 	着地硬直
			this.velh = 0;
		}else if(this.mode == 10 && this.action < 5){
			// 	飛び込み硬直終了
			this.velh = 0;
		}else if(this.mode == 9){
			// 	飛び込み硬直
			this.velh = 0.6 / 24;
			if(this.action == 6){
				this.mode = 10;
				this.action = 0;
			}
		}else if(this.mode == 8){
			// 飛び込み
			if(this.ground){
				this.mode = 9;
				this.action = 0;
			}
		}else{
			if(this.ground){
				// 地面に足がついている
				if(this.mode == 5){
					// 着地の瞬間
					this.mode = 6;
					this.action = 0;
				}else if(this.mode == 7){
					// 飛び込み
					if(this.action > 3){
						this.velh = 6 / 24;
						this.velv = 4 / 24;
						this.mode = 8;
					}
				}else if(ctrlStruct.k_z){
					// 飛び込み準備
					this.mode = 7;
					this.action = 0;
				}else if(this.mode == 3){
					// ジャンプ
					if(this.action > 3){
						this.velh = 1.2 / 24;
						this.velv = 8.0 / 24;
						this.mode = 4;
					}
				}else if(ctrlStruct.k_x){
					// ジャンプ準備
					this.mode = 3;
					this.action = 0;
				}else if(!(ctrlStruct.kup || ctrlStruct.kdn || ctrlStruct.krt || ctrlStruct.klt)){
					// 何もしていない
					if(this.mode == 1 || this.mode == 2){
						this.action = 0;
					}
					this.mode = 0;
					this.velh = 0;
				}else if(this.mode == 2 || this.action < 4){
					// 走る
					this.mode = 2;
					this.velh = 3.6 / 24;
				}else{
					// 歩く
					this.mode = 1;
					this.velh = 1.2 / 24;
				}
			}else{
				// 空中にいる
				if(this.velv < 0){
					// 落下状態
					this.mode = 5;
				}
			}
			
			if(ctrlStruct.krt){
				if(ctrlStruct.kup){			this.rot =  45 * Math.PI / 180 + ctrlStruct.rotv;}
				else if(ctrlStruct.kdn){	this.rot = 315 * Math.PI / 180 + ctrlStruct.rotv;}
				else{							this.rot =   0 * Math.PI / 180 + ctrlStruct.rotv;}
			}else if(ctrlStruct.klt){
				if(ctrlStruct.kup){			this.rot = 135 * Math.PI / 180 + ctrlStruct.rotv;}
				else if(ctrlStruct.kdn){	this.rot = 225 * Math.PI / 180 + ctrlStruct.rotv;}
				else{							this.rot = 180 * Math.PI / 180 + ctrlStruct.rotv;}
			}else if(ctrlStruct.kup){		this.rot =  90 * Math.PI / 180 + ctrlStruct.rotv;}
			else if(ctrlStruct.kdn){		this.rot = 270 * Math.PI / 180 + ctrlStruct.rotv;}
		}
		
		this.x += this.velh * Math.cos(this.rot);
		this.y += this.velh * Math.sin(this.rot);
		this.z += this.velv;
		this.velv -= 1.2 / 24;
		mapCollision(this, 0.3, 1.2);
	}
	
	// 描画
	this.draw = function(img, mat, x, y, z){
		var id;
		switch(this.mode){
			case 1:
				id = Math.floor(this.action / 5) % 4;
				break;
			case 2:
				id = 4 + Math.floor(this.action / 5) % 4;
				break;
			case 3: case 6: case 7:
				id = 8;
				break;
			case 4:
				id = 9;
				break;
			case 5:
				id = 10;
				break;
			case 8:
				id = 11;
				break;
			case 9:
				id = 12;
				break;
			case 10:
				id = 13;
				break;
			default:
				id = -1;
				break;
		}
		
		drawCharacter(img, mat, id, 2, x, y, z, this.rot);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

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

// コントローラー タッチによる視点回転をスプライトに追加
function touchRotater(sprite){
	var touchx;
	var touchy;
	var touchrv;
	var touchrh;
	
	// タッチ開始
	sprite.addEventListener('touchstart', function(e){
		touchx = e.x;
		touchy = e.y;
		touchrv = ctrlStruct.rotv;
		touchrh = ctrlStruct.roth;
	});
	
	// タッチ途中
	sprite.addEventListener('touchmove', function(e){
		ctrlStruct.rotv = touchrv - (e.x - touchx) * 0.03;
		ctrlStruct.roth = touchrh - (e.y - touchy) * 0.03;
		
		var r80 = Math.PI / 2 * 8 / 9;
		if(ctrlStruct.roth > r80){ctrlStruct.roth = r80;}
		if(ctrlStruct.roth < -r80){ctrlStruct.roth = -r80;}
	});
	
	// タッチ終了
	sprite.addEventListener('touchend', function(e){
		// タッチしたとき
		//game.popScene();
	});
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コントローラー ボタン操作スプライト
function gameController(game, scene){
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
		if(ctrlStruct.kup){surface1.draw(game.assets['key.png'], 112,  0, 48, 56, 32,  0, 48, 56);}
		if(ctrlStruct.kdn){surface1.draw(game.assets['key.png'], 168, 48, 48, 56, 32, 56, 48, 56);}
		if(ctrlStruct.krt){surface1.draw(game.assets['key.png'], 160,  0, 56, 48, 56, 32, 56, 48);}
		if(ctrlStruct.klt){surface1.draw(game.assets['key.png'], 112, 56, 56, 48,  0, 32, 56, 48);}
		
		// ボタンの描画
		surface2.draw(game.assets['btn.png'], 0, 0, 128,  96, 0, 0, 128,  96);
		if(ctrlStruct.k_z){surface2.draw(game.assets['btn.png'],  0, 96, 64, 64,  0, 32, 64, 64);}// z押し
		if(ctrlStruct.k_x){surface2.draw(game.assets['btn.png'], 64, 96, 64, 64, 64,  0, 64, 64);}// x押し
	});
	
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
	
	return group;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

