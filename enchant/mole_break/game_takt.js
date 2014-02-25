// 本ソースコードと"effect.png", "emotion.png", "enemy.png", "player.png", "shot.png", "util.png"のライセンスはMITライセンスではなく
// バンザイライセンスです。ソースコードの一部もしくは全部を使用したものを配布するまえに
// 「ばんじゃーい」と3回叫んでください。叫ばないと再配布権がないので誰も見てなくても叫んで下さい。
// 作者は、ソフトウェアに関してなんら責任を負いません。

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ゲーム用グローバル構造体
var gameStruct = new Object();

gameStruct.rotv = 0;
gameStruct.roth = 0.3;

gameStruct.score = 0;
gameStruct.damage = 0;
gameStruct.time = 0;
gameStruct.finishTime = 8 * 60;
gameStruct.selectedImage = 0;
gameStruct.titleLogoPosition = 0;

gameStruct.floorx = 0;
gameStruct.floory = 0;
gameStruct.player = null;
gameStruct.shotPool = null;
gameStruct.enemyPool = null;
gameStruct.effectPool = null;

gameStruct.img1 = null;
gameStruct.img3 = null;
gameStruct.img4 = null;
gameStruct.img5 = null;
gameStruct.img6 = null;
gameStruct.tmpMat1 = new Object();
gameStruct.tmpMat2 = new Object();
gameStruct.vec0 = new Vertex( 0.5, 1.0, 0);
gameStruct.vec1 = new Vertex(-0.5, 1.0, 0);
gameStruct.vec2 = new Vertex(-0.5, 0.0, 0);
gameStruct.vec3 = new Vertex( 0.5, 0.0, 0);

