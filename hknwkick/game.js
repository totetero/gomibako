// 本ソースコードと"util.png", "effect.png"のライセンスはMITライセンスではなく
// バンザイライセンスです。ソースコードの一部もしくは全部を使用したものを配布するまえに
// 「ばんじゃーい」と3回叫んでください。叫ばないと再配布権がないので誰も見てなくても叫んで下さい。
// 作者は、ソフトウェアに関してなんら責任を負いません。

window.onload = function(){
	enchant();
	var game = new Game(320, 320);
	game.fps = 24;
	game.preload('img/key.png', 'img/btn.png', 'img/title.png', 'img/logo.png', 'img/mapchip.png', 'img/ball.png', 'img/player.png', 'img/util.png', 'img/effect.png');
	game.onload = function(){
		game.pushScene(titleScene(game));
	}
	game.start();
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// タイトルシーン
function titleScene(game){
	var action = 0;
	var scene = new Scene();
	var sprite1 = new Sprite(350, 320);
	var sprite2 = new Sprite(160, 108);
	var sprite3 = new Sprite(320, 320);
	var surface = new Surface(320, 320);
	var label = new Label("touch to start");
	sprite1.image = game.assets['img/title.png'];
	sprite2.image = game.assets['img/logo.png'];
	sprite3.image = surface;
	sprite1.y = 0;
	sprite1.x = 0;
	sprite2.y = game.height - 108 - 10;
	sprite2.x = 10;
	label.x = 10;
	label.y = 25;
	sprite1.addEventListener('enterframe', function(e){
		// 毎フレーム
		action += 1;
		label.opacity = 1 - Math.floor(action / 24) % 2;
		sprite1.x = -15 - 15 * Math.pow(0.9, action);
		sprite2.x = 10 + 320 * Math.pow(0.8, action);
		if(action == 12){
			sprite3.opacity = 0.5;
			surface.draw(game.assets['img/util.png'],  0, 128, 80, 16, 180, 280, 120, 24);
		}
	});
	var touchFunction = function(e){
		// タッチ移動中
		if(160 < e.x && e.x < 320 && 260 < e.y && e.y < 320){
			sprite3.opacity = 1;
		}else{
			sprite3.opacity = 0.5;
		}
	}
	sprite3.addEventListener('touchstart', touchFunction);
	sprite3.addEventListener('touchmove', touchFunction);
	sprite3.addEventListener('touchend', function(e){
		// タッチしたとき
		if(160 < e.x && e.x < 320 && 260 < e.y && e.y < 320){
			game.replaceScene(gameScene(game, true));
		}else{
			game.replaceScene(gameScene(game, false));
		}
	});
	scene.addChild(sprite1);
	scene.addChild(sprite2);
	scene.addChild(sprite3);
	scene.addChild(label);
	return scene;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ゲーム用グローバル構造体
var gameStruct = new Object();

gameStruct.score = 0;
gameStruct.time = 0;
gameStruct.finishTime = 24 * 60;
gameStruct.liteMode = false;

gameStruct.player = null;
gameStruct.enemyPool = null;
gameStruct.effectPool = null;

// ゲームシーン
function gameScene(game, mode){
	var scene = new Scene();
	var sprite = new Sprite(game.width, game.height);
	var surface = new Surface(game.width, game.height);
	sprite.image = surface;
	scene.addChild(sprite);
	initController(game, scene, sprite);
	initUtility(game, scene, sprite);
	gameStruct.liteMode = mode;
	
	// 計算初期化
	createMapVertexes();
	gameStruct.player = new Player();
	gameStruct.enemyPool = new Array();
	gameStruct.effectPool = new Array();
	
	// ソースを見てくれたキミにイイコトを教えてあげよう！！
	// 上キーを押しながらゲームを開始するとプレイヤーキャラが小さくなるぞ
	// 見た目だけであたり判定とかは変化無しだ！！
	// みんなにはナイショだよ
	if(game.input.up){gameStruct.player.littleFlag = true;}
	
	// 描画初期化
	var tmpMat1 = new Object();
	var tmpMat2 = new Object();
	var worldMat = new Object();
	var aspect = game.width / game.height;
	mat44Perspective(tmpMat1, aspect, 1, 1, 100);
	mat44Viewport(tmpMat2, 0, 0, game.width, game.height);
	mulMat44(engineStruct.projectionMatrix, tmpMat2, tmpMat1);
	
	// 画像 -------- enchant.jsの内部仕様が変わったら使えなくなるかも
	textureImage = game.assets['img/mapchip.png']._element;
	billBoardStruct.img1 = game.assets['img/player.png']._element;
	billBoardStruct.img2 = game.assets['img/ball.png']._element;
	billBoardStruct.img3 = game.assets['img/effect.png']._element;
	
	sprite.addEventListener('enterframe', function(e){
		// フレーム処理
		
		// 計算
		if(gameStruct.time == 0 || gameStruct.time == 10 * 24 || gameStruct.time == 40 * 24){
			gameStruct.enemyPool.push(new Enemy());
		}
		
		gameStruct.player.calc();
		for(var i = 0; i < gameStruct.enemyPool.length; i++){
			gameStruct.enemyPool[i].calc();
		}
		
		// 描画準備
		var camerax = -gameStruct.player.x;
		var cameray = -gameStruct.player.y;
		var cameraz = gameStruct.player.z > 0 ? -gameStruct.player.z : 0;
		mat44Translate(tmpMat1, 0, 0, -8);
		mulMat44RotX(tmpMat2, tmpMat1, ctrlStruct.roth);
		mulMat44RotY(tmpMat1, tmpMat2, ctrlStruct.rotv);
		mulMat44Translate(worldMat, tmpMat1, camerax, cameraz, cameray);
		//描画登録
		drawMap(textureImage, worldMat);
		gameStruct.player.draw(worldMat);
		for(var i = 0; i < gameStruct.enemyPool.length; i++){
			gameStruct.enemyPool[i].draw(worldMat);
		}
		for(var i = 0; i < gameStruct.effectPool.length; i++){
			gameStruct.effectPool[i].draw(worldMat);
		}
		// 描画
		surface.context.fillStyle = "rgb(255, 255, 255)";
		surface.context.fillRect(0, 0, game.width, game.height);
		draw3d(surface.context);
	});
	
	return scene;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ユーティリティ管理スプライト
function initUtility(game, scene, sprite){
	gameStruct.score = 0;
	gameStruct.time = -24 * 3;
	
	var group = new Group();
	var sprite1 = new Sprite(32, 32);
	var sprite2 = new Sprite(128, 16);
	var sprite3 = new Sprite(80, 16);
	var surface1 = new Surface(32, 32);
	var surface2 = new Surface(128, 16);
	var surface3 = new Surface(80, 16);
	
	sprite1.image = surface1;
	sprite2.image = surface2;
	sprite3.image = surface3;
	group.addChild(sprite1);
	group.addChild(sprite2);
	group.addChild(sprite3);
	scene.addChild(group);
	sprite1.x = 10;
	sprite1.y = 10;
	sprite2.x = game.width - 128 - 10;
	sprite2.y = 10;
	
	ctrlStruct.kup = 0;
	ctrlStruct.kdn = 0;
	ctrlStruct.krt = 0;
	ctrlStruct.klt = 0;
	ctrlStruct.k_z = 0;
	ctrlStruct.k_x = 0;
	ctrlStruct.rotv = 3.1415;
	ctrlStruct.roth = 0.3;
	
	group.addEventListener('enterframe', function(e){
		// フレーム処理
		surface1.clear();
		surface2.clear();
		surface3.clear();
		gameStruct.time++;
		
		// 時計
		surface1.context.save();
		surface1.draw(game.assets['img/util.png'], 0, 64, 32, 32, 0, 0, 32, 32);
		if(0 <= gameStruct.time && gameStruct.time < gameStruct.finishTime){
			surface1.context.translate(16, 16);
			surface1.context.rotate(2 * Math.PI * gameStruct.time / gameStruct.finishTime);
			surface1.context.translate(-16, -16);
		}
		surface1.draw(game.assets['img/util.png'], 32, 64, 32, 32, 0, 0, 32, 32);
		surface1.context.restore();
		
		// スコア
		var s = gameStruct.score;
		if(gameStruct.score < 0){s *= -1;}
		for(var i = 0; i < 8; i++){
			var num = Math.floor(s % 10);
			if(gameStruct.score >= 0){
				surface2.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5), 16, 16, (8 - i - 1) * 16, 0, 16, 16);
			}else{
				surface2.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5) + 32, 16, 16, (8 - i - 1) * 16, 0, 16, 16);
			}
			s /= 10;
		}
		
		// 開始終了文字
		if(gameStruct.time < 0 && Math.abs(gameStruct.time) % 24 < 20){
			// ゲーム開始前
			surface3.draw(game.assets['img/util.png'], 0, 96, 80, 16, 0, 0, 80, 16);
			sprite3.x = (game.width - 80) / 2;
			sprite3.y = (game.height - 10) / 2;
		}else if(gameStruct.time > gameStruct.finishTime + 24 * 3){
			// ゲーム終了
			game.popScene();
			var id = location.pathname.match(/^\/games\/(\d+)/);
			if(id == null){
				// ローカルなど9leap以外で遊んでいる場合
				game.pushScene(titleScene(game));
			}else{
				// ハイスコア登録
				location.replace([
					'http://9leap.net/games/', id[1], '/result',
					'?score=', encodeURIComponent(gameStruct.score > 0 ? gameStruct.score : 0),
					'&result=', encodeURIComponent(gameStruct.score + "点キック！！")
				].join(''));
			}
		}else if(gameStruct.time > gameStruct.finishTime){
			// タイムアップ
			surface3.draw(game.assets['img/util.png'], 0, 112, 80, 16, 0, 0, 80, 16);
			sprite3.x = (game.width - 80) / 2;
			sprite3.y = (game.height - 10) / 2;
		}else{
			sprite3.x = 0;
			sprite3.y = 0;
		}
	});
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// エフェクトクラス
function Effect(){
	this.type = 0;
	this.action = 0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;

	// 描画
	this.draw = function(mat){
		this.action += 1;
		// 計算
		switch(this.type){
			case 2: case 3:
				if(this.z < 0){
					this.type = 0;
				}else{
					this.x += this.vx;
					this.y += this.vy;
					this.z += this.vz;
					this.vz -= 0.03;
				}
				break;
		}
		// 描画
		switch(this.type){
			case 1:
				// 砂埃
				mulMat44Translate(billBoardStruct.tmpMat1, mat, this.x, this.z + 0.2, this.y);
				pushBillBoard(billBoardStruct.img3, billBoardStruct.tmpMat1, 1, 16 * Math.floor(this.action / 3), 0, 16, 16, 0);
				if(this.action == 12){this.type = 0;}
				break;
			case 2:
				// 会心スター
				mulMat44Translate(billBoardStruct.tmpMat1, mat, this.x, this.z, this.y);
				pushBillBoard(billBoardStruct.img3, billBoardStruct.tmpMat1, 1, 16 * (Math.floor(this.action / 3) % 2), 16, 16, 16, 0);
				break;
			case 3:
				// 痛恨スター
				mulMat44Translate(billBoardStruct.tmpMat1, mat, this.x, this.z, this.y);
				pushBillBoard(billBoardStruct.img3, billBoardStruct.tmpMat1, 1, 16 * (Math.floor(this.action / 3) % 2 + 2), 16, 16, 16, 0);
				break;
		}
	}
}

