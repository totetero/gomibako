enchant();
var game;
window.onload = function(){
	game = new Game(320, 320);
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
			quat4.toMat4(rotq, trackball.matrix);
			//mat4.translate(trackball.matrix, [-player.x, -player.y, -player.z]);
			mat4.translate(trackball.matrix, [-2.5, -2.5, -2.5]);
		});
		
		// ----------------------------------------------------------------
		// マップ
		var hakoniwa = new Map3D(map);
		hakoniwa.mesh.texture.src = "mapchip.png";
		trackball.addChild(hakoniwa);
		
		// ----------------------------------------------------------------
		// ボール
		var player = new Sphere();
		player.radius = 0.5;
		player.scaleX = player.scaleY = player.scaleZ = 0.5;
		player.px = player.py = player.pz = 2.5;
		player.vx = player.vy = player.vz = 0.0;
		player.addEventListener('enterframe', function(e){
			var vel = [0, -1, 0];
			quat4.multiplyVec3(rotq, vel);
			this.vx += 0.005 * vel[0];
			this.vy += 0.005 * vel[2];
			this.vz += 0.005 * vel[1];
			
			this.altitude = hakoniwa.collision(this);
			this.px += this.vx;
			this.py += this.vy;
			this.pz += this.vz;
			this.x = this.px;
			this.y = this.pz;
			this.z = this.py;
			this.shadow.y = (-this.altitude - this.radius) / this.scaleY;
		});
		trackball.addChild(player);
		// 影作成
		player.shadow = new Shadow();
		player.shadow.scaleX = player.radius / player.scaleY * 2;
		player.shadow.scaleZ = player.radius / player.scaleY * 2;
		player.addChild(player.shadow);
		
		// ----------------------------------------------------------------
		// タッチによるカメラ制御
		var touchx;
		var touchy;
		var rotq = quat4.create();
		var touchq0 = quat4.create();
		var touchq1 = quat4.create();
		rotq[0] = 0;
		rotq[1] = 0;
		rotq[2] = 0;
		rotq[3] = 1;
		
		// タッチ開始
		game.rootScene.addEventListener('touchstart', function(e){
			quat4.set(rotq, touchq0);
			touchx = e.x;
			touchy = e.y;
		});
	
		// タッチ途中
		game.rootScene.addEventListener('touchmove', function(e){
			var dx = (e.x - touchx) * 0.03;
			var dy = (e.y - touchy) * 0.03;
			var a = Math.sqrt(dx * dx + dy * dy);
			if(a != 0){
				// クオータニオンによる回転
				var ar = a * 0.5;
				var as = Math.sin(ar) / a;
				touchq1[3] = Math.cos(ar);
				touchq1[0] = dy * as;
				touchq1[1] = dx * as;
				touchq1[2] = 0;
				quat4.multiply(touchq0, touchq1, rotq);
				quat4.set(rotq, touchq0);
				touchx = e.x;
				touchy = e.y;
			}
		});
		// ----------------------------------------------------------------
	};
	
	game.start();
};

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 以下、マップデータ

var map = [[
		[21, 21, 21, 21, 21],
		[21, 21, 21, 21, 21],
		[21, 21, 21, 21, 21],
		[21, 21, 21, 21, 21],
		[21, 21, 21, 21, 21],
	],[
		[21, 21, 21, 21, 21],
		[21,  0,  0,  0, 21],
		[21,  0, 24,  0, 21],
		[21,  0,  0,  0, 21],
		[21, 21, 21, 21, 21],
	],[
		[21, 21, 21, 21, 21],
		[21,  0,  0,  0, 21],
		[21,  0,  0,  0, 21],
		[21,  0,  0,  0, 21],
		[21, 21, 21, 21, 21],
	],[
		[21, 21, 21, 21, 21],
		[21,  0,  0,  0, 21],
		[21,  0,  0,  0, 21],
		[21,  0,  0,  0, 21],
		[21, 21, 21, 21, 21],
	],[
		[21, 21, 21, 21, 21],
		[21, 21, 21, 21, 21],
		[21, 21, 52, 21, 21],
		[21, 21, 21, 21, 21],
		[21, 21, 21, 21, 21],
],];
