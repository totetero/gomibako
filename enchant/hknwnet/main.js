// クライアント側のソースコードです
// いたずらはいやずら

enchant();
var game;
window.onload = function(){
	game = new Game(320, 320);
	game.fps = 60;
	game.onload = function(){
		var scene = new Scene3D();
		scene.backgroundColor = '#ffffff';
		scene.setDirectionalLight(new DirectionalLight());
		
		// ----------------------------------------------------------------
		// ソケットテスト 本ソースコードのソケット系の処理はすべてこのセクションに書かれています
		var connect = false;
		if(typeof io != "undefined"){
			var socket;
			socket = io.connect("http://totetero.com:10080");
			// 接続切断
			socket.on('connect', function(){connect = true; console.log("サーバに接続したよ");});
			socket.on('disconnect', function(){connect = false; console.log("サーバが落ちたよ");});
			// データ受信 マップ系
			socket.on('smp', function(map){hakoniwa.setMap(map);});
			socket.on('smc', function(x, y, z, chip){hakoniwa.setMapChip(x, y, z, chip);});
			// データ受信 プレイヤー系
			socket.on('npl', function(id){new_netpl(id);});
			socket.on('dpl', function(id){del_netpl(id);});
			socket.on('mpl', function(id, x, y, z, r, a){mov_netpl(id, x, y, z, r, a);});
		}else{
			console.log("サーバに接続できなかったよ");
		}
		
		// データ送信 マップ系
		var sendSocket_mapchip = function(x, y, z, chip){if(connect){socket.emit('smc', x, y, z, chip);}}
		// データ送信 プレイヤー系
		var sendSocket_player = function(x, y, z, r, a){if(connect){socket.emit('mpl', x, y, z, r, a);}}
		
		// ----------------------------------------------------------------
		// ハコニワを作る
		var hakoniwa = new Map3D(map);
		hakoniwa.mesh.texture.src = "img/mapchip.png";
		scene.addChild(hakoniwa);
		
		// マップを再設定する関数
		hakoniwa.setMap = function(map){
			this.map = map;
			this.xsize = this.map[0][0].length;
			this.ysize = this.map[0].length;
			this.zsize = this.map.length;
			this.grass();
			this.updateBuffer();
			// プレイヤー位置もリセット
			player.px = 1 + Math.random() * (this.xsize - 2);
			player.py = 1 + Math.random() * (this.ysize - 2);
			player.pz = this.zsize - 1;
		}
		
		// マップチップを置き換える関数
		hakoniwa.setMapChip = function(x, y, z, chip){
			this.map[z][y][x] = chip;
			this.grass();
			this.updateBuffer();
		}
		
		// 草を生やす関数wwwwwwww
		hakoniwa.grass = function(){
			for(var i = 0; i < this.xsize; i++){
				for(var j = 0; j < this.ysize; j++){
					for(var k = 1; k < this.zsize - 1; k++){
						var select0 = this.zsize - k - 0;
						var select1 = this.zsize - k - 1;
						if(this.map[select1][j][i] != 0){
							if(this.map[select0][j][i] == 0){
								this.map[select1][j][i] = 4;
							}else{
								this.map[select1][j][i] = 2;
							}
						}
					}
					this.map[this.zsize - 1][j][i] = 0;
					this.map[0][j][i] = 2;
				}
			}
		}
		
		// マップを書き出す
		game.writeMap = function(){
			var field = "var map = [";
			for(var k = 0; k < hakoniwa.map.length; k++){
				field = field + "[\n";
				for(var j = 0; j < hakoniwa.map[0].length; j++){
					field = field + "\t[";
					for(var i = 0; i < hakoniwa.map[0][0].length; i++){
						field = field + " " + hakoniwa.map[k][j][i] + ",";
					}
					field = field + "],\n";
				}
				field = field + "],";
			}
			field = field + "];";
			return field;
		}
		
		// ----------------------------------------------------------------
		// ネットワーク上の他プレイヤー
		var netplList = new Object();
		
		// 他プレイヤーを追加する関数
		var new_netpl = function(id){
			console.log("追加 " + id);
			netplList[id] = new Character(0, 0, 0);
			netplList[id].mesh.texture = player.mesh.texture;
			scene.addChild(netplList[id]);
		}
		
		// 他プレイヤーを除去する関数
		var del_netpl = function(id){
			console.log("除去 " + id);
			scene.removeChild(netplList[id]);
		}
		
		// 他プレイヤーの位置変更
		var mov_netpl = function(id, x, y, z, r, a){
			console.log("移動 " + id);
			netplList[id].px = x;
			netplList[id].py = y;
			netplList[id].pz = z;
			netplList[id].rotate = r;
			netplList[id].action = a;
			netplList[id].altitude = hakoniwa.getHeight(netplList[id]);
		}
		
		// ----------------------------------------------------------------
		// プレイヤー
		var netAction = 0;
		var player = new Character(2.5, 2.5, 3);
		player.mesh.texture.src = "img/player.png";
		player.addEventListener('enterframe', function(e){
			this.action++;
			// 方向の計算
			if      (game.input.right && game.input.up)   {this.rotate = Math.PI * 1.74 - this.camera_rotate;}
			else if (game.input.left  && game.input.up)   {this.rotate = Math.PI * 1.26 - this.camera_rotate;}
			else if (game.input.left  && game.input.down) {this.rotate = Math.PI * 0.74 - this.camera_rotate;}
			else if (game.input.right && game.input.down) {this.rotate = Math.PI * 0.26 - this.camera_rotate;}
			else if (game.input.right)   {this.rotate = Math.PI * 0.00 - this.camera_rotate;}
			else if (game.input.up)      {this.rotate = Math.PI * 1.50 - this.camera_rotate;}
			else if (game.input.left)    {this.rotate = Math.PI * 1.00 - this.camera_rotate;}
			else if (game.input.down)    {this.rotate = Math.PI * 0.50 - this.camera_rotate;}
			else{this.action = 0;}
			
			// 水平軸方向速度の計算
			if(this.action > 0){
				var speed = 3 / 60;
				this.vx = speed * Math.cos(this.rotate);
				this.vy = speed * Math.sin(this.rotate);
			}else{
				this.vx = 0;
				this.vy = 0;
			}
			
			if(this.altitude > 0.1){
				// 地面との距離がある場合は空中
				this.action = 1;
				this.vz -= 0.8 / 60;
				if(game.input.a && this.vz < 0){
					// 多段ジャンプ
					this.vz = 15 / 60;
				}
			}else if(game.input.a){
				// ジャンプ
				this.vz = 15 / 60;
			}else if(game.input.b){
				this.action = 1;
				this.vx = 0;
				this.vy = 0;
			}
			
			// プレイヤー位置にカメラを向ける
			setCamera(this.px, this.py, this.pz);
			
			// あたり判定
			hakoniwa.collision(this);
			// 位置の計算
			this.px += this.vx;
			this.py += this.vy;
			this.pz += this.vz;
			// データ送信
			if(netAction++ % 3 == 0){sendSocket_player(this.px, this.py, this.pz, this.rotate, this.action);}
		});
		scene.addChild(player);
		
		// ----------------------------------------------------------------
		// タッチによるカメラ制御
		var camera = new Camera3D();
		scene.setCamera(camera);
		
		// 垂直軸中心の回転
		var camRotV = 0;
		// 水平軸中心の回転
		var camRotH = Math.PI / 180 * 30;
		// カメラの距離
		var camDist = 20;
		
		var camRotH_max = Math.PI / 180 *  60;
		var camRotH_min = Math.PI / 180 * -60;
		var touchx;
		var touchy;
		var touchrv;
		var touchrh;
		var touchMoved;
		
		var touchSprite = new Sprite(game.width, game.height);
		game.rootScene.addChild(touchSprite);
		
		// パラメータからカメラの設定 中心はプレイヤーの位置
		function setCamera(px, py, pz){
			camera.centerX = px;
			camera.centerY = pz; // キャラクタの座標はz軸を高さ方向にしているが、
			camera.centerZ = py; // glの表示上はy軸が高さ方向なので入れ替え カメラもいじる場合は気をつけよう
			camera.x = camera.centerX + camDist * Math.cos(camRotH) * Math.sin(camRotV);
			camera.y = camera.centerY + camDist * Math.sin(camRotH);
			camera.z = camera.centerZ + camDist * Math.cos(camRotH) * Math.cos(camRotV);
		}
	
		// タッチ開始
		touchSprite.addEventListener('touchstart', function(e){
			touchx = e.x;
			touchy = e.y;
			touchrv = camRotV;
			touchrh = camRotH;
			touchMoved = false;
		});
	
		// タッチ途中
		touchSprite.addEventListener('touchmove', function(e){
			camRotV = touchrv - (e.x - touchx) * 0.03;
			camRotH = touchrh + (e.y - touchy) * 0.03;
			if(camRotH > camRotH_max){camRotH = camRotH_max;}
			if(camRotH < camRotH_min){camRotH = camRotH_min;}
			touchMoved = true;
		});
		
		// タッチ終了 マップチップの設置と除去
		touchSprite.addEventListener('touchend', function(e){
			if(!touchMoved){
				// マウス位置からマップチップを選択
				hakoniwa.select(e.x, e.y);
				if(0 < hakoniwa.selectedz && hakoniwa.selectedz < hakoniwa.zsize - 1){
					var chip = hakoniwa.selectType ? 2 : 0;
					//hakoniwa.setMapChip(hakoniwa.selectedx, hakoniwa.selectedy, hakoniwa.selectedz, chip);
					sendSocket_mapchip(hakoniwa.selectedx, hakoniwa.selectedy, hakoniwa.selectedz, chip);
				}
			}
		});
		
		// ----------------------------------------------------------------
		// 設置モード変更ボタン
		hakoniwa.selectType = 1;
		var label1 = new Label("<B>push</B>");
		var label2 = new Label("pop");
		label1.x =  5;
		label1.y =  0;
		label2.x =  5;
		label2.y = 15;
		game.rootScene.addChild(label1);
		game.rootScene.addChild(label2);
		label1.addEventListener('touchend', function(e){hakoniwa.selectType = 1; label1.text = "<B>push</B>"; label2.text = "pop";});
		label2.addEventListener('touchend', function(e){hakoniwa.selectType = 0; label1.text = "push"; label2.text = "<B>pop</B>";});
		
		// ----------------------------------------------------------------
		// とりあえずバーチャルパッドを表示 ボタン足りないがな！！
		var pad = new Pad();
		pad.x = 0;
		pad.y = 219;
		game.rootScene.addChild(pad);
		
		// ----------------------------------------------------------------
		// キーボード入力 a→z b→x
		game.keybind(90, 'a');
		game.keybind(88, 'b');
		scene.addEventListener('abuttondown', function(e){game.input.a = true;});
		scene.addEventListener('abuttonup', function(e){game.input.a = false;});
		scene.addEventListener('bbuttondown', function(e){game.input.b = true;});
		scene.addEventListener('bbuttonup', function(e){game.input.b = false;});
		
		// ----------------------------------------------------------------
	};
	
	game.start();
};

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 接続失敗時のマップ
map = [[
	[ 4,  4,  4,  4,  4],
	[ 4,  4,  4,  4,  4],
	[ 4,  4,  4,  4,  4],
	[ 4,  4,  4,  4,  4],
	[ 4,  4,  4,  4,  4],
],[
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
],[
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
],[
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
],[
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
],[
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0],
]];

