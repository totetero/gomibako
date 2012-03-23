// グルリン (コードネーム: ハコニワラビリンス)
// メインソース ゲームの進行を管理する
//
// 本ソースコードはMITライセンスとバンザイライセンスのデュアルライセンスです
// ソースコードの一部もしくは全部使用したものを再配布する際には
// 上記のライセンスのうち片方を選択してください。
// バンザイライセンスを選択した人は使用前に「ばんじゃーい」と3回叫んでください。
// 叫ばないと再配布権がないので誰も見てなくても叫んで下さい。
// 作者は、ソフトウェアに関してなんら責任を負いません。
//
// Copyright (c) 2012 totetero

enchant();
var game;
window.onload = function(){
	game = new Game(320, 320);
	game.preload('img/title.png', 'img/ctrl.png', 'img/util.png');
	game.fps = 60;
	game.onload = function(){
		var scene = new Scene3D();
		scene.backgroundColor = '#ffffff';
		scene.setDirectionalLight(new DirectionalLight());
		var camera = new Camera3D();
		scene.setCamera(camera);
		camera.z = 15;
		
		// 回転用スプライト
		var trackball = new Sprite3D();
		scene.addChild(trackball);
		trackball.addEventListener('enterframe', function(e){
			quat4.toMat4(rotq, trackball.rotation);
			mat4.translate(trackball.rotation, [-player.x, -player.y, -player.z]);
		});
		
		// ----------------------------------------------------------------
		// タイトル
		var title = new Sprite(240, 80);
		title.image = game.assets['img/title.png'];
		game.rootScene.addChild(title);
		
		// ----------------------------------------------------------------
		// マップ ゲーム進行のイベント処理は大体こいつに任せている
		var hakoniwa = new Map3D(start_map);
		hakoniwa.addEventListener('enterframe', function(e){
			if(player.pz < 1 || player.pz > hakoniwa.zsize - 1){
				// 穴に落ちきったらマップを切り替えて迷宮へ案内する
				if(player.pz > hakoniwa.zsize - 1){
					// 空の穴に落ちたらハードモード
					game.hardMode = true;
					var rot = Math.PI / 180 / 2 * 30;
					quat4.set([-Math.sin(rot), 0, 0, Math.cos(rot)], rotq);
				}else{
					// ノーマルモード
					game.hardMode = false;
				}
				// タイトルを消す
				game.rootScene.removeChild(title);
				// タイムカウンタ表示
				var counter = TimeCounter();
				game.rootScene.addChild(counter);
				// マップを入れ替える
				trackball.removeChild(hakoniwa);
				hakoniwa.deleteBuffer();
				hakoniwa = new Map3D();
				trackball.addChild(hakoniwa);
				// プレイヤー初期位置
				if(1){
					// 正しいスタート位置
					player.px = 2.5;
					player.py = 2.5;
					player.pz = hakoniwa.zsize - 1.5;
				}else{
					// ゴール前 テスト用だし卑怯！！
					player.px = hakoniwa.xsize - 3.5;
					player.py = hakoniwa.ysize - 3.5;
					player.pz = 2.5;
				}
				player.useArrowKey = false;
				// 簡易マップ
				var miniMap = hakoniwa.createMiniMapSprite(player);
				game.rootScene.addChild(miniMap);
				// ゴール処理
				hakoniwa.addEventListener('enterframe', function(e){
					if(player.pz < 1){
						// タイムカウンタを止める
						counter.stopCount();
						// 簡易マップを消す
						game.rootScene.removeChild(miniMap);
						// マップを入れ替える
						trackball.removeChild(hakoniwa);
						hakoniwa.deleteBuffer();
						hakoniwa = new Map3D(goal_map);
						trackball.addChild(hakoniwa);
						// 宝玉
						var treasurea = new Sphere();
						treasurea.x = 4.5;
						treasurea.z = 2.5;
						treasurea.y = 2;
						trackball.addChild(treasurea);
						// 宝玉の影
						var shadow = new Shadow()
						shadow.x = treasurea.x;
						shadow.z = treasurea.z;
						shadow.y = 1.01;
						trackball.addChild(shadow);
						// 難易度によって宝玉の大きさを変える
						if(game.hardMode){
							treasurea.mesh.texture.ambient = [1.0, 1.0, 0.1, 1.0];
							treasurea.scaleX = treasurea.scaleY = treasurea.scaleZ = 0.8;
							shadow.scaleX = shadow.scaleZ = 1.2;
						}else{
							treasurea.mesh.texture.ambient = [0.1, 1.0, 1.0, 1.0];
							treasurea.scaleX = treasurea.scaleY = treasurea.scaleZ = 0.4;
							shadow.scaleX = shadow.scaleZ = 0.6;
						}
						// プレイヤー初期位置
						player.px = 3.5;
						player.py = 6.5;
						player.pz = 1.5;
						player.vz = 0.2;
						player.rotate = Math.PI / 180 *  90;
						player.action2 = 1;
						var useArrowKey = player.useArrowKey;
						// クオータニオン回転を禁止する
						isQuat = false;
						var rot = Math.PI / 180 / 2 * 20;
						roth_min = Math.PI / 180 / 2 *  5;
						roth_max = Math.PI / 180 / 2 * 60;
						quat4.set([-Math.sin(rot), 0, 0, Math.cos(rot)], rotq);
						// ゲーム終了処理
						treasurea.addEventListener('enterframe', function(e){
							if(4 < player.px && player.px < 5 && 2 < player.py && player.py < 3){
								trackball.removeChild(treasurea);
								trackball.removeChild(shadow);
								// ハイスコア計算
								var str = Math.floor(counter.getCount() / 60) + "秒で" + (game.hardMode ? "月光の" : "大地の") + "宝玉を手に入れた。";
								if(!useArrowKey){str += "しかも動かずに！！";}
								var score = 60 * 60 * 60 - counter.getCount();
								if(score < 0){score = 0;}
								if(game.hardMode){score *= 3;}
								if(!useArrowKey){score *= 2;}
								// ハイスコア登録
								var id = location.pathname.match(/^\/games\/(\d+)/);
								if(id != null){
									location.replace([
										'http://9leap.net/games/', id[1], '/result',
										'?score=', encodeURIComponent(score),
										'&result=', encodeURIComponent(str)
									].join(''));
								}else{
									console.log(str, score);
								}
							}
						});
					}
				});
			}else if(player.pz < 5){
				// 穴落ち初めにクオータニオン回転を許可する 重力の方向を自在に制御できるようになるZE!!
				// ウォール・ウォーキング!!(SW2.0)
				isQuat = true;
			}
		});
		trackball.addChild(hakoniwa);
		
		// ----------------------------------------------------------------
		// キャラクタ 少女の名前は高崎具留里ちゃん!! もふーっ!!
		var player = new BillboardCharacter(3.5, 2.5, 7.5);
		player.addEventListener('enterframe', function(e){
			this.predraw(hakoniwa, isQuat);
		});
		trackball.addChild(player);
		
		// ----------------------------------------------------------------
		// タッチによる十字キー制御
		
		// 十字キー表示
		var keySprite = new Sprite(112, 112);
		var keySurface = new Surface(112, 112);
		keySprite.x = 10; keySprite.y = 198; keySprite.image = keySurface;
		keySprite.addEventListener('enterframe', function(e){
			keySurface.clear();
			var up = 0; if(game.input.up){up = 88;}
			var dn = 0; if(game.input.down){dn = 88;}
			var rt = 0; if(game.input.right){rt = 88;}
			var lt = 0; if(game.input.left){lt = 88;}
			keySurface.draw(game.assets['img/ctrl.png'],  0 + up,  0, 40, 48, 36,  0, 40, 48);
			keySurface.draw(game.assets['img/ctrl.png'], 48 + dn, 40, 40, 48, 36, 64, 40, 48);
			keySurface.draw(game.assets['img/ctrl.png'], 40 + rt,  0, 48, 40, 64, 36, 48, 40);
			keySurface.draw(game.assets['img/ctrl.png'],  0 + lt, 48, 48, 40,  0, 36, 48, 40);
		});
		game.rootScene.addChild(keySprite);
		
		// 十字キータッチ開始確認
		var keyEventStart = function(e){
			var x = e.x -  66;
			var y = e.y - 254;
			if(x * x + y * y < 56 * 56){return true;}
			return false;
		}
		
		// 十字キータッチ ui.enchant.jsからコードパクった
		var keyEvent = function(e){
			var x = e.x -  66;
			var y = e.y - 254;
			game.input.up = game.input.down = game.input.right = game.input.left = false;
			if (y < 0 && x < y * y * 0.1 && x > y * y * -0.1){game.input.up = true;}
			if (y > 0 && x < y * y * 0.1 && x > y * y * -0.1){game.input.down = true;}
			if (x > 0 && y < x * x * 0.1 && y > x * x * -0.1){game.input.right = true;}
			if (x < 0 && y < x * x * 0.1 && y > x * x * -0.1){game.input.left = true;}
			return true;
		}
		
		// 十字キータッチ終了
		var keyEventEnd = function(e){
			game.input.up = game.input.down = game.input.right = game.input.left = false;
		}
		
		// ----------------------------------------------------------------
		// タッチによるカメラ制御
		var touchx;
		var touchy;
		// 回転方式選択
		var isQuat = false;
		// クオータニオン回転
		var rotq = quat4.create();
		var touchq0 = quat4.create();
		var touchq1 = quat4.create();
		// オイラー角回転
		var rotv = Math.PI / 180 / 2 * 0;
		var roth = Math.PI / 180 / 2 * 30;
		var touchrv;
		var touchrh;
		var roth_max = Math.PI / 180 / 2 * 40;
		var roth_min = Math.PI / 180 / 2 * 10;
		// 回転角初期化
		quat4.multiply([0, -Math.sin(rotv), 0, Math.cos(rotv)], [-Math.sin(roth), 0, 0, Math.cos(roth)], rotq);
		// タッチ状態
		var touchMode = 0;
		
		// カメラ回転開始
		var camEventStart = function(e){
			touchx = e.x;
			touchy = e.y;
			// クオータニオンによる回転準備
			quat4.set(rotq, touchq0);
			// オイラー角による回転準備
			touchrv = rotv;
			touchrh = roth;
		}
		
		// カメラ回転途中
		var camEvent = function(e){
			if(isQuat){
				// クオータニオンによる回転
				var dx = -(e.x - touchx) * 0.03;
				var dy = -(e.y - touchy) * 0.03;
				var a = Math.sqrt(dx * dx + dy * dy);
				if(a != 0){
					var ar = a * 0.5;
					var as = Math.sin(ar) / a;
					quat4.set([dy * as, dx * as, 0, Math.cos(ar)], touchq1);
					quat4.multiply(touchq0, touchq1, rotq);
					quat4.set(rotq, touchq0);
					touchx = e.x;
					touchy = e.y;
				}
			}else{
				// オイラー角による回転
				rotv = touchrv + (e.x - touchx) * 0.03;
				roth = touchrh + (e.y - touchy) * 0.03;
				if(roth > roth_max){roth = roth_max;}
				if(roth < roth_min){roth = roth_min;}
				quat4.multiply([0, -Math.sin(rotv), 0, Math.cos(rotv)], [-Math.sin(roth), 0, 0, Math.cos(roth)], rotq);
			}
		}
		
		// ----------------------------------------------------------------
		// タッチ処理
		
		// タッチ開始
		game.rootScene.addEventListener('touchstart', function(e){
			if(keyEventStart(e)){
				touchMode = 1;
				keyEvent(e);
			}else{
				touchMode = 2;
				camEventStart(e);
			}
		});
	
		// タッチ途中
		game.rootScene.addEventListener('touchmove', function(e){
			if(touchMode == 1){
				keyEvent(e);
			}else if(touchMode == 2){
				camEvent(e);
			}
		});
		
		// タッチ終了
		var touchendFunc = function(e){
			if(touchMode == 1){
				keyEventEnd(e);
			}
			touchMode = 0;
		}
		game.rootScene.addEventListener('touchend', touchendFunc);
		
		// 現状のenchant.jsだとドラッグ中にマウスが画面外に出たときにマウスボタンを離すと
		// 画面内に戻ってきたときもマウスボタンを離しているのにおしっ放し状態になって困るから対策
		var mouseoutFlag = false;
		// マウスが画面外に出た時
		game._element.addEventListener('mouseout', function(e){
			if(e.x < 0 || 320 <= e.x || e.y < 0 || 320 <= e.y){mouseoutFlag = true;}
		}, false);
		// マウスが画面内に入ったとき
		game._element.addEventListener('mouseover', function(e){
			if(mouseoutFlag){
				if(e.which > 0){
					touchx = e.x;
					touchy = e.y;
				}else{
					touchendFunc(e);
				}
				mouseoutFlag = false;
			}
		}, false);
		
		// ----------------------------------------------------------------
	};
	
	game.start();
};

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// カウンタークラス作成