gameStruct.gameSocketConnected = false;
gameStruct.netPlayer = null;

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 一番最初
window.onload = function(){
	enchant();
	var game = new Game(320, 320);
	game.fps = 8;
	game.preload(
		'img/title1.png', 'img/title2.png', 'img/logo.png',
		'img/key.png', 'img/btn.png', 'img/util.png',
		'img/player.png', 'img/playerr.png', 'img/playerg.png', 'img/playerb.png', 'img/playery.png', 'img/playerx.png', 'img/playerz.png',
		'img/shot.png', 'img/enemy.png', 'img/effect.png', 'img/emotion.png');
	game.onload = function(){
		// 画像 -------- enchant.jsの内部仕様が変わったら使えなくなるかも
		gameStruct.img1 = game.assets['img/player.png']._element;
		gameStruct.img3 = game.assets['img/shot.png']._element;
		gameStruct.img4 = game.assets['img/enemy.png']._element;
		gameStruct.img5 = game.assets['img/effect.png']._element;
		gameStruct.img6 = game.assets['img/emotion.png']._element;
		toggleTitleScene(game);
	}
	game.start();
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// タイトルシーン
function toggleTitleScene(game){
	var scene = new Scene();
	var sprite1 = new Sprite(320, 320);
	var sprite2 = new Sprite(160, 108);
	var label = new Label("<center><B>touch to start</B></center>");
	sprite1.image = game.assets['img/title1.png'];
	sprite2.image = game.assets['img/logo.png'];
	sprite2.x = -160;
	sprite2.y = 10;
	label.x = 0;
	label.y = 280;
	sprite1.addEventListener('enterframe', function(e){
		// 毎フレーム
		gameStruct.titleLogoPosition += 1;
		label.opacity = 1 - Math.floor(gameStruct.titleLogoPosition / 8) % 2;
		sprite2.x = (90 + gameStruct.titleLogoPosition) % 320 - 80;
	});
	// タッチしたとき
	var toggleScene = function(e){toggleSelectScene(game);}
	sprite1.addEventListener('touchend', toggleScene);
	label.addEventListener('touchend', toggleScene);
	scene.addChild(sprite1);
	scene.addChild(sprite2);
	scene.addChild(label);
	
	game.replaceScene(scene);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// セレクトシーン
function toggleSelectScene(game){
	var action = 0;
	var scene = new Scene();
	var sprite1 = new Sprite(320, 320);
	var sprite2 = new Sprite(160, 32);
	var surface = new Surface(160, 32);
	var label1 = new Label("<input type='button' value='ひとりでブレイク' onClick='toggleGameScene(enchant.Game.instance)'>");
	var label2 = new Label("<input type='button' value='ふたりでぐれいと' onClick='toggleLobbyScene(enchant.Game.instance)' disabled = true>");
	var label3 = new Label("<input type='button' value='キャラ選択(?)' onClick='test_selectScene()'>");
	sprite1.image = game.assets['img/title2.png'];
	sprite2.image = surface;
	label1.x = 100;
	label1.y =  80;
	label2.x = 100;
	label2.y = 130;
	sprite2.x = 100;
	sprite2.y = 180;
	label3.x = 100;
	label3.y = 220;
	scene.addChild(sprite1);
	scene.addChild(sprite2);
	scene.addChild(label1);
	scene.addChild(label2);
	//scene.addChild(label3);
	sprite1.addEventListener('touchend', function(e){toggleTitleScene(game);});
	sprite1.addEventListener('enterframe', function(e){
		// 毎フレーム
		action += 1;
		var act = Math.floor(action / 2) % 4;
		var u = 64; if(act == 1){u = 32;} else if(act == 3){u = 96;}
		surface.clear();
		surface.draw(game.assets['img/player.png'], gameStruct.selectedImage == 0 ? u : 0, 0, 32, 32,   0, 0, 32, 32);
		surface.draw(game.assets['img/playerr.png'], gameStruct.selectedImage == 1 ? u : 0, 0, 32, 32,  32, 0, 32, 32);
		surface.draw(game.assets['img/playerg.png'], gameStruct.selectedImage == 2 ? u : 0, 0, 32, 32,  64, 0, 32, 32);
		surface.draw(game.assets['img/playerb.png'], gameStruct.selectedImage == 3 ? u : 0, 0, 32, 32,  96, 0, 32, 32);
		surface.draw(game.assets['img/playery.png'], gameStruct.selectedImage == 4 ? u : 0, 0, 32, 32, 128, 0, 32, 32);
	});
	sprite2.addEventListener('touchend', function(e){
		// キャラクタをタッチしたとき
		if(0 < e.localX && e.localX < 160 && 0 < e.localY && e.localY < 32){
			gameStruct.selectedImage = Math.floor(e.localX / 32);
		}else if(game.input.up && game.input.down){
			// 作者専用だからな！！
			gameStruct.selectedImage = 6;
		}else{
			// 一応隠しキャラ
			gameStruct.selectedImage = 5;
		}
		gameStruct.img1 = checkPlayerImage(game, gameStruct.selectedImage);
	});
	
	game.replaceScene(scene);
}

function checkPlayerImage(game, id){
	var img;
	// 画像 -------- enchant.jsの内部仕様が変わったら使えなくなるかも
	switch(id){
		case 1: img = game.assets['img/playerr.png']._element; break;
		case 2: img = game.assets['img/playerg.png']._element; break;
		case 3: img = game.assets['img/playerb.png']._element; break;
		case 4: img = game.assets['img/playery.png']._element; break;
		case 5: img = game.assets['img/playerx.png']._element; break;
		case 6: img = game.assets['img/playerz.png']._element; break;
		default: img = game.assets['img/player.png']._element; break;
	}
	return img;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ロビーシーン
function toggleLobbyScene(game){
	var scene = new Scene();
	var sprite1 = new Sprite(320, 320);
	var sprite2 = new Sprite(160, 108);
	var sprite3 = new Sprite(32, 32);
	var surface = new Surface(32, 32);
	var label = new Label("接続を待っています");
	sprite1.image = game.assets['img/title2.png'];
	sprite2.image = game.assets['img/logo.png'];
	sprite3.image = surface;
	sprite2.x = -160;
	sprite2.y = 10;
	sprite3.x = 144;
	sprite3.y = 144;
	label.x = 10;
	label.y = game.width - 30;
	var cx = sprite3.x;
	var cy = sprite3.y;
	sprite1.addEventListener('enterframe', function(e){
		// 毎フレーム
		gameStruct.titleLogoPosition += 1;
		if(!gameStruct.gameSocketConnected){
			label.opacity = 1 - Math.floor(gameStruct.titleLogoPosition / 8) % 2;
		}else{
			label.opacity = 1;
			label.text = "接続に成功しました ゲームを開始します";
		}
		sprite2.x = (90 + gameStruct.titleLogoPosition) % 320 - 80;
		// キャラクタ
		var v = 0;
		// キーボード操作
		if(game.input.up){cy -= 2;}
		if(game.input.down){cy += 2;}
		if(game.input.right){cx += 2;}
		if(game.input.left){cx -= 2;}
		// マウス操作
		var vx = cx - sprite3.x;
		var vy = cy - sprite3.y;
		sprite3.x = sprite3.x + 0.2 * vx;
		sprite3.y = sprite3.y + 0.2 * vy;
		if(Math.abs(vx) > Math.abs(vy)){
			if(vx < 0){v = 32;}else{v = 96;}
		}else if(vy < 0){v = 64;}else{v = 0;}
		
		var act = Math.floor(gameStruct.titleLogoPosition / 2) % 4;
		var u = 64; if(act == 1){u = 32;} else if(act == 3){u = 96;}
		surface.clear();
		surface.context.drawImage(gameStruct.img1, u, v, 32, 32, 0, 0, 32, 32);
	});
	// 画面タッチ時キャラ移動
	var characterMove = function(e){cx = e.x - 16; cy = e.y - 16;}
	sprite1.addEventListener('touchstart', characterMove);
	sprite1.addEventListener('touchmove', characterMove);
	scene.addChild(sprite1);
	scene.addChild(sprite2);
	scene.addChild(sprite3);
	scene.addChild(label);
	
	gameSocketInit(game);
	
	toggleGameScene(game);
	game.pushScene(scene);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 通信用関数群
// このソース内の通信関係処理はすべて'gameSocket'とつきます
// 検索すればどこに通信処理があるのか思い出せるぜ

// 通信初期化
function gameSocketInit(game){
	gameStruct.gameSocketConnected = false;
	game.socket = new Socket(985);
	
	game.socket.gameRoom.addEventListener('ready', function(data){
		console.log(data);
		// ゲーム情報を送信する
		game.socket.gameRoom.push('startNetGame',{id:gameStruct.selectedImage});
	});
	
	// 相手のゲーム情報を受信してゲームを開始する
	game.socket.gameRoom.addEventListener('startNetGame', function(data){
		gameStruct.netPlayer = new Player(checkPlayerImage(game, data.id), 0, 0, 100);
		gameStruct.gameSocketConnected = true;
		window.setTimeout(function(){
			game.popScene();
			// twitter顔グラ
			var label1 = new Label("<img width=40 src='http://9leap.net/api/icon/screen_name/" + game.socket.twitterID + "'>");
			var label2 = new Label("<img width=40 src='http://9leap.net/api/icon/screen_name/" + game.socket.gameRoom.member[0] + "'>");
			var label3 = new Label("<div align='right'>" + game.socket.gameRoom.member[0] + "</div>");
			label1.x = 3;
			label1.y = 3;
			label2.x = game.width - 40 - 3;
			label2.y = 3;
			label3.x = 0;
			label3.y = 46;
			game.currentScene.addChild(label1);
			game.currentScene.addChild(label2);
			game.currentScene.addChild(label3);
		}, 3000);
	});
	
	// キャラクタ位置受信
	game.socket.gameRoom.addEventListener('p', function(data){
		gameStruct.netPlayer.x = data.x;
		gameStruct.netPlayer.y = data.y;
		gameStruct.netPlayer.z = data.z;
		gameStruct.netPlayer.rotate = data.r;
	});
	
	// 弾発射情報受信
	game.socket.gameRoom.addEventListener('s', function(data){
		pushShot(data.x, data.y, data.a, data.r);
	});
	
	// 敵出現情報受信
	game.socket.gameRoom.addEventListener('e', function(data){
		pushEnemy(data.x, data.y, data.a, data.r, data.t, false);
	});
	
	// 相手からスコアを受け取る
	game.socket.gameRoom.addEventListener('sc', function(data){
		gameStruct.score += data.s;
	});
	
	// 相手から感情を受け取る
	game.socket.gameRoom.addEventListener('em', function(data){
		gameStruct.netPlayer.emotion = data.e;
	});
	
	game.socket.lobby.join();
}

// 通信キャラクタ描画ラッパ関数
function gameSocketDrawPlayer(mat){
	if(gameStruct.gameSocketConnected){
		gameStruct.netPlayer.draw(mat);
	}
}

// 送信ラッパ関数 キャラクタ位置送信
function gameSocketPush_ppos(){
	if(gameStruct.gameSocketConnected){
		var game = enchant.Game.instance;
		var xx = gameStruct.player.x0;
		var yy = gameStruct.player.y0;
		var zz = gameStruct.player.z0;
		var rr = gameStruct.player.rotate;
		game.socket.gameRoom.push('p',{x:xx, y:yy, z:zz, r:rr});
	}
}

// 送信ラッパ関数 弾発射情報送信
function gameSocketPush_shot(xx, yy, rotate, radius){
	if(gameStruct.gameSocketConnected){
		var game = enchant.Game.instance;
		game.socket.gameRoom.push('s',{x:xx, y:yy, a:rotate, r:radius});
	}
}

// 送信ラッパ関数 敵出現情報送信
function gameSocketPush_enem(xx, yy, rotate, radius, type){
	if(gameStruct.gameSocketConnected){
		var game = enchant.Game.instance;
		game.socket.gameRoom.push('e',{x:xx, y:yy, a:rotate, r:radius, t:type});
	}
}

// 送信ラッパ関数 相手にスコアをプレゼント
function gameSocketPush_score(ss){
	if(gameStruct.gameSocketConnected){
		var game = enchant.Game.instance;
		game.socket.gameRoom.push('sc',{s:ss});
	}
}

// 送信ラッパ関数 相手に感情を伝える
function gameSocketPush_emotion(ee){
	if(gameStruct.gameSocketConnected){
		var game = enchant.Game.instance;
		game.socket.gameRoom.push('em',{e:ee});
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ゲームシーン
function toggleGameScene(game){
	var action = 0;
	var scene = new Scene();
	var sprite = new Sprite(game.width, game.height);
	var surface = new Surface(game.width, game.height);
	sprite.image = surface;
	scene.addChild(sprite);
	initUtility(game, scene, sprite);
	
	// -------------------------------- ゲーム初期化処理 --------------------------------
	
	// 床の初期化
	gameStruct.floorx = 5;
	gameStruct.floory = 5;
	var floorVector = new Array();
	for(var i = 0; i < gameStruct.floorx + 1; i++){
		floorVector[i] = new Array();
		for(var j = 0; j < gameStruct.floory + 1; j++){
			floorVector[i][j] = new Vertex(i, 0, j);
		}
	}
	// キャラクターの初期化
	gameStruct.player = new Player(gameStruct.img1, gameStruct.floorx / 2, gameStruct.floory / 2, 0);
	gameStruct.shotPool = new Array();
	gameStruct.enemyPool = new Array();
	gameStruct.effectPool = new Array();
	
	// 描画初期化 スクリーン座標変換行列の作成
	var tmpMat1 = new Object();
	var tmpMat2 = new Object();
	var worldMat = new Object();
	var aspect = game.width / game.height;
	mat44Perspective(tmpMat1, aspect, 1, 1, 100);
	mat44Viewport(tmpMat2, 0, 0, game.width, game.height);
	mulMat44(engineStruct.projectionMatrix, tmpMat2, tmpMat1);
	
	// -------------------------------- メインループ処理 --------------------------------
	
	sprite.addEventListener('enterframe', function(e){
		action += 1;
		
		// 入力処理
		touchCarc();
		
		// 敵出現
		if(gameStruct.time == 0 || gameStruct.time == 10 * 8 || gameStruct.time == 40 * 8){
			pushEnemy_random();
			if(!gameStruct.gameSocketConnected){pushEnemy_random();}
		}
		
		// プレイヤーキャラの速度位置計算
		gameStruct.player.calc();
		if(action % 8 == 0){gameSocketPush_ppos();}
		for(var i = 0; i < gameStruct.shotPool.length; i++){
			gameStruct.shotPool[i].calc();
		}
		for(var i = 0; i < gameStruct.enemyPool.length; i++){
			gameStruct.enemyPool[i].calc();
		}
		
		// 描画準備 ワールド座標変換行列の作成
		mat44Translate(tmpMat1, 0, 0, -8);
		mulMat44RotX(tmpMat2, tmpMat1, gameStruct.roth);
		mulMat44RotY(tmpMat1, tmpMat2, gameStruct.rotv);
		mulMat44Translate(worldMat, tmpMat1, -gameStruct.player.x0, 0, -gameStruct.player.y0);
		
		// キャラクターの描画
		gameStruct.player.draw(worldMat);
		for(var i = 0; i < gameStruct.shotPool.length; i++){
			gameStruct.shotPool[i].draw(worldMat);
		}
		for(var i = 0; i < gameStruct.enemyPool.length; i++){
			gameStruct.enemyPool[i].draw(worldMat);
		}
		for(var i = 0; i < gameStruct.effectPool.length; i++){
			gameStruct.effectPool[i].draw(worldMat);
		}
		// 床の描画
		for(var i = 0; i < gameStruct.floorx; i++){
			for(var j = 0; j < gameStruct.floory; j++){
				var color;
				if((i + j) % 2 == 0){
					color = "rgba(255, 255, 255, 0.5)";
				}else{
					color = "rgba(0, 0, 0, 0.5)";
				}
				pushColorSquare(color , worldMat, floorVector[i][j], floorVector[i][j + 1], floorVector[i + 1][j + 1], floorVector[i + 1][j]);
			}
		}
		// 最後にネットワークプレイヤー描画
		gameSocketDrawPlayer(worldMat);
		
		// 描画
		surface.context.fillStyle = "rgb(255, 255, 255)";
		surface.context.fillRect(0, 0, game.width, game.height);
		draw3d(surface.context);
	});
	
	// -------------------------------- インプット処理 --------------------------------
	var touchMoveAction;
	var touchx0, touchy0;
	var touchx1, touchy1;
	var touchrv, touchrh;
	var roth_max = Math.PI / 180 * 60;
	var roth_min = Math.PI / 180 * 10;
	var touchMode = 0;
	
	// フレーム毎に行うインプット処理
	var touchCarc = function(){
		touchMoveAction += 1;
		if(touchMode == 2){
			if(gameStruct.player.sradius <= 0 && touchMoveAction == 2){
				// ドラッグした方向に弾装填
				gameStruct.player.getTouchedPosition(worldMat, touchx1, touchy1);
				x = gameStruct.player.x0 - gameStruct.player.touchedx;
				y = gameStruct.player.y0 - gameStruct.player.touchedy;
				gameStruct.player.rotate = Math.atan2(y, x) + Math.PI;
				gameStruct.player.sradius = 0.1;
			}
		}
	}
	
	// タッチ開始
	sprite.addEventListener('touchstart', function(e){
		touchMoveAction = 0;
		var x = e.localX - sprite.width / 2;
		var y = e.localY - sprite.height / 2;
		var xxyy = x * x + y * y;
		if(xxyy < 20 * 20){
			// 弾の準備
			touchMode = 2;
		}else if(xxyy > 30 * 30){
			touchMode = 1;
			// 画面回転の準備
			touchx0 = e.localX;
			touchy0 = e.localY;
			touchrv = gameStruct.rotv;
			touchrh = gameStruct.roth;
		}
	});
	
	// タッチ途中
	sprite.addEventListener('touchmove', function(e){
		touchx1 = e.localX;
		touchy1 = e.localY;
		if(touchMode == 1 && touchMoveAction >= 2){
			// 画面回転
			gameStruct.rotv = touchrv + (touchx1 - touchx0) * 0.01;
			gameStruct.roth = touchrh + (touchy1 - touchy0) * 0.01;
			if(gameStruct.roth > roth_max){gameStruct.roth = roth_max;}
			if(gameStruct.roth < roth_min){gameStruct.roth = roth_min;}
		}
	});
	
	// タッチ終了
	sprite.addEventListener('touchend', function(e){
		if(gameStruct.player.sradius > 0){
			// 弾が装填されていたら発射
			gameStruct.player.sfire = true;
		}else if(touchMode != 0 && touchMoveAction < 2){
			// 画面回転を行っていなかったらタッチした位置に移動
			gameStruct.player.getTouchedPosition(worldMat, e.localX, e.localY);
			var x = gameStruct.player.touchedx;
			var y = gameStruct.player.touchedy;
			gameStruct.player.x1 = x > gameStruct.floorx ? gameStruct.floorx : x < 0 ? 0 : x;
			gameStruct.player.y1 = y > gameStruct.floory ? gameStruct.floory : y < 0 ? 0 : y;
		}
		touchMode = 0;
	});
	
	// --------------------------------  --------------------------------
	
	game.replaceScene(scene);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ユーティリティ管理スプライト
function initUtility(game, scene, sprite){
	gameStruct.time = -8 * 3;
	gameStruct.score = 1000;
	gameStruct.damage = 0;
	gameStruct.tmpScr = 0;
	gameStruct.tmpDmg = 0;
	
	var group = new Group();
	var sprite1 = new Sprite(32, 32);
	var sprite2 = new Sprite(98, 16);
	var sprite3 = new Sprite(64, 16);
	var sprite4 = new Sprite(80, 16);
	var sprite5 = new Sprite(64, 16);
	var surface1 = new Surface(32, 32);
	var surface2 = new Surface(98, 16);
	var surface3 = new Surface(64, 16);
	var surface4 = new Surface(80, 16);
	var surface5 = new Surface(64, 16);
	
	sprite1.image = surface1;
	sprite2.image = surface2;
	sprite3.image = surface3;
	sprite4.image = surface4;
	sprite5.image = surface5;
	sprite1.x = game.width / 2 - 16;
	sprite1.y = 10;
	sprite2.x = game.width / 2 - 98 - 16;
	sprite2.y = 10;
	sprite3.x = game.width / 2 - 64 - 16;
	sprite3.y = 16 + 10;
	sprite5.x = game.width - 64 - 36;
	sprite5.y = game.height - 16 - 10;
	group.addChild(sprite1);
	group.addChild(sprite2);
	group.addChild(sprite3);
	group.addChild(sprite4);
	group.addChild(sprite5);
	scene.addChild(group);
	
	gameStruct.rotv = 0;
	gameStruct.roth = 0.3;
	
	// 感情ツールバータッチ時 吹き出しを変える
	sprite5.addEventListener('touchend', function(e){
		if(0 < e.localX && e.localX < 64 && 0 < e.localY && e.localY < 16){
			gameStruct.player.emotion = Math.ceil(e.localX / 16);
		}else{
			gameStruct.player.emotion = 0;
		}
		gameSocketPush_emotion(gameStruct.player.emotion);
	});
	
	group.addEventListener('enterframe', function(e){
		// フレーム処理
		surface1.clear();
		surface2.clear();
		surface3.clear();
		surface4.clear();
		surface5.clear();
		gameStruct.time++;
		
		// 表示用の得点とダメージ計算
		gameStruct.tmpScr = gameStruct.tmpScr + 0.3 * (gameStruct.score - gameStruct.tmpScr);
		gameStruct.tmpDmg = gameStruct.tmpDmg + 0.3 * (gameStruct.damage - gameStruct.tmpDmg);
		// ゲーム終了確認
		if(gameStruct.time > gameStruct.finishTime + 8 * 3){
			// ゲーム終了
			game.popScene();
			var id = location.pathname.match(/^\/games\/(\d+)/);
			if(id == null){
				// ローカルなど9leap以外で遊んでいる場合
				toggleTitleScene(game);
			}else{
				// ハイスコア登録
				location.replace([
					'http://9leap.net/games/', id[1], '/result',
					'?score=', encodeURIComponent((gameStruct.score > 0) ? gameStruct.score : 0),
					'&result=', encodeURIComponent(gameStruct.score + "点タクト!! " + gameStruct.damage + "%ダメージ!!")
				].join(''));
			}
		}
		
		// 時計描画
		surface1.context.save();
		surface1.draw(game.assets['img/util.png'], 0, 64, 32, 32, 0, 0, 32, 32);
		if(0 <= gameStruct.time && gameStruct.time < gameStruct.finishTime){
			surface1.context.translate(16, 16);
			surface1.context.rotate(2 * Math.PI * gameStruct.time / gameStruct.finishTime);
			surface1.context.translate(-16, -16);
		}
		surface1.draw(game.assets['img/util.png'], 32, 64, 32, 32, 0, 0, 32, 32);
		surface1.context.restore();
		
		// スコア描画
		var num;
		var s = Math.ceil(Math.abs(gameStruct.tmpScr));
		if(gameStruct.tmpScr > gameStruct.score){s -= 1;}
		for(var i = 0; i < 6; i++){
			num = Math.floor(s % 10);
			if(gameStruct.tmpScr >= 0){
				surface2.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5) +  0, 16, 16, (6 - i - 1) * 16, 0, 16, 16);
			}else{
				surface2.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5) + 32, 16, 16, (6 - i - 1) * 16, 0, 16, 16);
			}
			s /= 10;
		}
		
		// ダメージ描画
		surface3.draw(game.assets['img/util.png'], 64, 80, 16, 16, 48, 0, 16, 16);
		var d = Math.ceil(gameStruct.tmpDmg);
		if(gameStruct.tmpDmg > gameStruct.damage){d -= 1;}
		if(d < 100){
			num = Math.floor(d     ) % 10; surface3.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5), 16, 16, 32, 0, 16, 16);
			num = Math.floor(d / 10) % 10; surface3.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5), 16, 16, 16, 0, 16, 16);
		}else{
			num = Math.floor(d      ) % 10; surface3.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5) + 32, 16, 16, 32, 0, 16, 16);
			num = Math.floor(d /  10) % 10; surface3.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5) + 32, 16, 16, 16, 0, 16, 16);
			num = Math.floor(d / 100) % 10; surface3.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5) + 32, 16, 16,  0, 0, 16, 16);
		}
		
		// 開始終了文字描画
		if(gameStruct.time < 0 && Math.abs(gameStruct.time) % 8 < 5){
			// ゲーム開始前
			surface4.draw(game.assets['img/util.png'], 0,  96, 80, 16, 0, 0, 80, 16);
			sprite4.x = (game.width - 80) / 2;
			sprite4.y = (game.height - 10) / 2;
		}else if(gameStruct.time > gameStruct.finishTime){
			// タイムアップ
			surface4.draw(game.assets['img/util.png'], 0, 112, 80, 16, 0, 0, 80, 16);
			sprite4.x = (game.width - 80) / 2;
			sprite4.y = (game.height - 10) / 2;
		}else{
			sprite4.x = 0;
			sprite4.y = 0;
		}
		
		// 感情吹き出しツールバー描画
		if(gameStruct.gameSocketConnected){
			surface5.draw(game.assets['img/emotion.png']);
		}
	});
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
function Player(img, x, y, z){
	// プレイヤー初期化
	this.pimg = img
	this.action = 0;
	this.x0 = x; // プレイヤー現在位置
	this.y0 = y;
	this.z0 = z;
	this.x1 = this.x0; // プレイヤー目標位置
	this.y1 = this.y0;
	this.z1 = this.z0;
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;
	this.rotate = 90 * Math.PI / 180;
	this.radius = 0.3;
	this.ground = false;
	this.emotion = 0;
	// ショット初期化
	this.sradius = 0;
	this.sfire = false;
	// タッチ情報
	this.touchedx = 0;
	this.touchedy = 0;
	
	// 計算
	this.calc = function(){
		this.action += 1;
		
		// 速度の計算
		if(!this.ground){
			// 空中にいる
			this.vz -= 0.1;
			// 弾のリセット
			this.sradius = 0;
			this.sfire = false;
		}else if(this.vz != 0){
			// 着地の瞬間
			this.x1 = this.x0;
			this.y1 = this.y0;
			this.z1 = this.z0;
			this.vx = 0;
			this.vy = 0;
			this.vz = 0;
		}else if(this.sradius > 0 && this.sfire){
			// 弾の発射
			gameStruct.score += 1;
			gameStruct.damage += 1;
			var sx = this.x0 + (0.3 + this.sradius) * Math.cos(this.rotate);
			var sy = this.y0 + (0.3 + this.sradius) * Math.sin(this.rotate);
			pushShot(sx, sy, this.rotate, this.sradius);
			gameSocketPush_shot(sx, sy, this.rotate, this.sradius);
			// 速度変更
			this.vx = -0.1 * Math.cos(this.rotate);
			this.vy = -0.1 * Math.sin(this.rotate);
			this.vz = 0.1;
			// 弾のリセット
			this.sradius = 0;
			this.sfire = false;
		}else if((i = isHitShot(this.x0, this.y0, this.radius)) >= 0){
			// 弾があたった時
			pushEffect(3, this.x0, this.y0, 0);
			gameStruct.score -= 100;
			gameSocketPush_score(100);
			gameStruct.damage += 10;
			// 速度変更
			var x = this.x0 - gameStruct.shotPool[i].x;
			var y = this.y0 - gameStruct.shotPool[i].y;
			var rot = Math.atan2(y, x) + Math.PI;
			var vec = 0.1 * (1 + gameStruct.damage / 100);
			this.vx = -vec * Math.cos(rot);
			this.vy = -vec * Math.sin(rot);
			this.vz = 0.2;
			// 弾のリセット
			this.sradius = 0;
			this.sfire = false;
		}else if((i = isHitEnemy(this.x0, this.y0, this.radius)) >= 0){
			// 敵があたった時
			pushEffect(3, this.x0, this.y0, 0);
			gameStruct.score -= 100;
			gameStruct.damage += 10;
			// 速度変更
			var x = this.x0 - gameStruct.enemyPool[i].x;
			var y = this.y0 - gameStruct.enemyPool[i].y;
			var rot = Math.atan2(y, x) + Math.PI;
			var vec = 0.1 * (1 + gameStruct.damage / 100);
			this.vx = -vec * Math.cos(rot);
			this.vy = -vec * Math.sin(rot);
			this.vz = 0.2;
			// 弾のリセット
			this.sradius = 0;
			this.sfire = false;
		}else if(this.sradius > 0){
			// 弾ため
			this.sradius = this.sradius + 0.03 * (2 - this.sradius);
			this.vx = 0;
			this.vy = 0;
			this.vz = 0;
		}else{
			// 目標位置に向けて速度を設定する
			this.vx = this.x1 - this.x0;
			this.vy = this.y1 - this.y0;
			if(this.vx != 0 || this.vy != 0){
				this.rotate = Math.atan2(this.vy, this.vx);
				var vxmax = 0.2 * Math.cos(this.rotate);
				var vymax = 0.2 * Math.sin(this.rotate);
				this.vx = Math.abs(vxmax) < Math.abs(this.vx) ? vxmax : this.vx;
				this.vy = Math.abs(vymax) < Math.abs(this.vy) ? vymax : this.vy;
			}else{
				this.action = 0;
			}
		}
		
		// 速度から位置を計算する
		this.x0 += this.vx;
		this.y0 += this.vy;
		this.z0 += this.vz;
		
		// 接地確認
		this.ground = this.z0 <= 0;
		this.ground &= (0 <= this.x0 && this.x0 <= gameStruct.floorx);
		this.ground &= (0 <= this.y0 && this.y0 <= gameStruct.floory);
		if(this.ground){this.z0 = 0;}
		
		// 谷底確認
		if(this.z0 < -10){
			this.x0 = gameStruct.floorx / 2;
			this.y0 = gameStruct.floory / 2;
			this.z0 = 6;
			this.x1 = this.x0;
			this.y1 = this.y0;
			this.z1 = this.z0;
			this.vx = 0;
			this.vy = 0;
			this.vz = 0;
			this.emotion = 0;
		}
	}
	
	// 描画
	this.draw = function(mat){
		var u = 0;
		// 足踏み
		var act = Math.floor(this.action / 2) % 4;
		if(this.action == 0){u = 0;}
		else if(this.sradius > 0){u = 0.25;}
		else if(!this.ground){u = 0.25;}
		else if(act == 1){u = 0.25;}
		else if(act == 3){u = 0.75;}
		else{u = 0.50;}
		
		var size = this.radius * 2 / 0.6;
		characterBillBoard(this.pimg, mat, this.x0, this.y0, this.z0, this.rotate, u, size, size);
		
		// 影描画
		if(this.z0 >= 0){
			pushShadowSquare(mat, this.radius, this.x0, 0, this.y0);
		}
		
		// ショット描画
		if(this.sradius > 0){
			var size = this.sradius * 2;
			var sx = this.x0 + (0.3 + this.sradius) * Math.cos(this.rotate);
			var sy = this.y0 + (0.3 + this.sradius) * Math.sin(this.rotate);
			mulMat44Translate(gameStruct.tmpMat1, mat, sx, 0.25, sy);
			pushBillBoard(gameStruct.img3, gameStruct.tmpMat1, size, 0, 0, 32, 32);
		}
		
		// 吹き出し描画
		emotionBillBoard(gameStruct.img6, mat, this.x0, this.y0, this.z0 + 1, this.emotion);
	}
	
	// クリックした点からy=0平面上のxzを求める
	this.getTouchedPosition = function(m, x, y){
		// 変換行列の逆行列を求める
		mulMat44(gameStruct.tmpMat1, engineStruct.projectionMatrix, m);
		mat44Inverse(gameStruct.tmpMat2, gameStruct.tmpMat1);
		// 逆行列から座標を求める
		var z = -(gameStruct.tmpMat2._21 * x + gameStruct.tmpMat2._22 * y + gameStruct.tmpMat2._24) / gameStruct.tmpMat2._23;
		var w = gameStruct.tmpMat2._41 * x + gameStruct.tmpMat2._42 * y + gameStruct.tmpMat2._43 * z + gameStruct.tmpMat2._44;
		var xx = (gameStruct.tmpMat2._11 * x + gameStruct.tmpMat2._12 * y + gameStruct.tmpMat2._13 * z + gameStruct.tmpMat2._14) / w;
		var zz = (gameStruct.tmpMat2._31 * x + gameStruct.tmpMat2._32 * y + gameStruct.tmpMat2._33 * z + gameStruct.tmpMat2._34) / w;
		this.touchedx = xx;
		this.touchedy = zz;
	}
}

