// 光源を無視するテクスチャ作成
function createTexture(image){
		var texture = new Texture();
		texture.ambient = [1.0, 1.0, 1.0, 1.0];
		texture.diffuse = [0.0, 0.0, 0.0, 1.0];
		texture.specular = [0.0, 0.0, 0.0, 1.0];
		texture.emission = [0.0, 0.0, 0.0, 1.0];
		texture.shininess = 1;
		if(typeof image != "undefined"){texture.src = image;}
		return texture;
}

// カート形状
function createMesh(){
		var mesh = new Mesh()
		mesh.vertices = [
			 0.25, 0.15, -0.4,
			-0.25, 0.15, -0.4,
			-0.25, 0.15,  0.4,
			 0.25, 0.15,  0.4,
			 0.25, 0.20, -0.4,
			-0.25, 0.20, -0.4,
			-0.25, 0.20,  0.4,
			 0.25, 0.20,  0.4,
			 
			 0.20, 0.2,  0.2,
			-0.20, 0.2,  0.2,
			-0.20, 0.2,  0.4,
			 0.20, 0.2,  0.4,
			 0.15, 0.5,  0.2,
			-0.15, 0.5,  0.2,
			-0.15, 0.5,  0.3,
			 0.15, 0.5,  0.3,
			 
			 0.15, 0.2, -0.4,
			-0.15, 0.2, -0.4,
			-0.15, 0.2, -0.3,
			 0.15, 0.2, -0.3,
			 0.15, 0.6, -0.4,
			-0.15, 0.6, -0.4,
			-0.15, 0.6, -0.3,
			 0.15, 0.6, -0.3,
		];
		mesh.normals = [
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
		];
		mesh.texCoords = [
			0.0625, 1 - 0.96875,
			0.0625, 1 - 0.96875,
			0.0625, 1 - 0.96875,
			0.0625, 1 - 0.96875,
			0.0625, 1 - 0.96875,
			0.0625, 1 - 0.96875,
			0.0625, 1 - 0.96875,
			0.0625, 1 - 0.96875,
			
			0.1875, 1 - 0.96875,
			0.1875, 1 - 0.96875,
			0.1875, 1 - 0.96875,
			0.1875, 1 - 0.96875,
			0.1875, 1 - 0.96875,
			0.1875, 1 - 0.96875,
			0.1875, 1 - 0.96875,
			0.1875, 1 - 0.96875,
			
			0.3125, 1 - 0.96875,
			0.3125, 1 - 0.96875,
			0.3125, 1 - 0.96875,
			0.3125, 1 - 0.96875,
			0.3125, 1 - 0.96875,
			0.3125, 1 - 0.96875,
			0.3125, 1 - 0.96875,
			0.3125, 1 - 0.96875,
		];
		mesh.colors = [
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
		];
		mesh.indices = [
			4, 5, 6, 4, 6, 7,
			7, 6, 2, 7, 2, 3,
			4, 7, 3, 4, 3, 0,
			5, 4, 0, 5, 0, 1,
			6, 5, 1, 6, 1, 2,
			2, 1, 0, 0, 3, 2,
			
			15, 14, 10, 15, 10, 11,
			12, 15, 11, 12, 11,  8,
			13, 12,  8, 13,  8,  9,
			14, 13,  9, 14,  9, 10,
			12, 13, 14, 12, 14, 15,
			
			23, 22, 18, 23, 18, 19,
			20, 23, 19, 20, 19, 16,
			21, 20, 16, 21, 16, 17,
			22, 21, 17, 22, 17, 18,
			20, 21, 22, 20, 22, 23,
		];
		mesh.texture = createTexture("img/player.png");
		return mesh;
}

// ゼッケンプレート作成
function createPlate(){
		var sprite = new Sprite3D();
		sprite.mesh = new Mesh();
		sprite.mesh.vertices = [
			 0.15, 0.5, 0.32,
			-0.15, 0.5, 0.32,
			-0.15, 0.2, 0.42,
			 0.15, 0.2, 0.42,
			 
			 0.15, 0.55, -0.42,
			-0.15, 0.55, -0.42,
			-0.15, 0.25, -0.42,
			 0.15, 0.25, -0.42,
		];
		sprite.mesh.normals = [
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
		];
		sprite.mesh.texCoords = [
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
		];
		sprite.mesh.colors = [
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
		];
		sprite.mesh.indices = [
			0, 1, 2, 0, 2, 3,
			4, 6, 5, 4, 7, 6,
		];
		
		// 画像サイズを2の階乗にして貼り付ける
		var twitImg = 'img/mapchip.png';
		game.load(twitImg, function(){
			var surface = new Surface(64, 64);
			surface.draw(game.assets[twitImg], 0, 0, 64, 64);
			sprite.mesh.texture = createTexture(surface);
			// ! -------- gl.enchant.jsの不具合?
			// texture.srcにSurfaceを指定したテクスチャは1種類しか使えない希ガス。
			// 理由: hasTexture関数内でtextures[src]とみているが、src=Surfaceの場合、違うSurfaceでも同じ連想配列に入っちゃうんじゃないかな？
			// とりあえずの対策 gl.enchant.jsを書き換えて重複チェックをやめる。
		});
		
		return sprite;
}