var TimeCounter = function(){
	var count = 0;
	var stop = false;
	var sprite = new Sprite(128, 16);
	var surface = new Surface(sprite.width, sprite.height);
	sprite.image = surface;
	sprite.x = game.width - sprite.width - 10;
	sprite.y = 10;
	sprite.addEventListener('enterframe', function(e){
		// カウント
		if(!stop){count++;}
		var s = count / 60;
		surface.clear();
		// 描画
		for(var i = 0; i < 8; i++){
			var num = Math.floor(s % 10);
			if(game.hardMode){
				surface.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5) + 32, 16, 16, (8 - i - 1) * 16, 0, 16, 16);
			}else{
				surface.draw(game.assets['img/util.png'], 16 * (num % 5), 16 * Math.floor(num / 5), 16, 16, (8 - i - 1) * 16, 0, 16, 16);
			}
			s /= 10;
			if(s < 1){break;}
		}
	});
	sprite.stopCount = function(){stop = true;}
	sprite.getCount = function(){return count;}
	return sprite;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 以下、マップデータ

var start_map = [[
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 0, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
],[
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 0, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
],[
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 0, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
],[
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 0, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
],[
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 0, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
],[
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 0, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
	[ 2, 2, 2, 2, 2, 2, 2, 2,],
],[
	[ 6, 6, 6, 6, 6, 6, 2, 2,],
	[ 6, 6, 6, 2, 0, 0, 0, 2,],
	[ 6, 2, 2, 2, 0, 0, 0, 2,],
	[ 2, 2, 2, 2, 0, 0, 0, 6,],
	[ 2, 2, 2, 2, 2, 2, 6, 6,],
	[ 6, 2, 2, 2, 6, 6, 6, 6,],
	[ 6, 2, 2, 6, 6, 6, 6, 6,],
	[ 6, 6, 2, 6, 6, 6, 6, 6,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 22, 22, 22, 22, 22, 22, 22, 22,],
	[ 22, 22, 22, 22, 22, 22, 22, 22,],
	[ 22, 22, 22, 22, 22, 22, 22, 22,],
	[ 22, 22, 22, 22, 22, 22, 22, 22,],
	[ 22, 22, 22, 22, 22, 22, 22, 22,],
	[ 22, 22,  0, 22, 22, 22, 22, 22,],
	[ 22, 22, 22, 22, 22, 22, 22, 22,],
	[ 22, 22, 22, 22, 22, 22, 22, 22,],
],];

var goal_map = [[
	[ 2, 2, 2, 2, 4, 4, 4, 4,],
	[ 2, 2, 22, 22, 22, 22, 22, 2,],
	[ 2, 2, 22, 22, 22, 22, 22, 2,],
	[ 2, 2, 22, 22, 22, 22, 22, 2,],
	[ 4, 2, 22, 22, 22, 22, 22, 4,],
	[ 4, 2, 22, 22, 22, 2, 4, 4,],
	[ 4, 4, 22, 61, 22, 2, 4, 4,],
	[ 4, 4, 22, 22, 22, 2, 2, 4,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 22, 0, 0, 0, 22, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 22, 0, 0, 0, 22, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 22, 0, 0, 0, 22, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 22, 0, 0, 0, 22, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 22, 0, 0, 0, 22, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 22, 0, 0, 0, 22, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],[
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
	[ 0, 0, 0, 0, 0, 0, 0, 0,],
],];