// キャラクタビルボード描画関数
function characterBillBoard(img, mat, x, y, z, rotate, u0, xsize, ysize){
	// 角度
	var v0 = 0;
	var angle = (rotate - gameStruct.rotv) / Math.PI * 180;
	while(angle > 360 - 45){angle -= 360;}
	while(angle <= 0 - 45){angle += 360;}
	if(angle < 45){v0 = 0.75;}
	else if(angle <= 135){v0 = 0.00;}
	else if(angle < 225){v0 = 0.25;}
	else{v0 = 0.50;}
	// テクスチャ座標
	var v1 = v0 + 0.25;
	var u1 = u0 + 0.25;
	u0 *= img.width;
	u1 *= img.width;
	v0 *= img.height;
	v1 *= img.height;
	gameStruct.vec0.u = u1; gameStruct.vec0.v = v0;
	gameStruct.vec1.u = u0; gameStruct.vec1.v = v0;
	gameStruct.vec2.u = u0; gameStruct.vec2.v = v1;
	gameStruct.vec3.u = u1; gameStruct.vec3.v = v1;
	
	// キャラクタ位置
	mulMat44Translate(gameStruct.tmpMat1, mat, x, z, y);
	// 垂直軸の回転打ち消し
	gameStruct.tmpMat1._11 = gameStruct.tmpMat1._33 = 1;
	gameStruct.tmpMat1._13 = gameStruct.tmpMat1._21 = 0;
	gameStruct.tmpMat1._23 = gameStruct.tmpMat1._31 = 0;
	// キャラクタ大きさ
	mulMat44Scale(gameStruct.tmpMat2, gameStruct.tmpMat1, xsize, ysize, 0);
	
	// キャラクタ描画
	pushTexTriangle(img, gameStruct.tmpMat2, gameStruct.vec0, gameStruct.vec1, gameStruct.vec2);
	pushTexTriangle(img, gameStruct.tmpMat2, gameStruct.vec0, gameStruct.vec2, gameStruct.vec3);
}