// ビルボード作成
function createBillboard(parent, x, y, z, size, texture, type, u0, v0, uw, vh){
		var sprite = new Sprite3D();
		sprite.mesh = new Mesh();
		sprite.mesh.vertices = [
			 0.5,  0.5, 0.0,
			-0.5,  0.5, 0.0,
			-0.5, -0.5, 0.0,
			 0.5, -0.5, 0.0,
		];
		sprite.mesh.normals = [
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
		];
		sprite.mesh.colors = [
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
			1.0, 1.0, 1.0, 1.0, 
		];
		sprite.mesh.texCoords = [1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,];
		sprite.mesh.indices = [
			0, 1, 2,
			0, 2, 3,
		];
		sprite.mesh.texture = texture;
		sprite.addEventListener('render', function(){
			// 	カメラ目線になる回転行列を設定
			this.rotation = parent.billboardMatrix;
			// テクスチャフレーム設定
			var frame = type ? parent.frame2 : parent.frame1;
			var u1 = u0 + uw * (frame % 4);
			var v1 = v0 + vh * Math.floor(frame / 4);
			var u2 = u1 + uw;
			var v2 = v1 + vh;
			this.mesh.texCoords = [
				u2, 1 - v1,
				u1, 1 - v1,
				u1, 1 - v2,
				u2, 1 - v2,
			];
		});
		sprite.scaleX = size;
		sprite.scaleY = size;
		sprite.scaleZ = size;
		sprite.x = x;
		sprite.y = z;
		sprite.z = y;
		return sprite;
}

