// ボスクラス
function Boss(){
	var character = new BillballCharacter();
	// あたり判定用キャラクタサイズ
	this.hsize = 1.6;
	this.vsize = 2.0;
	// キャラクタ画像倍率
	this.size = 1.5;
	// キャラクタ状態
	this.mode1 = 0; // (0:最初 1:怒り 2:瀕死 3:体力ゼロ)
	this.mode2 = 0; // (0:静止 1:移動 2:攻撃 3:疲労 4:怯み)
	this.action = 0;
	this.rotate0 = Math.PI / 180 * 180;
	this.rotate1 = this.rotate0;
	this.health = 100; // 体力
	// 位置
	this.x = 15;
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
	this.p_list = new Array();
	this.p_head = new Object(); this.p_list.push(this.p_head);
	this.p_body = new Object(); this.p_list.push(this.p_body);
	this.p_tail = new Object(); this.p_list.push(this.p_tail);
	this.p_ftfr = new Object(); this.p_list.push(this.p_ftfr);
	this.p_ftfl = new Object(); this.p_list.push(this.p_ftfl);
	this.p_ftbr = new Object(); this.p_list.push(this.p_ftbr);
	this.p_ftbl = new Object(); this.p_list.push(this.p_ftbl);
	this.p_byte = new Object(); // 攻撃あたり判定用オブジェクト
	var p_mouse_open = false;
	var p_cos = 1;
	var p_sin = 0;
	this.setParts = function(parts, x, y, z){
		parts.x = this.x + this.size * (x * p_cos - y * p_sin), 
		parts.y = this.y + this.size * (x * p_sin + y * p_cos), 
		parts.z = this.z + this.size * z;
		parts.r = this.size * 0.5;
	}
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d){
		// 各パーツのテクスチャバッファリスト
		this.texBufStruct_hed1 = character.createTexuvList(e3d, 0.00, 0.000, 0.0625, 0.125, 0);
		this.texBufStruct_hed2 = character.createTexuvList(e3d, 0.00, 0.375, 0.0625, 0.125, 0);
		this.texBufStruct_body = character.createTexuvList(e3d, 0.25, 0.000, 0.0625, 0.125, 0);
		this.texBufStruct_tail = character.createTexuvList(e3d, 0.50, 0.000, 0.0625, 0.125, 0);
		this.texBufStruct_ftfr = character.createTexuvList(e3d, 0.25, 0.375, 0.0625, 0.125, 0);
		this.texBufStruct_ftfl = character.createTexuvList(e3d, 0.25, 0.375, 0.0625, 0.125, 1);
		this.texBufStruct_ftbr = character.createTexuvList(e3d, 0.50, 0.375, 0.0625, 0.125, 0);
		this.texBufStruct_ftbl = character.createTexuvList(e3d, 0.50, 0.375, 0.0625, 0.125, 1);
	}
	
	// ----------------------------------------------------------------
	// 速度計算
	this.calc1 = function(player){
		var x = player.x - this.x;
		var y = player.y - this.y;
		var z = player.z - this.z;
		var rr = x * x + y * y + z * z;
		
		var dr = this.rotate1 - this.rotate0;
		while(dr >  Math.PI){dr -= Math.PI * 2;}
		while(dr < -Math.PI){dr += Math.PI * 2;}
		
		switch(this.mode1){
			case 0: // ---------------- 通常状態 ----------------
				if(this.mode2 == 4){
					// 怯み
					if(this.action++ > 40){
						this.mode1 = 1;
						this.mode2 = 0;
						this.action = 0;
						this.speed = 0;
					}
				}else if(this.health <= 60){
					// 体力が閾値を超えた
					this.mode2 = 4;
					this.action = 0;
					this.speed = 0;
				}else if(this.mode2 == 2){
					// 攻撃 噛み付き
					if(this.action++ > 12){
						this.mode2 = 0;
						this.rotate1 = Math.atan2(y, x);
					}
				}else{
					// 操作入力を受け付ける
					this.rotate1 = Math.atan2(y, x);
					if(rr > 3){
						// 移動
						this.mode2 = 1;
						this.action++;
						this.speed = 2 / 30;
					}else if(Math.abs(dr) > 0.1){
						// 旋回
						this.mode2 = 1;
						this.action++;
						this.speed = 0;
					}else{
						// 攻撃準備
						this.mode2 = 2;
						this.action = 0;
						this.speed = 0;
					}
				}break;
			case 1: // ---------------- 怒り状態 ----------------
				if(this.health <= 10){
					// 体力が閾値を超えた
					this.mode1 = 2;
					this.mode2 = 0;
					this.action = 0;
					this.speed = 0;
				}else if(this.mode2 == 2){
					// 攻撃 ダッシュアタック
					this.speed = 8 / 30;
					if(this.action++ > 30){
						this.rotate1 = Math.atan2(y, x);
						if(Math.random() < 0.6){
							this.mode2 = 3;
							this.action = 0;
							this.speed = 0;
						}else{
							this.mode2 = 0;
						}
					}
				}else if(this.mode2 == 3){
					// 疲労状態
					dr = 0;
					if(this.action++ > 30){
						this.mode2 = 0;
						this.rotate1 = Math.atan2(y, x);
					}
				}else{
					// 操作入力を受け付ける
					this.rotate1 = Math.atan2(y, x);
					if(Math.abs(dr) > 0.1){
						// 旋回
						this.mode2 = 1;
						this.action++;
						this.speed = 0;
					}else{
						// 攻撃準備
						this.mode2 = 2;
						this.action = 0;
						this.speed = 0;
					}
				}break;
			case 2: // ---------------- 瀕死状態 ----------------
				if(this.mode2 == 4){
					// 怯み
					if(this.action++ > 40){
						this.mode1 = 3;
						this.mode2 = 0;
						this.action = 0;
						this.speed = 0;
					}
				}else if(this.health <= 0){
					// 体力が閾値を超えた
					this.mode2 = 4;
					this.action = 0;
					this.speed = 0;
				}else if(this.mode2 == 2){
					// 攻撃 噛み付き
					if(this.action++ > 30){
						this.mode2 = 0;
						this.rotate1 = Math.atan2(y, x);
					}
				}else{
					// 操作入力を受け付ける
					this.rotate1 = Math.atan2(y, x);
					if(rr > 3){
						// 移動
						this.mode2 = 1;
						this.action++;
						switch(Math.floor(this.action / 4) % 14){
							case 0: case 1: case 2: case 3: case 7: case 8: case 9: case 10: this.speed = dr = 0; break;
							default: this.speed = 2 / 30; break;
						}
					}else if(Math.abs(dr) > 0.1){
						// 旋回
						this.mode2 = 1;
						this.action++;
						this.speed = 0;
					}else{
						// 攻撃準備
						this.mode2 = 2;
						this.action = 0;
						this.speed = 0;
					}
				}break;
			default: // ---------------- 体力ゼロ ----------------
				this.mode2 = 0;
				this.action = 0;
				this.speed = 0;
				break;
		}
		
		this.rotate0 = this.rotate0 + dr * 0.08;
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
		
		// 各体パーツの位置を設定
		this.p_byte.r = 0;
		p_cos = Math.cos(this.rotate0);
		p_sin = Math.sin(this.rotate0);
		switch(this.mode2){
			case 1: // -------------------------------- 移動 --------------------------------
				switch(this.mode1){
					case 2: // -------- 瀕死状態 --------
						p_mouse_open = true
						switch(Math.floor(this.action / 4) % 14){
							case 0: case 1: case 2: case 3:
								this.setParts(this.p_head,  0.50,  0.00, 0.65);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.38);
								this.setParts(this.p_ftfr,  0.30,  0.30, 0.36);
								this.setParts(this.p_ftfl,  0.10, -0.30, 0.36);
								this.setParts(this.p_ftbr, -0.50,  0.22, 0.28);
								this.setParts(this.p_ftbl, -0.30, -0.22, 0.28);break;
							case 4:
								this.setParts(this.p_head,  0.50,  0.00, 0.73);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.23,  0.33, 0.36);
								this.setParts(this.p_ftfl,  0.17, -0.33, 0.46);
								this.setParts(this.p_ftbr, -0.43,  0.24, 0.38);
								this.setParts(this.p_ftbl, -0.37, -0.24, 0.28);break;
							case 5:
								this.setParts(this.p_head,  0.50,  0.00, 0.80);
								this.setParts(this.p_body,  0.00,  0.00, 0.60);
								this.setParts(this.p_tail, -0.35,  0.00, 0.43);
								this.setParts(this.p_ftfr,  0.20,  0.35, 0.36);
								this.setParts(this.p_ftfl,  0.20, -0.35, 0.51);
								this.setParts(this.p_ftbr, -0.40,  0.25, 0.43);
								this.setParts(this.p_ftbl, -0.40, -0.25, 0.28);break;
							case 6:
								this.setParts(this.p_head,  0.50,  0.00, 0.73);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.17,  0.33, 0.36);
								this.setParts(this.p_ftfl,  0.23, -0.33, 0.46);
								this.setParts(this.p_ftbr, -0.37,  0.24, 0.38);
								this.setParts(this.p_ftbl, -0.42, -0.24, 0.28);break;
							case 7: case 8: case 9: case 10:
								this.setParts(this.p_head,  0.50,  0.00, 0.65);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.38);
								this.setParts(this.p_ftfr,  0.10,  0.30, 0.36);
								this.setParts(this.p_ftfl,  0.30, -0.30, 0.36);
								this.setParts(this.p_ftbr, -0.30,  0.22, 0.28);
								this.setParts(this.p_ftbl, -0.50, -0.22, 0.28);break;
							case 11:
								this.setParts(this.p_head,  0.50,  0.00, 0.73);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.17,  0.33, 0.46);
								this.setParts(this.p_ftfl,  0.23, -0.33, 0.36);
								this.setParts(this.p_ftbr, -0.37,  0.24, 0.28);
								this.setParts(this.p_ftbl, -0.42, -0.24, 0.28);break;
							case 12:
								this.setParts(this.p_head,  0.50,  0.00, 0.80);
								this.setParts(this.p_body,  0.00,  0.00, 0.60);
								this.setParts(this.p_tail, -0.35,  0.00, 0.43);
								this.setParts(this.p_ftfr,  0.20,  0.35, 0.51);
								this.setParts(this.p_ftfl,  0.20, -0.35, 0.36);
								this.setParts(this.p_ftbr, -0.40,  0.25, 0.28);
								this.setParts(this.p_ftbl, -0.40, -0.25, 0.28);break;
							case 13:
								this.setParts(this.p_head,  0.50,  0.00, 0.73);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.23,  0.33, 0.46);
								this.setParts(this.p_ftfl,  0.17, -0.33, 0.36);
								this.setParts(this.p_ftbr, -0.43,  0.24, 0.28);
								this.setParts(this.p_ftbl, -0.37, -0.24, 0.28);break;
						}break;
					case 1: // -------- 怒り状態 --------
					case 3: // -------- 体力ゼロ --------
					default: // -------- 普通状態 --------
						p_mouse_open = false;
						switch(Math.floor(this.action / 2) % 8){
							case 0:
								this.setParts(this.p_head,  0.45,  0.00, 0.85);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.38);
								this.setParts(this.p_ftfr,  0.30,  0.30, 0.36);
								this.setParts(this.p_ftfl,  0.10, -0.30, 0.36);
								this.setParts(this.p_ftbr, -0.50,  0.22, 0.28);
								this.setParts(this.p_ftbl, -0.30, -0.22, 0.28);break;
							case 1:
								this.setParts(this.p_head,  0.45,  0.00, 0.88);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.23,  0.33, 0.36);
								this.setParts(this.p_ftfl,  0.17, -0.33, 0.46);
								this.setParts(this.p_ftbr, -0.43,  0.24, 0.38);
								this.setParts(this.p_ftbl, -0.37, -0.24, 0.28);break;
							case 2:
								this.setParts(this.p_head,  0.45,  0.00, 0.90);
								this.setParts(this.p_body,  0.00,  0.00, 0.60);
								this.setParts(this.p_tail, -0.35,  0.00, 0.43);
								this.setParts(this.p_ftfr,  0.20,  0.35, 0.36);
								this.setParts(this.p_ftfl,  0.20, -0.35, 0.51);
								this.setParts(this.p_ftbr, -0.40,  0.25, 0.43);
								this.setParts(this.p_ftbl, -0.40, -0.25, 0.28);break;
							case 3:
								this.setParts(this.p_head,  0.45,  0.00, 0.88);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.17,  0.33, 0.36);
								this.setParts(this.p_ftfl,  0.23, -0.33, 0.46);
								this.setParts(this.p_ftbr, -0.37,  0.24, 0.38);
								this.setParts(this.p_ftbl, -0.42, -0.24, 0.28);break;
							case 4:
								this.setParts(this.p_head,  0.45,  0.00, 0.85);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.38);
								this.setParts(this.p_ftfr,  0.10,  0.30, 0.36);
								this.setParts(this.p_ftfl,  0.30, -0.30, 0.36);
								this.setParts(this.p_ftbr, -0.30,  0.22, 0.28);
								this.setParts(this.p_ftbl, -0.50, -0.22, 0.28);break;
							case 5:
								this.setParts(this.p_head,  0.45,  0.00, 0.88);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.17,  0.33, 0.46);
								this.setParts(this.p_ftfl,  0.23, -0.33, 0.36);
								this.setParts(this.p_ftbr, -0.37,  0.24, 0.28);
								this.setParts(this.p_ftbl, -0.42, -0.24, 0.38);break;
							case 6:
								this.setParts(this.p_head,  0.45,  0.00, 0.90);
								this.setParts(this.p_body,  0.00,  0.00, 0.60);
								this.setParts(this.p_tail, -0.35,  0.00, 0.43);
								this.setParts(this.p_ftfr,  0.20,  0.35, 0.51);
								this.setParts(this.p_ftfl,  0.20, -0.35, 0.36);
								this.setParts(this.p_ftbr, -0.40,  0.25, 0.28);
								this.setParts(this.p_ftbl, -0.40, -0.25, 0.43);break;
							case 7:
								this.setParts(this.p_head,  0.45,  0.00, 0.88);
								this.setParts(this.p_body,  0.00,  0.00, 0.58);
								this.setParts(this.p_tail, -0.35,  0.00, 0.41);
								this.setParts(this.p_ftfr,  0.23,  0.33, 0.46);
								this.setParts(this.p_ftfl,  0.17, -0.33, 0.36);
								this.setParts(this.p_ftbr, -0.43,  0.24, 0.28);
								this.setParts(this.p_ftbl, -0.37, -0.24, 0.38);break;
						}break;
				}break;
			case 2: // -------------------------------- 攻撃 --------------------------------
				switch(this.mode1){
					case 1: // -------- 怒り状態 --------
						switch(Math.floor(this.action / 2) % 6){
							case 0:
								p_mouse_open = false;
								this.setParts(this.p_byte,  0.55,  0.00, 0.65);this.p_byte.r = 2;
								this.setParts(this.p_head,  0.55,  0.00, 0.65);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.45);
								this.setParts(this.p_ftfr,  0.23,  0.41, 0.36);
								this.setParts(this.p_ftfl,  0.17, -0.41, 0.46);
								this.setParts(this.p_ftbr, -0.43,  0.32, 0.38);
								this.setParts(this.p_ftbl, -0.37, -0.32, 0.28);break;
							case 1:
								p_mouse_open = true;
								this.setParts(this.p_head,  0.55,  0.00, 0.70);
								this.setParts(this.p_body,  0.00,  0.00, 0.60);
								this.setParts(this.p_tail, -0.35,  0.00, 0.50);
								this.setParts(this.p_ftfr,  0.20,  0.43, 0.36);
								this.setParts(this.p_ftfl,  0.20, -0.43, 0.51);
								this.setParts(this.p_ftbr, -0.40,  0.33, 0.43);
								this.setParts(this.p_ftbl, -0.40, -0.33, 0.28);break;
							case 2:
								p_mouse_open = true;
								this.setParts(this.p_head,  0.55,  0.00, 0.65);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.45);
								this.setParts(this.p_ftfr,  0.17,  0.41, 0.36);
								this.setParts(this.p_ftfl,  0.23, -0.41, 0.46);
								this.setParts(this.p_ftbr, -0.37,  0.32, 0.38);
								this.setParts(this.p_ftbl, -0.43, -0.32, 0.28);break;
							case 3:
								p_mouse_open = true;
								this.setParts(this.p_head,  0.55,  0.00, 0.65);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.45);
								this.setParts(this.p_ftfr,  0.17,  0.41, 0.46);
								this.setParts(this.p_ftfl,  0.23, -0.41, 0.36);
								this.setParts(this.p_ftbr, -0.37,  0.32, 0.28);
								this.setParts(this.p_ftbl, -0.43, -0.32, 0.38);break;
							case 4:
								p_mouse_open = true;
								this.setParts(this.p_head,  0.55,  0.00, 0.70);
								this.setParts(this.p_body,  0.00,  0.00, 0.60);
								this.setParts(this.p_tail, -0.35,  0.00, 0.50);
								this.setParts(this.p_ftfr,  0.20,  0.43, 0.51);
								this.setParts(this.p_ftfl,  0.20, -0.43, 0.36);
								this.setParts(this.p_ftbr, -0.40,  0.33, 0.28);
								this.setParts(this.p_ftbl, -0.40, -0.33, 0.43);break;
							case 5:
								p_mouse_open = true;
								this.setParts(this.p_head,  0.55,  0.00, 0.65);
								this.setParts(this.p_body,  0.00,  0.00, 0.55);
								this.setParts(this.p_tail, -0.35,  0.00, 0.45);
								this.setParts(this.p_ftfr,  0.23,  0.41, 0.46);
								this.setParts(this.p_ftfl,  0.17, -0.41, 0.36);
								this.setParts(this.p_ftbr, -0.43,  0.32, 0.28);
							this.setParts(this.p_ftbl, -0.37, -0.32, 0.38);break;
						}break;
					case 2: // -------- 瀕死状態 --------
					case 3: // -------- 体力ゼロ --------
					default: // -------- 普通状態 --------
						switch(this.action){
							case 0: case 1: 
								p_mouse_open = true;
								this.setParts(this.p_head,  0.24,  0.00, 1.02);
								this.setParts(this.p_body,  0.00,  0.00, 0.64);
								this.setParts(this.p_tail, -0.32,  0.00, 0.38);
								this.setParts(this.p_ftfr,  0.17,  0.38, 0.36);
								this.setParts(this.p_ftfl,  0.17, -0.38, 0.36);
								this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
								this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
							case 2: case 3: case 4: case 5: case 6:
								p_mouse_open = true;
								this.setParts(this.p_head,  0.20,  0.00, 1.05);
								this.setParts(this.p_body,  0.00,  0.00, 0.65);
								this.setParts(this.p_tail, -0.30,  0.00, 0.35);
								this.setParts(this.p_ftfr,  0.15,  0.38, 0.36);
								this.setParts(this.p_ftfl,  0.15, -0.38, 0.36);
								this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
								this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
							case 7:
								p_mouse_open = false;
								this.setParts(this.p_byte,  0.45,  0.00, 0.50);this.p_byte.r = 2;
								this.setParts(this.p_head,  0.45,  0.00, 0.50);
								this.setParts(this.p_body,  0.00,  0.00, 0.45);
								this.setParts(this.p_tail, -0.40,  0.00, 0.55);
								this.setParts(this.p_ftfr,  0.28,  0.38, 0.36);
								this.setParts(this.p_ftfl,  0.28, -0.38, 0.36);
								this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
								this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
							case 8: case 9: case 10: case 11: case 12:
								p_mouse_open = false;
								this.setParts(this.p_head,  0.45,  0.00, 0.55);
								this.setParts(this.p_body,  0.00,  0.00, 0.47);
								this.setParts(this.p_tail, -0.40,  0.00, 0.53);
								this.setParts(this.p_ftfr,  0.26,  0.38, 0.36);
								this.setParts(this.p_ftfl,  0.26, -0.38, 0.36);
								this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
								this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
							default:
								if(this.mode1 == 2){
									p_mouse_open = true
									this.setParts(this.p_head,  0.50,  0.00, 0.70);
									this.setParts(this.p_body,  0.00,  0.00, 0.55);
									this.setParts(this.p_tail, -0.35,  0.00, 0.38);
									this.setParts(this.p_ftfr,  0.25,  0.38, 0.36);
									this.setParts(this.p_ftfl,  0.25, -0.38, 0.36);
									this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
									this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
								}else{
									p_mouse_open = false;
									this.setParts(this.p_head,  0.35,  0.00, 0.85);
									this.setParts(this.p_body,  0.00,  0.00, 0.50);
									this.setParts(this.p_tail, -0.40,  0.00, 0.45);
									this.setParts(this.p_ftfr,  0.25,  0.38, 0.36);
									this.setParts(this.p_ftfl,  0.25, -0.38, 0.36);
									this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
									this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
								}
						}break;
				}break;
			case 3: // -------------------------------- 疲労 --------------------------------
				switch(Math.floor(this.action / 12) % 2){
					case 0:
						p_mouse_open = true;
						this.setParts(this.p_head,  0.35,  0.00, 0.85);
						this.setParts(this.p_body,  0.00,  0.00, 0.50);
						this.setParts(this.p_tail, -0.35,  0.00, 0.42);
						this.setParts(this.p_ftfr,  0.25,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.25, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
					case 1:
						p_mouse_open = true;
						this.setParts(this.p_head,  0.35,  0.00, 0.75);
						this.setParts(this.p_body,  0.00,  0.00, 0.45);
						this.setParts(this.p_tail, -0.35,  0.00, 0.37);
						this.setParts(this.p_ftfr,  0.25,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.25, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
				}break;
			case 4: // -------------------------------- 怯み --------------------------------
				switch(this.action){
					case 5: case 6: case 7: case 8: case 9:
						p_mouse_open = false;
						this.setParts(this.p_head,  0.35,  0.00, 0.85);
						this.setParts(this.p_body,  0.00,  0.00, 0.50);
						this.setParts(this.p_tail, -0.35,  0.00, 0.42);
						this.setParts(this.p_ftfr,  0.25,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.25, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
					case 10: case 11: case 12: case 13:
						p_mouse_open = false;
						this.setParts(this.p_head,  0.45,  0.00, 0.55);
						this.setParts(this.p_body,  0.00,  0.00, 0.47);
						this.setParts(this.p_tail, -0.35,  0.00, 0.42);
						this.setParts(this.p_ftfr,  0.26,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.26, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
					case 14: case 15: case 16:
						p_mouse_open = true;
						this.setParts(this.p_head,  0.24,  0.00, 1.02);
						this.setParts(this.p_body,  0.00,  0.00, 0.64);
						this.setParts(this.p_tail, -0.32,  0.00, 0.38);
						this.setParts(this.p_ftfr,  0.17,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.17, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
					case 17: case 18: case 19: case 20: case 21: case 22: case 23: case 24: case 25: case 26:
					case 27: case 28: case 29: case 30: case 31: case 32: case 33: case 34: case 35: case 36:
						p_mouse_open = true;
						this.setParts(this.p_head,  0.20,  0.00, 1.05);
						this.setParts(this.p_body,  0.00,  0.00, 0.65);
						this.setParts(this.p_tail, -0.30,  0.00, 0.35);
						this.setParts(this.p_ftfr,  0.15,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.15, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
					default:
						p_mouse_open = false;
						this.setParts(this.p_head,  0.30,  0.00, 0.95);
						this.setParts(this.p_body,  0.00,  0.00, 0.60);
						this.setParts(this.p_tail, -0.35,  0.00, 0.42);
						this.setParts(this.p_ftfr,  0.20,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.20, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
				}break;
			default: // -------------------------------- 静止 --------------------------------
				switch(this.mode1){
					case 3: // -------- 体力ゼロ --------
						p_mouse_open = false;
						this.setParts(this.p_head,  0.55,  0.00, 0.45);
						this.setParts(this.p_body,  0.00,  0.00, 0.45);
						this.setParts(this.p_tail, -0.35,  0.00, 0.45);
						this.setParts(this.p_ftfr,  0.23,  0.41, 0.36);
						this.setParts(this.p_ftfl,  0.17, -0.41, 0.36);
						this.setParts(this.p_ftbr, -0.43,  0.32, 0.28);
						this.setParts(this.p_ftbl, -0.37, -0.32, 0.28);break;
					case 2: // -------- 瀕死状態 --------
						p_mouse_open = true
						this.setParts(this.p_head,  0.50,  0.00, 0.70);
						this.setParts(this.p_body,  0.00,  0.00, 0.55);
						this.setParts(this.p_tail, -0.35,  0.00, 0.38);
						this.setParts(this.p_ftfr,  0.25,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.25, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
					case 1: // -------- 怒り状態 --------
					default: // -------- 普通状態 --------
						p_mouse_open = false;
						this.setParts(this.p_head,  0.30,  0.00, 0.95);
						this.setParts(this.p_body,  0.00,  0.00, 0.60);
						this.setParts(this.p_tail, -0.35,  0.00, 0.42);
						this.setParts(this.p_ftfr,  0.20,  0.38, 0.36);
						this.setParts(this.p_ftfl,  0.20, -0.38, 0.36);
						this.setParts(this.p_ftbr, -0.40,  0.28, 0.28);
						this.setParts(this.p_ftbl, -0.40, -0.28, 0.28);break;
				}break;
		}
	}
	
	// ----------------------------------------------------------------
	// あたり判定
	this.hit = function(player){
		if(this.health <= 0 || player.health <= 0){return;}
		// あたり判定関数
		var hittest = function(obj1, obj2){
			var x = obj2.x - obj1.x;
			var y = obj2.y - obj1.y;
			var z = obj2.z - obj1.z;
			var r = (obj2.r + obj1.r) * 0.5;
			return x * x + y * y + z * z < r * r;
		}
		// 攻撃あたり判定
		if(hittest(this.p_byte, player.p_body)){
			effectManager.add_star(player.p_body.x, player.p_body.y, player.p_body.z, 1);
			player.rotate0 = player.rotate1 = Math.atan2(this.p_byte.y - player.p_body.y, this.p_byte.x - player.p_body.x);
			player.speed = -2 / 30;
			player.vz = 10 / 30;
			player.mode2 = 5;
			player.health -= 20;
		}
		// 体あたり判定
		for(var i = 0; i < this.p_list.length; i++){
			if(hittest(this.p_list[i], player.p_body)){
				player.rotate0 = player.rotate1 = Math.atan2(this.p_list[i].y - player.p_body.y, this.p_list[i].x - player.p_body.x);
				player.speed = -2 / 30;
				player.vz = 2 / 30;
				player.mode2 = 5;
				player.health -= 1;
			}
		}
		// 剣あたり判定
		if(player.p_swrd.r > 0){
			for(var i = 0; i < this.p_list.length; i++){
				if(hittest(this.p_list[i], player.p_swrd)){
					effectManager.add_star(player.p_swrd.x, player.p_swrd.y, player.p_swrd.z, 0);
					boss.health -= 4;
				}
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d, mat, ctrl){
		// 描画関数作成
		var drawParts = character.createDrawFunc_global(e3d, mat, ctrl, this.rotate0, this.size);
		// 各体パーツ描画
		drawParts(p_mouse_open ? this.texBufStruct_hed2 : this.texBufStruct_hed1, 1.0, this.p_head.x, this.p_head.y, this.p_head.z);
		drawParts(this.texBufStruct_body, 1.0, this.p_body.x, this.p_body.y, this.p_body.z);
		drawParts(this.texBufStruct_tail, 1.0, this.p_tail.x, this.p_tail.y, this.p_tail.z);
		drawParts(this.texBufStruct_ftfr, 1.0, this.p_ftfr.x, this.p_ftfr.y, this.p_ftfr.z);
		drawParts(this.texBufStruct_ftfl, 1.0, this.p_ftfl.x, this.p_ftfl.y, this.p_ftfl.z);
		drawParts(this.texBufStruct_ftbr, 1.0, this.p_ftbr.x, this.p_ftbr.y, this.p_ftbr.z);
		drawParts(this.texBufStruct_ftbl, 1.0, this.p_ftbl.x, this.p_ftbl.y, this.p_ftbl.z);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