// 感情吹き出しビルボード描画関数
function emotionBillBoard(img, mat, x, y, z, type){
	if(0 < type && type <= 4){
		var u0 = 16 * (type - 1);
		var v0 = 0;
		var u1 = u0 + 16;
		var v1 = v0 + 16;
		gameStruct.vec0.u = u1; gameStruct.vec0.v = v0;
		gameStruct.vec1.u = u0; gameStruct.vec1.v = v0;
		gameStruct.vec2.u = u0; gameStruct.vec2.v = v1;
		gameStruct.vec3.u = u1; gameStruct.vec3.v = v1;
		
		// 吹き出し位置
		mulMat44Translate(gameStruct.tmpMat1, mat, x, z, y);
		// 回転打ち消し
		mat44Billboard(gameStruct.tmpMat2, gameStruct.tmpMat1);
		// 吹き出し大きさ
		mulMat44Scale(gameStruct.tmpMat1, gameStruct.tmpMat2, 0.5, 0.5, 0);
		
		// 吹き出し描画
		pushTexTriangle(img, gameStruct.tmpMat1, gameStruct.vec0, gameStruct.vec1, gameStruct.vec2);
		pushTexTriangle(img, gameStruct.tmpMat1, gameStruct.vec0, gameStruct.vec2, gameStruct.vec3);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 弾クラス
function Shot(){
	this.exist = false;
	this.x = 0;
	this.y = 0;
	this.rotate = 0;
	this.radius = 0;
	this.level = 0;
	
	// 計算
	this.calc = function(){
		if(this.exist){
			// ショット移動
			this.x += 0.2 * Math.cos(this.rotate);
			this.y += 0.2 * Math.sin(this.rotate);
		
			// 位置による消滅判定
			var rimit = 5;
			if(this.x < -rimit || gameStruct.floorx + rimit < this.x){this.exist = false;}
			if(this.y < -rimit || gameStruct.floory + rimit < this.y){this.exist = false;}
		}
		
	}
	
	// 描画
	this.draw = function(mat){
		if(this.exist){
			var size = this.radius * 2;
			mulMat44Translate(gameStruct.tmpMat1, mat, this.x, 0.25, this.y);
			pushBillBoard(gameStruct.img3, gameStruct.tmpMat1, size, 0, 0, 32, 32);
		}
	}
}

// 弾登録
function pushShot(x, y, rotate, radius){
	for(var i = 0; i < gameStruct.shotPool.length && gameStruct.shotPool[i].exist; i++);
	if(i == gameStruct.shotPool.length){gameStruct.shotPool.push(new Shot());}
	gameStruct.shotPool[i].x = x;
	gameStruct.shotPool[i].y = y;
	gameStruct.shotPool[i].rotate = rotate;
	gameStruct.shotPool[i].radius = radius;
	gameStruct.shotPool[i].exist = true;
	gameStruct.shotPool[i].level = 1;
}

// 弾衝突判定
function isHitShot(x, y, radius){
	for(var i = 0; i < gameStruct.shotPool.length; i++){
		if(gameStruct.shotPool[i].exist){
			var xx = gameStruct.shotPool[i].x - x;
			var yy = gameStruct.shotPool[i].y - y;
			var rr = gameStruct.shotPool[i].radius + radius;
			if(xx * xx + yy * yy < rr * rr){
				return i;
			}
		}
	}
	return -1;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 敵クラス
function Enemy(){
	this.mode = 0;
	this.action = 0;
	this.x = 0;
	this.y = 0;
	this.rotate = 0;
	this.radius = 0;
	this.type = 0;
	this.myEnemy = true;
	
	// 計算
	this.calc = function(){
		if(this.mode != 0){
			this.action += 1;
		
			// あたり判定
			if(this.mode == 1){
				if((i = isHitShot(this.x, this.y, this.radius)) >= 0){
					// 弾による消滅
					var num = gameStruct.shotPool[i].level++;
					for(var j = 0; j < num; j++){
						// 同じ玉で複数倒すと点数アップ
						pushEffect(2, this.x, this.y, 0);
						gameStruct.score += 100;
					}
					this.action = 0;
					this.mode = 2;
				}else if((this.action > 16 && Math.random() < 0.05)){
					// 自然消滅
					gameStruct.score -= 10;
					this.action = 0;
					this.mode = 3;
				}else if(gameStruct.time > gameStruct.finishTime){
					// 時間切れ消滅
					this.action = 0;
					this.mode = 3;
				}
			}else if(this.action > 5){
				this.mode = 0;
			}
		}else{
			if(this.myEnemy && Math.random() < 0.2){
				pushEnemy_random();
			}
		}
	}
	
	// 描画
	this.draw = function(mat){
		if(this.mode != 0){
			var xsize = this.radius * 2 / 0.8;
			var ysize = this.radius * 2 / 0.8;
			if(this.mode == 1){
				xsize = xsize * (this.action < 8 ? [2.0, 1.2, 0.8, 0.5, 0.6, 0.7, 0.8, 0.9][this.action] : 1);
				ysize = ysize * (this.action < 8 ? [0.1, 0.8, 1.8, 2.0, 1.8, 1.6, 1.4, 1.2][this.action] : 1);
			}else if(this.mode == 2){
				xsize = xsize * (this.action < 5 ? [0.9, 0.8, 0.6, 0.4, 0.1][this.action] : 0);
				ysize = ysize * (this.action < 5 ? [0.9, 0.8, 0.6, 0.4, 0.1][this.action] : 0);
			}else if(this.mode == 3){
				xsize = xsize * (this.action < 5 ? [0.7, 0.5, 0.8, 1.2, 2.0][this.action] : 0);
				ysize = ysize * (this.action < 5 ? [1.6, 2.0, 1.8, 0.8, 0.1][this.action] : 0);
			}
			characterBillBoard(gameStruct.img4, mat, this.x, this.y, 0, this.rotate, this.type * 0.25, xsize, ysize);
			
			// 影描画
			pushShadowSquare(mat, this.radius, this.x, 0, this.y);
		}
	}
}

// 敵登録
function pushEnemy(x, y, rot, rad, type, mine){
	if(gameStruct.time > gameStruct.finishTime){return;}
	for(var i = 0; i < gameStruct.enemyPool.length && gameStruct.enemyPool[i].mode != 0; i++);
	if(i == gameStruct.enemyPool.length){gameStruct.enemyPool.push(new Enemy());}
	gameStruct.enemyPool[i].action = 0;
	gameStruct.enemyPool[i].x = x;
	gameStruct.enemyPool[i].y = y;
	gameStruct.enemyPool[i].rotate = rot;
	gameStruct.enemyPool[i].radius = rad;
	gameStruct.enemyPool[i].type = type;
	gameStruct.enemyPool[i].mode = 1;
	gameStruct.enemyPool[i].myEnemy = mine;
}

// ランダムな位置に敵登録
function pushEnemy_random(){
	var x = Math.random() * gameStruct.floorx;
	var y = Math.random() * gameStruct.floory;
	var rot = Math.random() * 2 * Math.PI;
	var rad = Math.random() * 0.2 + 0.3;
	var type = Math.floor(Math.random() * 4);
	pushEnemy(x, y, rot, rad, type, true);
	gameSocketPush_enem(x, y, rot, rad, type);
}

// 敵衝突判定
function isHitEnemy(x, y, radius){
	for(var i = 0; i < gameStruct.enemyPool.length; i++){
		if(gameStruct.enemyPool[i].mode == 1){
			var xx = gameStruct.enemyPool[i].x - x;
			var yy = gameStruct.enemyPool[i].y - y;
			var rr = gameStruct.enemyPool[i].radius + radius;
			if(xx * xx + yy * yy < rr * rr){
				return i;
			}
		}
	}
	return -1;
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
					this.vz -= 0.1;
				}
				break;
		}
		// 描画
		switch(this.type){
			case 1:
				// 砂埃
				mulMat44Translate(gameStruct.tmpMat1, mat, this.x, this.z + 0.2, this.y);
				pushBillBoard(gameStruct.img5, gameStruct.tmpMat1, 0.8, 16 * Math.floor(this.action / 3), 0, 16, 16, 0);
				if(this.action == 12){this.type = 0;}
				break;
			case 2:
				// 会心スター
				mulMat44Translate(gameStruct.tmpMat1, mat, this.x, this.z, this.y);
				pushBillBoard(gameStruct.img5, gameStruct.tmpMat1, 0.8, 16 * (Math.floor(this.action / 3) % 2), 16, 16, 16, 0);
				break;
			case 3:
				// 痛恨スター
				mulMat44Translate(gameStruct.tmpMat1, mat, this.x, this.z, this.y);
				pushBillBoard(gameStruct.img5, gameStruct.tmpMat1, 0.8, 16 * (Math.floor(this.action / 3) % 2 + 2), 16, 16, 16, 0);
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
			var velv = 0.05 + 0.1 * Math.random();
			var velh = 0.35 + 0.1 * Math.random();
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