// カートキャラクター作成
function Cart(hakoniwa, x, y, z){
	var sprite = new Sprite3D();
	// 位置
	sprite.px = x;
	sprite.py = y;
	sprite.pz = z; // 高さ方向
	// 速度
	sprite.vx = 0;
	sprite.vy = 0; 
	sprite.vz = 0;
	sprite.speed = 0;
	// あたり判定用キャラクタサイズ
	sprite.hsize = 1.0;
	sprite.vsize = 0.8;
	// 地面との距離
	sprite.altitude = 0;
	// キャラクタの向き
	sprite.rotate = Math.PI / 180 *  90;
	sprite.camera_rotate = 0;
	// input情報
	this.key = 0;
	// テクスチャフレーム
	sprite.frame1 = 0;
	sprite.frame2 = 0;
	// ビルボード回転行列
	sprite.billboardMatrix = mat4.create();
	// 3d情報
	sprite.mesh = createMesh();
	sprite.addChild(createBillboard(sprite,  0.00, -0.05, 0.7, 0.8, sprite.mesh.texture, 0, 0.00, 0.000, 0.2500, 0.1250));
	sprite.addChild(createBillboard(sprite,  0.00, -0.15, 0.4, 0.8, sprite.mesh.texture, 0, 0.00, 0.375, 0.2500, 0.1250));
	sprite.addChild(createBillboard(sprite,  0.15,  0.10, 0.3, 0.4, sprite.mesh.texture, 0, 0.00, 0.750, 0.1250, 0.0625));
	sprite.addChild(createBillboard(sprite, -0.15,  0.10, 0.3, 0.4, sprite.mesh.texture, 0, 0.00, 0.750, 0.1250, 0.0625));
	sprite.addChild(createBillboard(sprite,  0.3,  0.25, 0.2, 0.5, sprite.mesh.texture, 1, 0.50, 0.75, 0.1250, 0.0625));
	sprite.addChild(createBillboard(sprite, -0.3,  0.25, 0.2, 0.5, sprite.mesh.texture, 1, 0.50, 0.75, 0.1250, 0.0625));
	sprite.addChild(createBillboard(sprite,  0.3, -0.25, 0.2, 0.5, sprite.mesh.texture, 1, 0.50, 0.75, 0.1250, 0.0625));
	sprite.addChild(createBillboard(sprite, -0.3, -0.25, 0.2, 0.5, sprite.mesh.texture, 1, 0.50, 0.75, 0.1250, 0.0625));
	sprite.addChild(createPlate());
	// 影
	sprite.shadow = new Shadow();
	sprite.shadow.scaleX = sprite.hsize * 0.8;
	sprite.shadow.scaleZ = sprite.hsize * 0.8;
	sprite.addChild(sprite.shadow);
	
	// ----------------------------------------------------------------
	// 描画の前に呼び出されるイベントリスナーを登録
	sprite.addEventListener('render', function() {
		// -------- input情報から速度を更新する --------
		// 進行
		var maxspeed = 20 / 60;
		if((this.key & 8) != 0){this.speed -= 0.02;}
		else if((this.key & 4) != 0){this.speed += 0.005;}
		else{this.speed -= 0.005;}
		if(this.speed > maxspeed){this.speed = maxspeed;}
		if(this.speed < 0){this.speed = 0;}
		// 旋回
		if((this.key & 2) != 0){this.rotate += 0.05;}
		if((this.key & 1) != 0){this.rotate -= 0.05;}
		
		// 水平軸方向速度の計算
		this.vx = this.speed * Math.cos(this.rotate);
		this.vy = this.speed * Math.sin(this.rotate);
		// 垂直方向速度の計算
		if(this.altitude > 0.1){
			// 地面との距離がある場合は空中
			this.vz -= 0.8 / 60;
		}else if((this.key & 16) != 0){
			// ジャンプ
			this.vz = 9 / 60;
		}
		
		// あたり判定
		hakoniwa.collision(this);
		
		// -------- 速度から位置を更新する --------
		this.px += this.vx;
		this.py += this.vy;
		this.pz += this.vz;
		if(this.pz < 1){
			// 落下した場合は最初から
			this.px = 2.5;
			this.py = 2.5;
			this.pz = 3;
			this.speed = this.vx = this.vy = this.vz = 0;
			this.rotate = Math.PI / 180 *  90;
		}
		
		// -------- 位置情報から描画を行う --------
		if(game.currentScene3D._camera){
			// 向きの回転行列
			this.rotationSet(new Quat(0, 1, 0, this.rotate - Math.PI / 180 *  90));
			// カメラの回転角度を調べる 登場キャラクタが増えるとここが無駄な計算になるのだがまあいいか
			var camera = game.currentScene3D._camera;
			this.camera_rotate = Math.PI + Math.atan2(camera.centerX - camera.x, camera.centerZ - camera.z);
			// ビルボード用の回転を打ち消す行列を作る
			var phi = this.camera_rotate;
			var theta = -Math.asin(game.currentScene3D.cameraMat[6]);
			mat4.identity(sprite.billboardMatrix);
			mat4.rotateY(sprite.billboardMatrix, (phi + this.rotate - Math.PI / 180 *  90));
			mat4.rotateX(sprite.billboardMatrix, theta);
			// カメラの回転角度からテクスチャフレームを選択する
			var anglev = 180 + 180 / Math.PI * (phi + this.rotate);
			var angleh = -180 / Math.PI * theta;
			// 水平軸角度
			if(angleh < -30){this.frame1 = 8;}else if(angleh < 30){this.frame1 = 4;}else{this.frame1 = 0;}
			this.frame2 = this.frame1;
			// 垂直軸角度 4方向のキャラクタ用と8方向のタイヤ用の2種類用意する
			while(anglev >  360 - 45){anglev -= 360;}
			while(anglev <=   0 - 45){anglev += 360;}
			if(anglev < 0 + 45){this.frame1 += 3;}
			else if(anglev < 90 + 45){this.frame1 += 2;}
			else if(anglev < 180 + 45){this.frame1 += 1;}
			else{this.frame1 += 0;}
			while(anglev <=   0 - 22.5){anglev += 360;}
			if(anglev < 0 + 22.5){this.frame2 += 2;}
			else if(anglev < 45 + 22.5){this.frame2 += 3;}
			else if(anglev < 90 + 22.5){this.frame2 += 0;}
			else if(anglev < 135 + 22.5){this.frame2 += 1;}
			else if(anglev < 180 + 22.5){this.frame2 += 2;}
			else if(anglev < 225 + 22.5){this.frame2 += 3;}
			else if(anglev < 270 + 22.5){this.frame2 += 0;}
			else{this.frame2 += 1;}
		}
		
		this.x = this.px;
		this.y = this.pz; // キャラクタの座標はz軸を高さ方向にしているが、
		this.z = this.py; // glの表示上はy軸が高さ方向なので入れ替え 非常にややこしいです
		this.shadow.y = -this.altitude / this.scaleY;
	});
	
	sprite.scaleX = sprite.scaleY = sprite.scaleZ = 1;
	
	return sprite;
}