// エフェクト登録
function pushEffect(type, x, y, z){
	for(var i = 0; i < gameStruct.effectPool.length && gameStruct.effectPool[i].type != 0; i++);
	if(i == gameStruct.effectPool.length){
		gameStruct.effectPool.push(new Effect());
	}
	gameStruct.effectPool[i].type = type;
	gameStruct.effectPool[i].action = 0;
	gameStruct.effectPool[i].x = x;
	gameStruct.effectPool[i].y = y;
	gameStruct.effectPool[i].z = z;
	switch(type){
		case 2: case 3:
			var velv = 0.1 * Math.random();
			var velh = 0.2 * Math.random();
			var rot = Math.random() * 2 * Math.PI;
			gameStruct.effectPool[i].vx = velv * Math.cos(rot);
			gameStruct.effectPool[i].vy = velv * Math.sin(rot);
			gameStruct.effectPool[i].vz = velh;
			break;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 敵クラス
function Enemy(){
	this.action = 0;
	this.x = 0.5 + Math.random() * 4;
	this.y = 0.5 + Math.random() * 4;
	this.z = 8;
	this.velmax = 0.3 / 24;
	this.velh = 0;
	this.velv = 0;
	this.rot = 0;
	this.ground = true;
	this.height = 0;
	
	// 計算
	this.calc = function(){
		this.action += 1;
		
		if(0 <= gameStruct.time && gameStruct.time < gameStruct.finishTime){
			gameStruct.score += Math.floor(this.x) * 10;
			
			var x0 = gameStruct.player.x - this.x;
			var y0 = gameStruct.player.y - this.y;
			var z0 = gameStruct.player.z - this.z;
			var r0 = x0 * x0 + y0 * y0 + z0 * z0;
			this.rot = Math.atan2(y0, x0);
		
			if(gameStruct.player.mode == 12){
				var x1 = gameStruct.player.x + 0.5 * Math.cos(gameStruct.player.rot) - this.x;
				var y1 = gameStruct.player.y + 0.5 * Math.sin(gameStruct.player.rot) - this.y;
				var z1 = gameStruct.player.z - this.z;
				var r1 = x1 * x1 + y1 * y1 + z1 * z1;
				if(r1 < 0.3){
					// プレイヤーのキックがヒット
					this.velh = -3 / 24;
					this.velv = 4.8 / 24;
					pushEffect(2, (this.x + gameStruct.player.x) / 2, (this.y + gameStruct.player.y) / 2, this.z + 1);
					gameStruct.score += 1000;
				}
			}else if(r0 > 0.3){
				// 普通の状態
				if(	this.ground){
					this.velh = this.velmax;
				}
			}else{
				// 敵の攻撃がヒット
				gameStruct.player.rot = this.rot + Math.PI;
				gameStruct.player.velh = -0.9 / 24;
				gameStruct.player.mode= 13;
				this.velh = -this.velmax;
				this.velv = 2.4 / 24;
				pushEffect(3, (this.x + gameStruct.player.x) / 2, (this.y + gameStruct.player.y) / 2, this.z + 1);
				gameStruct.score -= 10000;
			}
		
			this.x += this.velh * Math.cos(this.rot);
			this.y += this.velh * Math.sin(this.rot);
			this.z += this.velv;
			this.velv -= 1.2 / 24;
			
			if(this.z < -30){
				// 再Pop
				this.x = 0.5 + Math.random() * 4;
				this.y = 0.5 + Math.random() * 4;
				this.z = 6;
				this.velh = 0;
				this.velv = 0;
				this.velmax = (0.1 + 0.4 * Math.random()) / 24;
				gameStruct.score += 20000;
			}
		}
		
		mapCollision(this, 0.3, 1.2);
	}
	
	// 描画
	this.draw = function(mat){
		id = Math.floor(this.action / 5) % 4;
		drawCharacter2(mat, id, 2, this.x, this.z, this.y, this.rot);
		if(this.height >= 0){
			pushShadowSquare(mat, 0.3, this.x, this.z - this.height, this.y);
		}
	}
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
	this.littleFlag = false;
	
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
				pushEffect(1, this.x + 0.3 * Math.cos(this.rot + Math.PI), this.y + 0.3 * Math.sin(this.rot + Math.PI), this.z);
			}
		}else if(this.mode == 13){
			// ダメージ 開始
			this.velv = 2 / 24;
			this.mode = 14;
			this.action = 0;
		}else if(this.mode == 14){
			// ダメージ
			if(this.action == 6){
				this.mode = 0;
				this.velh = 0;
			}
		}else{
			if(this.ground){
				// 地面に足がついている
				if(this.mode == 5){
					// 着地の瞬間
					this.mode = 6;
					this.action = 0;
					pushEffect(1, this.x + 0.3 * Math.cos(this.rot + Math.PI), this.y + 0.3 * Math.sin(this.rot + Math.PI), this.z);
				}else if(this.mode == 7){
					// 飛び込み
					if(this.action > 3){
						this.velh = 6 / 24;
						this.velv = 4 / 24;
						this.mode = 8;
					}
				}else if(ctrlStruct.k_z && ctrlStruct.k_x){
					// 飛び込み準備
					this.mode = 7;
					this.action = 0;
					gameStruct.score += 100;
				}else if(this.mode == 11){
					// キックため
					if(this.action > 3){
						this.velh = 0.36 / 24;
						this.mode = 12;
					}
				}else if(this.mode == 12){
					// キック
					if(this.action > 8){
						this.velh = 0;
						this.mode = 0;
					}
				}else if(ctrlStruct.k_z){
					// キック準備
					this.mode = 11;
					this.action = 0;
					gameStruct.score += 10;
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
					gameStruct.score += 50;
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
					if(this.action % 8 == 4){pushEffect(1, this.x, this.y, this.z);}
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
				if(ctrlStruct.kup){			this.rot = 315 * Math.PI / 180 + ctrlStruct.rotv;}
				else if(ctrlStruct.kdn){	this.rot =  45 * Math.PI / 180 + ctrlStruct.rotv;}
				else{						this.rot =   0 * Math.PI / 180 + ctrlStruct.rotv;}
			}else if(ctrlStruct.klt){
				if(ctrlStruct.kup){			this.rot = 225 * Math.PI / 180 + ctrlStruct.rotv;}
				else if(ctrlStruct.kdn){	this.rot = 135 * Math.PI / 180 + ctrlStruct.rotv;}
				else{						this.rot = 180 * Math.PI / 180 + ctrlStruct.rotv;}
			}else if(ctrlStruct.kup){		this.rot = 270 * Math.PI / 180 + ctrlStruct.rotv;}
			else if(ctrlStruct.kdn){		this.rot =  90 * Math.PI / 180 + ctrlStruct.rotv;}
		}
		
		this.x += this.velh * Math.cos(this.rot);
		this.y += this.velh * Math.sin(this.rot);
		this.z += this.velv;
		this.velv -= 1.2 / 24;
		mapCollision(this, 0.3, 1.2);
		
		if(this.z < -30){
			this.x = 2.5;
			this.y = 2.5;
			this.z = 6;
			this.mode = 0;
			this.velh = 0;
			this.velv = 0;
			gameStruct.score /= 2;
		}
	}
	
	// 描画
	this.draw = function(mat){
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
			case 11:
				id = 14;
				break;
			case 12:
				id = 15;
				break;
			case 13:
			case 14:
				id = 10;
				break;
			default:
				id = -1;
				break;
		}
		
		if(!this.littleFlag){
			drawCharacter1(mat, id, 2, this.x, this.z, this.y, this.rot);
			if(this.height >= 0){
				pushShadowSquare(mat, 0.3, this.x, this.z - this.height, this.y);
			}
		}else{
			drawCharacter1(mat, id, 1, this.x, this.z, this.y, this.rot);
			if(this.height >= 0){
				pushShadowSquare(mat, 0.15, this.x, this.z - this.height, this.y);
			}
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------


