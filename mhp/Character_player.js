// プレイヤークラス
function Player(){
	var character = new BillballCharacter();
	// あたり判定用キャラクタサイズ
	this.hsize = 0.6;
	this.vsize = 1.0;
	// キャラクタ画像倍率
	this.size = 1.5;
	// キャラクタ状態
	this.mode1 = 0; // (0:移動 1:構え右 2:構え左)
	this.mode2 = 0; // (0:静止 1:移動 2:飛び込み 3:ジャンプと攻撃 4:武器出し入れ 5:落下 6:着地硬直 7:体力ゼロ)
	this.action = 0;
	this.rotate0 = Math.PI / 180 * 0;
	this.rotate1 = this.rotate0;
	this.health = 100; // 体力
	// 位置
	this.x = 0;
	this.y = 7; 
	this.z = 1;
	// 速度
	this.speed = 0;
	this.vx = 0;
	this.vy = 0; 
	this.vz = 0;
	// 地面との距離
	this.altitude = 0;
	// あたり判定と描画用パーツ位置構造体
	this.p_body = new Object();
	this.p_swrd = new Object();
	var p_cos = 1;
	var p_sin = 0;
	this.setParts = function(parts, x, y, z, r){
		parts.x = this.x + this.size * (x * p_cos - y * p_sin), 
		parts.y = this.y + this.size * (x * p_sin + y * p_cos), 
		parts.z = this.z + this.size * z;
		parts.r = r;
	}
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d){
		// 各パーツのテクスチャバッファリスト
		this.texBufStruct_head = character.createTexuvList(e3d, 0.0, 0.000, 0.125, 0.125, 0);
		this.texBufStruct_body = character.createTexuvList(e3d, 0.0, 0.375, 0.125, 0.125, 0);
		this.texBufStruct_ftr1 = character.createTexuvList(e3d, 0.00, 0.75, 0.0625, 0.0625, 0);
		this.texBufStruct_ftl1 = character.createTexuvList(e3d, 0.00, 0.75, 0.0625, 0.0625, 1);
		this.texBufStruct_ftr2 = character.createTexuvList(e3d, 0.25, 0.75, 0.0625, 0.0625, 0);
		this.texBufStruct_ftl2 = character.createTexuvList(e3d, 0.25, 0.75, 0.0625, 0.0625, 1);
		this.texBufStruct_hand = character.createTexuv(e3d, 0, 0.9375, 0.0625, 0.0625);
		this.texBufStruct_hair = character.createTexuvList(e3d, 0.5, 0.000, 0.125, 0.125, 0);
		this.texBufStruct_hail = character.createTexuvList(e3d, 0.5, 0.000, 0.125, 0.125, 1);
		this.texBufStruct_tail = character.createTexuvList(e3d, 0.5, 0.375, 0.125, 0.125, 0);
		// 剣のテクスチャ
		var texc = new Array();
		texc.push(0.625, 0.750);
		texc.push(0.500, 0.750);
		texc.push(0.500, 1.000);
		texc.push(0.625, 1.000);
		this.texcBuffer_sword = e3d.createVBO(texc);
		// 剣のインデクス
		var face = new Array();
		face.push(0, 1, 2, 0, 2, 3);
		face.push(0, 2, 1, 0, 3, 2);
		this.faceBuffer_sword = e3d.createIBO(face);
	}
	
	// ----------------------------------------------------------------
	// 速度計算
	this.calc1 = function(ctrl){
		if(this.altitude > 0.1){
			// 空中にいる
			if(this.mode2 == 2){
				// 飛び込み 空中
				this.action = 10;
			}else if(this.vz < 0){
				// 落下中
				this.mode2 = 5;
			}
		}else if(this.mode2 == 2){
			// 飛び込み 地面
			if(this.action++ >= 10){
				// 地面で前転
				this.speed = 2 / 30;
				if(this.action > 16){
					this.mode2 = 6;
					this.action = 0;
					this.speed = 0;
				}
			}else if(this.action > 1){
				// ため終わってジャンプ
				this.vz = 6 / 30;
				this.speed = 5 / 30;
				effectManager.add_dust(this.x, this.y, this.z + 0.2);
			}
		}else if(this.mode2 == 3){
			if(this.mode1 == 1 || this.mode1 == 2){
				// 攻撃
				if(this.action++ >= 16){
					this.mode1 = this.mode1 == 1 ? 2 : 1;
					this.mode2 = 0;
				}else if(this.action > 12){
					this.speed = 0 / 30;
				}else if(this.action > 8){
					this.speed = 2 / 30;
				}
			}else{
				// ジャンプ
				if(this.action++ >= 3){
					this.vz = 10 / 30;
					this.speed = 2 / 30;
					effectManager.add_dust(this.x, this.y, this.z + 0.2);
				}
			}
		}else if(this.mode2 == 4){
			// 武器出し入れ
			if(this.action++ > 5){
				this.mode1 = this.mode1 ? 0 : 1;
				this.mode2 = 0;
			}
		}else if(this.mode2 == 5){
				// 着地の瞬間
				this.action = 0;
				// 着地の瞬間にやられ判定
				if(this.health <= 0){
					this.mode2 = 7;
					this.speed = -2 / 30;
				}else{
					this.mode2 = 6;
					this.speed = 0;
				}
		}else if(this.mode2 == 6){
			// 着地硬直
			if(this.action++ >= 3){
				this.mode2 = 0;
			}
		}else if(this.mode2 == 7){
			// 体力ゼロ
			if(this.action++ > 30){
				this.speed = 0;
			}
		}else{
			// 地面に足がついている 十字キーで向きを変えることができる
			if(ctrl.k_z){
				// ジャンプ 攻撃 (ボタン押下時)
				this.mode2 = 3;
				this.action = 0;
				this.speed = 0;
			}else if(ctrl.k_x){
				// 飛び込み (ボタン押下時)
				this.mode2 = 2;
				this.action = 0;
				this.speed = 0;
			}else if(ctrl.k_s){
				// 武器の出し入れ (ボタン押下時)
				this.mode2 = 4;
				this.action = 0;
				this.speed = 1 / 30;
			}else if(!(ctrl.kup || ctrl.kdn || ctrl.krt || ctrl.klt)){
				// 静止状態
				this.mode2 = 0;
				this.speed = 0;
			}else{
				// 移動
				this.mode2 = 1;
				this.action++;
				this.speed = (this.mode1 == 1 || this.mode1 == 2) ? 1 / 30 : 3 / 30;
			}
			
			// 方向の計算
			if     (ctrl.krt && ctrl.kup){this.rotate1 = Math.PI * 1.74 + ctrl.rotv;}
			else if(ctrl.klt && ctrl.kup){this.rotate1 = Math.PI * 1.26 + ctrl.rotv;}
			else if(ctrl.klt && ctrl.kdn){this.rotate1 = Math.PI * 0.74 + ctrl.rotv;}
			else if(ctrl.krt && ctrl.kdn){this.rotate1 = Math.PI * 0.26 + ctrl.rotv;}
			else if(ctrl.krt){this.rotate1 = Math.PI * 0.00 + ctrl.rotv;}
			else if(ctrl.kup){this.rotate1 = Math.PI * 1.50 + ctrl.rotv;}
			else if(ctrl.klt){this.rotate1 = Math.PI * 1.00 + ctrl.rotv;}
			else if(ctrl.kdn){this.rotate1 = Math.PI * 0.50 + ctrl.rotv;}
		}
		
		var dr = this.rotate1 - this.rotate0;
		while(dr >  Math.PI){dr -= Math.PI * 2;}
		while(dr < -Math.PI){dr += Math.PI * 2;}
		this.rotate0 = this.rotate0 + dr * 0.5;
		
		this.vx = this.speed * Math.cos(this.rotate0);
		this.vy = this.speed * Math.sin(this.rotate0);
		this.vz -= 1.2 / 30;
	}

	// ----------------------------------------------------------------
	// 位置計算
	this.calc2 = function(){
		// あたり判定
		map.collision(this);
		// 位置の計算
		this.x += this.vx;
		this.y += this.vy;
		this.z += this.vz;
		
		// 各パーツの位置を設定
		p_cos = Math.cos(this.rotate0);
		p_sin = Math.sin(this.rotate0);
		this.setParts(this.p_body,  0.00,  0.00, 0.30, 0.5);
		if(this.mode2 == 3){
			switch(this.mode1 * 100 + this.action){
				case 110: this.setParts(this.p_swrd,  0.10,  0.48, 0.25, 0.6);break;
				case 111: this.setParts(this.p_swrd,  0.48,  0.30, 0.25, 0.7);break;
				case 112: this.setParts(this.p_swrd,  0.55, -0.12, 0.25, 0.8);break;
				case 113: this.setParts(this.p_swrd,  0.32, -0.48, 0.25, 0.7);break;
				case 114: this.setParts(this.p_swrd,  0.00, -0.50, 0.25, 0.6);break;
				case 210: this.setParts(this.p_swrd,  0.10, -0.48, 0.25, 0.6);break;
				case 211: this.setParts(this.p_swrd,  0.48, -0.30, 0.25, 0.7);break;
				case 212: this.setParts(this.p_swrd,  0.55,  0.12, 0.25, 0.8);break;
				case 213: this.setParts(this.p_swrd,  0.32,  0.48, 0.25, 0.7);break;
				case 214: this.setParts(this.p_swrd,  0.00,  0.50, 0.25, 0.6);break;
				default: this.setParts(this.p_swrd,  0.00,  0.00, 0.30, 0.0);break;
			}
		}else{
			this.setParts(this.p_swrd,  0.00,  0.00, 0.30, 0.0);
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d, mat, ctrl){
		// 描画関数作成
		var that = this;
		var drawParts = character.createDrawFunc(e3d, mat, ctrl, this.rotate0, this.x, this.y, this.z, this.size);
		var drawSword = function(size, x, y, z, roty1, rotz, roty2){
			// 行列作成
			mat4.set(e3d.tmpmat1, e3d.tmpmat2);
			mat4.translate(e3d.tmpmat2, [x, z, y]);
			mat4.rotateY(e3d.tmpmat2, Math.PI * roty2);
			mat4.rotateZ(e3d.tmpmat2, Math.PI * rotz);
			mat4.rotateY(e3d.tmpmat2, Math.PI * roty1);
			mat4.scale(e3d.tmpmat2, [size, size * 2, size]);
			mat4.translate(e3d.tmpmat2, [0, -0.25, 0]);
			e3d.setMatrix(e3d.tmpmat2);
			// 描画
			e3d.bindTexcBuf(that.texcBuffer_sword);
			e3d.bindFaceBuf(that.faceBuffer_sword);
			e3d.draw(0, 12);
		}
		// 複数使うポーズ
		var generalAction = function(type){
			switch(type){
				case 1: // ローリング1
					drawParts(that.texBufStruct_head, 0.50, -0.06,  0.00, 0.22, 2, 1);
					drawParts(that.texBufStruct_body, 0.48,  0.02,  0.00, 0.45, 2, 1);
					drawParts(that.texBufStruct_ftr2, 0.25, -0.14,  0.07, 0.50, 0, 1);
					drawParts(that.texBufStruct_ftl2, 0.25, -0.14, -0.07, 0.50, 0, 1);
					drawParts(that.texBufStruct_hand, 0.25, -0.12,  0.15, 0.50, 0, 0);
					drawParts(that.texBufStruct_hand, 0.25, -0.12, -0.15, 0.50, 0, 0);
					drawParts(that.texBufStruct_hair, 0.50,  0.01,  0.20, 0.24, 2, 1);
					drawParts(that.texBufStruct_hail, 0.50,  0.01, -0.20, 0.24, 2, 1);
					drawParts(that.texBufStruct_tail, 0.50,  0.12,  0.00, 0.34, 2, 1);break;
				case 2: // ローリング2
					drawParts(that.texBufStruct_head, 0.50,  0.06,  0.00, 0.38, 0, 0);
					drawParts(that.texBufStruct_body, 0.48, -0.02,  0.00, 0.15, 0, 0);
					drawParts(that.texBufStruct_ftr2, 0.25,  0.14,  0.07, 0.10, 2, 0);
					drawParts(that.texBufStruct_ftl2, 0.25,  0.14, -0.07, 0.10, 2, 0);
					drawParts(that.texBufStruct_hand, 0.25,  0.12,  0.15, 0.10, 0, 0);
					drawParts(that.texBufStruct_hand, 0.25,  0.12, -0.15, 0.10, 0, 0);
					drawParts(that.texBufStruct_hair, 0.50, -0.01,  0.20, 0.36, 0, 0);
					drawParts(that.texBufStruct_hail, 0.50, -0.01, -0.20, 0.36, 0, 0);
					drawParts(that.texBufStruct_tail, 0.50, -0.12,  0.00, 0.26, 0, 0);break;
				default: // しゃがみ
					drawParts(that.texBufStruct_head, 0.50,  0.12,  0.00, 0.43, 0, 0);
					drawParts(that.texBufStruct_body, 0.48, -0.02,  0.00, 0.22, 0, 0);
					drawParts(that.texBufStruct_ftr1, 0.25, -0.02,  0.10, 0.10, 0, 0);
					drawParts(that.texBufStruct_ftl1, 0.25, -0.02, -0.10, 0.10, 0, 0);
					drawParts(that.texBufStruct_hand, 0.25,  0.05,  0.18, 0.25, 0, 0);
					drawParts(that.texBufStruct_hand, 0.25,  0.05, -0.18, 0.25, 0, 0);
					drawParts(that.texBufStruct_hair, 0.50,  0.07,  0.20, 0.41, 0, 0);
					drawParts(that.texBufStruct_hail, 0.50,  0.07, -0.20, 0.41, 0, 0);
					drawParts(that.texBufStruct_tail, 0.50, -0.08,  0.00, 0.31, 0, 0);
					if(that.mode1 == 1){drawSword(0.5,  0.05,  0.18, 0.25, 1.9, 1.5, 0.0);}
					if(that.mode1 == 2){drawSword(0.5,  0.05, -0.18, 0.25, 1.9, 1.5, 0.0);}break;
			}
		}
		
		switch(this.mode2){
			case 1: // -------------------------------- 移動 --------------------------------
				if(this.mode1 == 1 || this.mode1 == 2){
					// 構え
					switch(Math.floor(this.action / 6) % 4){
						case 0:
							drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.51, 0, 0);
							drawParts(this.texBufStruct_body, 0.48, -0.04,  0.00, 0.26, 0, 0);
							drawParts(this.texBufStruct_ftr1, 0.25, -0.07,  0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_ftl1, 0.25,  0.02, -0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.49, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.49, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.36, 0, 0);
							if(this.mode1 == 1){
								drawParts(this.texBufStruct_hand, 0.25, -0.02,  0.20, 0.26, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08,  0.20, 0.26, 0, 0);
								drawSword(0.5, -0.02,  0.20, 0.26, 1.8, 1.5, 0.0);
							}else{
								drawParts(this.texBufStruct_hand, 0.25, -0.02, -0.20, 0.26, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08, -0.20, 0.26, 0, 0);
								drawSword(0.5, -0.02, -0.20, 0.26, 0.2, 1.5, 0.0);
							}break;
						case 1:
							drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.48, 0, 0);
							drawParts(this.texBufStruct_body, 0.48, -0.05,  0.00, 0.23, 0, 0);
							drawParts(this.texBufStruct_ftr1, 0.25, -0.11,  0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_ftl1, 0.25,  0.06, -0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.33, 0, 0);
							if(this.mode1 == 1){
								drawParts(this.texBufStruct_hand, 0.25, -0.02,  0.20, 0.23, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08,  0.20, 0.23, 0, 0);
								drawSword(0.5, -0.02,  0.20, 0.23, 1.8, 1.5, 0.0);
							}else{
								drawParts(this.texBufStruct_hand, 0.25, -0.02, -0.20, 0.23, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08, -0.20, 0.23, 0, 0);
								drawSword(0.5, -0.02, -0.20, 0.23, 0.2, 1.5, 0.0);
							}break;
						case 2:
							drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.51, 0, 0);
							drawParts(this.texBufStruct_body, 0.48, -0.04,  0.00, 0.26, 0, 0);
							drawParts(this.texBufStruct_ftr1, 0.25,  0.02,  0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_ftl1, 0.25, -0.07, -0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.49, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.49, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.36, 0, 0);
							if(this.mode1 == 1){
								drawParts(this.texBufStruct_hand, 0.25, -0.02,  0.20, 0.26, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08,  0.20, 0.26, 0, 0);
								drawSword(0.5, -0.02,  0.20, 0.26, 1.8, 1.5, 0.0);
							}else{
								drawParts(this.texBufStruct_hand, 0.25, -0.02, -0.20, 0.26, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08, -0.20, 0.26, 0, 0);
								drawSword(0.5, -0.02, -0.20, 0.26, 0.2, 1.5, 0.0);
							}break;
						case 3:
							drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.48, 0, 0);
							drawParts(this.texBufStruct_body, 0.48, -0.05,  0.00, 0.23, 0, 0);
							drawParts(this.texBufStruct_ftr1, 0.25,  0.06,  0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_ftl1, 0.25, -0.11, -0.06, 0.10, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.33, 0, 0);
							if(this.mode1 == 1){
								drawParts(this.texBufStruct_hand, 0.25, -0.02,  0.20, 0.23, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08,  0.20, 0.23, 0, 0);
								drawSword(0.5, -0.02,  0.20, 0.23, 1.8, 1.5, 0.0);
							}else{
								drawParts(this.texBufStruct_hand, 0.25, -0.02, -0.20, 0.23, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.08, -0.20, 0.23, 0, 0);
								drawSword(0.5, -0.02, -0.20, 0.23, 0.2, 1.5, 0.0);
							}break;
					}
				}else{
					// 通常
					switch(Math.floor(this.action / 6) % 4){
						case 0:
							drawParts(this.texBufStruct_head, 0.50,  0.03,  0.00, 0.50, 0, 0);
							drawParts(this.texBufStruct_body, 0.48,  0.00,  0.00, 0.25, 0, 0);
							drawParts(this.texBufStruct_ftr1, 0.25,  0.04,  0.08, 0.10, 0, 0);
							drawParts(this.texBufStruct_ftl1, 0.25, -0.04, -0.08, 0.13, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25, -0.03,  0.18, 0.25, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25,  0.03, -0.18, 0.25, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50, -0.02,  0.20, 0.48, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50, -0.02, -0.20, 0.48, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.14,  0.00, 0.36, 0, 0);break;
						case 1:
							drawParts(this.texBufStruct_head, 0.50,  0.05,  0.00, 0.48, 0, 0);
							drawParts(this.texBufStruct_body, 0.48,  0.00,  0.00, 0.24, 0, 0);
							drawParts(this.texBufStruct_ftr1, 0.25,  0.08,  0.08, 0.10, 0, 0);
							drawParts(this.texBufStruct_ftl2, 0.25, -0.08, -0.08, 0.15, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25, -0.06,  0.15, 0.25, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25,  0.06, -0.15, 0.25, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50,  0.00,  0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50,  0.00, -0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.13,  0.00, 0.34, 0, 0);break;
						case 2:
							drawParts(this.texBufStruct_head, 0.50,  0.03,  0.00, 0.50, 0, 0);
							drawParts(this.texBufStruct_body, 0.48,  0.00,  0.00, 0.25, 0, 0);
							drawParts(this.texBufStruct_ftr1, 0.25, -0.04,  0.08, 0.13, 0, 0);
							drawParts(this.texBufStruct_ftl1, 0.25,  0.04, -0.08, 0.10, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25,  0.03,  0.18, 0.25, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25, -0.03, -0.18, 0.25, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50, -0.02,  0.20, 0.48, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50, -0.02, -0.20, 0.48, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.14,  0.00, 0.36, 0, 0);break;
						case 3:
							drawParts(this.texBufStruct_head, 0.50,  0.05,  0.00, 0.48, 0, 0);
							drawParts(this.texBufStruct_body, 0.48,  0.00,  0.00, 0.24, 0, 0);
							drawParts(this.texBufStruct_ftr2, 0.25, -0.08,  0.08, 0.15, 0, 0);
							drawParts(this.texBufStruct_ftl1, 0.25,  0.08, -0.08, 0.10, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25,  0.06,  0.15, 0.25, 0, 0);
							drawParts(this.texBufStruct_hand, 0.25, -0.06, -0.15, 0.25, 0, 0);
							drawParts(this.texBufStruct_hair, 0.50,  0.00,  0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_hail, 0.50,  0.00, -0.20, 0.46, 0, 0);
							drawParts(this.texBufStruct_tail, 0.50, -0.13,  0.00, 0.34, 0, 0);break;
					}
				}break;
			case 2: // -------------------------------- 飛び込み --------------------------------
				switch(this.action){
					case 10: // 飛び込み
						drawParts(this.texBufStruct_head, 0.50,  0.12,  0.00, 0.30, 0, 0);
						drawParts(this.texBufStruct_body, 0.48, -0.02,  0.00, 0.20, 0, 0);
						drawParts(this.texBufStruct_ftr2, 0.25, -0.18,  0.07, 0.10, 0, 0);
						drawParts(this.texBufStruct_ftl2, 0.25, -0.18, -0.07, 0.10, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.20,  0.13, 0.17, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.20, -0.13, 0.17, 0, 0);
						drawParts(this.texBufStruct_hair, 0.50,  0.07,  0.20, 0.28, 0, 0);
						drawParts(this.texBufStruct_hail, 0.50,  0.07, -0.20, 0.28, 0, 0);
						drawParts(this.texBufStruct_tail, 0.50, -0.06,  0.00, 0.30, 0, 0);
						if(this.mode1 == 1){drawSword(0.5,  0.20,  0.13, 0.17, 0.0, 1.5, 0.0);}
						if(this.mode1 == 2){drawSword(0.5,  0.20, -0.13, 0.17, 0.0, 1.5, 0.0);}break;
					case 11: case 12: case 13: // 前転1
						generalAction(1);
						if(this.mode1 == 1){drawSword(0.5, -0.12,  0.15, 0.50, 0.0, 1.5, 0.0);}
						if(this.mode1 == 2){drawSword(0.5, -0.12, -0.15, 0.50, 0.0, 1.5, 0.0);}break;
					case 14: case 15: case 16: // 前転2
						generalAction(2);
						if(this.mode1 == 1){drawSword(0.5,  0.12,  0.15, 0.10, 0.0, 1.5, 0.0);}
						if(this.mode1 == 2){drawSword(0.5,  0.12, -0.15, 0.10, 0.0, 1.5, 0.0);}break;
					default: // しゃがみ
						generalAction(100);
				}break;
			case 3: // -------------------------------- ジャンプと攻撃 --------------------------------
				switch(this.mode1){
					case 1: // 右構え攻撃
						switch(this.action){
							case 0: case 1: case 2:case 3: case 4: case 5: 
								drawParts(this.texBufStruct_head, 0.50, -0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.04, -0.02, 0.25, 3, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.10,  0.05, 0.13, 3, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.05, -0.02, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25, -0.03,  0.18, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.07,  0.21, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.06,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.06, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.16,  0.00, 0.35, 0, 0);
								drawSword(0.5, -0.07,  0.18, 0.25, 1.9, 1.5, 1.9);break;
							case 6: case 7:case 8: 
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.03, -0.01, 0.25, 3, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.08,  0.05, 0.13, 3, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.04, -0.03, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.00,  0.18, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.07,  0.13, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5, -0.00,  0.18, 0.25, 1.8, 1.5, 0.2);break;
							case 9: case 10:
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.02, -0.01, 0.25, 3, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.02,  0.05, 0.13, 3, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.01, -0.03, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10,  0.14, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10,  0.05, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.10,  0.14, 0.25, 1.7, 1.5, 0.5);break;
							case 11:
								drawParts(this.texBufStruct_head, 0.50,  0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.01,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.03,  0.04, 0.13, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.02, -0.04, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.21,  0.10, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.13,  0.05, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.04,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.04, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.14,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.20,  0.10, 0.25, 1.6, 1.5, 0.8);break;
							case 12:
								drawParts(this.texBufStruct_head, 0.50,  0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.01,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.05,  0.04, 0.13, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.06, -0.04, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.20,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10,  0.04, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.04,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.04, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.14,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.20,  0.00, 0.25, 1.5, 1.5, 1.1);break;
							case 13:
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.01,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.08,  0.04, 0.12, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.10, -0.04, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.20, -0.15, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.17, -0.07, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.20, -0.15, 0.25, 1.6, 1.5, 1.4);break;
							case 14:
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.02,  0.01, 0.25, 1, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.07,  0.03, 0.11, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.10, -0.05, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10, -0.14, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.13, -0.05, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.10, -0.14, 0.25, 1.8, 1.5, 1.6);break;
							case 15: case 16:
								drawParts(this.texBufStruct_head, 0.50, -0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.04,  0.02, 0.25, 1, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.06,  0.03, 0.10, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.10, -0.05, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.00, -0.18, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.07, -0.13, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.00, -0.18, 0.25, 0.0, 1.5, 1.8);break;
						}break;
					case 2: // 左構え攻撃
						switch(this.action){
							case 0: case 1: case 2:case 3: case 4: case 5: 
								drawParts(this.texBufStruct_head, 0.50, -0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.04,  0.02, 0.25, 1, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.05,  0.02, 0.10, 1, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.10, -0.05, 0.13, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25, -0.03, -0.18, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.07, -0.21, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.06,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.06, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.16,  0.00, 0.35, 0, 0);
								drawSword(0.5, -0.03, -0.18, 0.25, 0.1, 1.5, 0.1);break;
							case 6: case 7:case 8: 
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.03,  0.01, 0.25, 1, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.04,  0.03, 0.10, 1, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.08, -0.05, 0.13, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.00, -0.18, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.07, -0.13, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.00, -0.18, 0.25, 0.2, 1.5, 1.8);break;
							case 9: case 10:
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.02,  0.01, 0.25, 1, 0);
								drawParts(this.texBufStruct_ftr1, 0.25,  0.01,  0.03, 0.10, 1, 0);
								drawParts(this.texBufStruct_ftl1, 0.25, -0.02, -0.05, 0.13, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10, -0.14, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10, -0.05, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.10, -0.14, 0.25, 0.3, 1.5, 1.5);break;
							case 11:
								drawParts(this.texBufStruct_head, 0.50,  0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.01,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.02,  0.04, 0.10, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.03, -0.04, 0.13, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.21, -0.10, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.13, -0.05, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.04,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.04, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.14,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.20, -0.10, 0.25, 0.4, 1.5, 1.2);break;
							case 12:
								drawParts(this.texBufStruct_head, 0.50,  0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.01,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.06,  0.04, 0.10, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.05, -0.04, 0.13, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.20,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10, -0.04, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.04,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.04, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.14,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.20,  0.00, 0.25, 0.5, 1.5, 0.9);break;
							case 13:
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.01,  0.00, 0.25, 0, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.10,  0.04, 0.10, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.08, -0.04, 0.12, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.20,  0.15, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.17,  0.07, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.20,  0.15, 0.25, 0.4, 1.5, 0.6);break;
							case 14:
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.02, -0.01, 0.25, 3, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.10,  0.05, 0.10, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.07, -0.03, 0.11, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.10,  0.14, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.13,  0.05, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.10,  0.14, 0.25, 0.2, 1.5, 0.4);break;
							case 15: case 16:
								drawParts(this.texBufStruct_head, 0.50, -0.01,  0.00, 0.50, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.04, -0.02, 0.25, 3, 0);
								drawParts(this.texBufStruct_ftr1, 0.25, -0.10,  0.05, 0.10, 0, 0);
								drawParts(this.texBufStruct_ftl1, 0.25,  0.06, -0.03, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.00,  0.18, 0.25, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.07,  0.13, 0.25, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
								drawSword(0.5,  0.00,  0.18, 0.25, 0.0, 1.5, 0.2);break;
						}break;
					default: // ジャンプ
						switch(this.action){
							case 0: case 1: case 2:
								generalAction(100); break;
							default:
								drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.45, 0, 0);
								drawParts(this.texBufStruct_body, 0.48, -0.02,  0.00, 0.20, 0, 0);
								drawParts(this.texBufStruct_ftr2, 0.25, -0.12,  0.10, 0.10, 0, 0);
								drawParts(this.texBufStruct_ftl2, 0.25, -0.12, -0.10, 0.10, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.02,  0.20, 0.28, 0, 0);
								drawParts(this.texBufStruct_hand, 0.25,  0.02, -0.20, 0.28, 0, 0);
								drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.43, 0, 0);
								drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.43, 0, 0);
								drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.33, 0, 0);break;
						}break;
				}break;
				break;
			case 4: // -------------------------------- 武器出し入れ --------------------------------
				var type = 0;
				if(this.mode1 == 0){type = this.action < 3 ? 0 : 1;}
				if(this.mode1 == 1){type = this.action < 3 ? 3 : 2;}
				if(this.mode1 == 2){type = this.action < 3 ? 5 : 4;}
				drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.51, 0, 0);
				drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.49, 0, 0);
				drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.49, 0, 0);
				drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.36, 0, 0);
				switch(type){
					case 0:
						drawParts(this.texBufStruct_body, 0.48, -0.03, -0.01, 0.26, 3, 0);
						drawParts(this.texBufStruct_ftr1, 0.25, -0.04,  0.07, 0.10, 0, 0);
						drawParts(this.texBufStruct_ftl1, 0.25,  0.01, -0.06, 0.12, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.06,  0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.13,  0.00, 0.25, 0, 0);
						drawSword(0.3, -0.06,  0.20, 0.25, 0.0, 1.5, 1.8);break;
					case 1:
						drawParts(this.texBufStruct_body, 0.48, -0.03, -0.01, 0.26, 3, 0);
						drawParts(this.texBufStruct_ftr1, 0.25, -0.07,  0.06, 0.10, 3, 0);
						drawParts(this.texBufStruct_ftl1, 0.25,  0.03, -0.04, 0.12, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.04,  0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.10,  0.10, 0.25, 0, 0);
						drawSword(0.4, -0.04,  0.20, 0.25, 1.9, 1.5, 1.9);break;
					case 2:
						drawParts(this.texBufStruct_body, 0.48, -0.03, -0.01, 0.26, 3, 0);
						drawParts(this.texBufStruct_ftr1, 0.25, -0.04,  0.07, 0.12, 0, 0);
						drawParts(this.texBufStruct_ftl1, 0.25,  0.01, -0.06, 0.10, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.06,  0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.13,  0.00, 0.25, 0, 0);
						drawSword(0.3, -0.06,  0.20, 0.25, 0.0, 1.5, 1.8);break;
					case 3:
						drawParts(this.texBufStruct_body, 0.48, -0.03, -0.01, 0.26, 3, 0);
						drawParts(this.texBufStruct_ftr1, 0.25, -0.07,  0.06, 0.12, 3, 0);
						drawParts(this.texBufStruct_ftl1, 0.25,  0.03, -0.04, 0.10, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.04,  0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.10,  0.10, 0.25, 0, 0);
						drawSword(0.4, -0.04,  0.20, 0.25, 1.9, 1.5, 1.9);break;
					case 4:
						drawParts(this.texBufStruct_body, 0.48, -0.03,  0.01, 0.26, 1, 0);
						drawParts(this.texBufStruct_ftr1, 0.25,  0.01,  0.06, 0.10, 0, 0);
						drawParts(this.texBufStruct_ftl1, 0.25, -0.02, -0.07, 0.12, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.13,  0.00, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.00, -0.25, 0.25, 0, 0);
						drawSword(0.3, -0.06, -0.20, 0.25, 0.0, 1.5, 0.2);break;
					case 5:
						drawParts(this.texBufStruct_body, 0.48, -0.03,  0.01, 0.26, 1, 0);
						drawParts(this.texBufStruct_ftr1, 0.25,  0.03,  0.04, 0.10, 1, 0);
						drawParts(this.texBufStruct_ftl1, 0.25, -0.07, -0.06, 0.12, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.10, -0.10, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.04, -0.22, 0.25, 0, 0);
						drawSword(0.4,  -0.04, -0.20, 0.25, 0.1, 1.5, 0.1);break;
				}break;
				break;
			case 5: // -------------------------------- 落下 --------------------------------
				drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.45, 0, 0);
				drawParts(this.texBufStruct_body, 0.48, -0.02,  0.00, 0.20, 0, 0);
				drawParts(this.texBufStruct_ftr2, 0.25,  0.12,  0.10, 0.10, 2, 0);
				drawParts(this.texBufStruct_ftl2, 0.25,  0.12, -0.10, 0.10, 2, 0);
				drawParts(this.texBufStruct_hand, 0.25,  0.02,  0.20, 0.28, 0, 0);
				drawParts(this.texBufStruct_hand, 0.25,  0.02, -0.20, 0.28, 0, 0);
				drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.43, 0, 0);
				drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.43, 0, 0);
				drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.33, 0, 0);break;
			case 6: // -------------------------------- 着地硬直 --------------------------------
				generalAction(100); break;
			case 7: // -------------------------------- 体力ゼロ --------------------------------
				if(this.speed != 0){
					switch(Math.floor(this.action / 3) % 2){
						case 0: generalAction(1); break;
						case 1: generalAction(2); break;
					}
				}else{
					generalAction(2);
				}break;
			default: // -------------------------------- 静止 --------------------------------
				switch(this.mode1){
					case 1: // 右構え
						drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
						drawParts(this.texBufStruct_body, 0.48, -0.03, -0.02, 0.25, 3, 0);
						drawParts(this.texBufStruct_ftr1, 0.25, -0.10,  0.05, 0.10, 3, 0);
						drawParts(this.texBufStruct_ftl1, 0.25,  0.05, -0.02, 0.10, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.02,  0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.08,  0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
						drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
						drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
						drawSword(0.5, -0.02,  0.20, 0.25, 1.8, 1.5, 0.0);break;
					case 2: // 左構え
						drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.50, 0, 0);
						drawParts(this.texBufStruct_body, 0.48, -0.03,  0.02, 0.25, 1, 0);
						drawParts(this.texBufStruct_ftr1, 0.25,  0.05,  0.02, 0.10, 0, 0);
						drawParts(this.texBufStruct_ftl1, 0.25, -0.10, -0.05, 0.10, 1, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.02, -0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.08, -0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.48, 0, 0);
						drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.48, 0, 0);
						drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.35, 0, 0);
						drawSword(0.5, -0.02, -0.20, 0.25, 0.2, 1.5, 0.0);break;
					default: // 通常
						drawParts(this.texBufStruct_head, 0.50,  0.00,  0.00, 0.52, 0, 0);
						drawParts(this.texBufStruct_body, 0.48, -0.02,  0.00, 0.27, 0, 0);
						drawParts(this.texBufStruct_ftr1, 0.25,  0.02,  0.10, 0.10, 0, 0);
						drawParts(this.texBufStruct_ftl1, 0.25, -0.02, -0.10, 0.10, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25, -0.02,  0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hand, 0.25,  0.02, -0.20, 0.25, 0, 0);
						drawParts(this.texBufStruct_hair, 0.50, -0.05,  0.20, 0.50, 0, 0);
						drawParts(this.texBufStruct_hail, 0.50, -0.05, -0.20, 0.50, 0, 0);
						drawParts(this.texBufStruct_tail, 0.50, -0.15,  0.00, 0.37, 0, 0);break;
				}break;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

