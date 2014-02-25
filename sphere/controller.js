// 簡易コントローラー
// 
// このソースコードはMITライセンスです
// Copyright (c) 2011 totetero
// 

var ctrl = new Controller();

function Controller(){
	this.kup = false;
	this.kdn = false;
	this.krt = false;
	this.klt = false;
	this.k_z = false;
	this.k_x = false;
	
	this.rotv = 0;
	this.roth = 0;
	
	this.mousex = 0;
	this.mousey = 0;
	
	// ----------------------------------------------------------------
	// コントローラーの初期化 イベント登録
	var canvas = null;
	var kimg = new Image();
	var bimg = new Image();
	
	this.init = function(cvs){
		canvas = cvs;
		canvas.addEventListener("mousedown", mdnEvent, true);
		canvas.addEventListener("mousemove", mmvEvent, true);
		canvas.addEventListener("mouseup", mupEvent, true);
		canvas.addEventListener("touchstart", mdnEvent, true);
		canvas.addEventListener("touchmove", mmvEvent, true);
		canvas.addEventListener("touchend", mupEvent, true);
		document.addEventListener("keydown", kdnEvent, true);
		document.addEventListener("keyup", kupEvent, true);
		kimg.src = "key.png";
		bimg.src = "btn.png";
	}
	
	// ----------------------------------------------------------------
	// コントローラーの描画
	this.draw = function(){
		if(kimg.complete && bimg.complete){
			var g = canvas.getContext('2d');
			// 矢印キー
			var x = 10;
			var y = canvas.height - 10 - 112;
			g.drawImage(kimg, 0, 0, 112, 112, x, y, 112, 112);
			if(this.kup){g.drawImage(kimg, 112,  0, 48, 56, x + 32, y +  0, 48, 56);}
			if(this.kdn){g.drawImage(kimg, 168, 48, 48, 56, x + 32, y + 56, 48, 56);}
			if(this.krt){g.drawImage(kimg, 160,  0, 56, 48, x + 56, y + 32, 56, 48);}
			if(this.klt){g.drawImage(kimg, 112, 56, 56, 48, x +  0, y + 32, 56, 48);}
			// Zボタン
			var x = canvas.width - 10 - 128;
			var y = canvas.height - 10 - 64;
			if(this.k_z){g.drawImage(bimg, 0, 64, 64, 64, x, y, 64, 64);}
			else{g.drawImage(bimg, 0, 0, 64, 64, x, y, 64, 64);}
			// Xボタン
			var x = canvas.width - 10 - 64;
			var y = canvas.height - 10 - 96;
			if(this.k_x){g.drawImage(bimg, 64, 64, 64, 64, x, y, 64, 64);}
			else{g.drawImage(bimg, 64, 0, 64, 64, x, y, 64, 64);}
		}
	}
	
	// ----------------------------------------------------------------
	// マウスイベント
	var mouseMode = 0;
	var touchx;
	var touchy;
	var touchrv;
	var touchrh;
	var roth_max = Math.PI / 180 *  90;
	var roth_min = Math.PI / 180 * -90;
	
	// コントローラーをクリック時の動作
	var btnEvent = function(){
		// 矢印キー
		var x = ctrl.mousex - (10 + 56);
		var y = ctrl.mousey - (canvas.height - 10 - 56);
		if(x * x + y * y < 56 * 56){
			if(-6 < x && x < 6 && -6 < y && y < 6){ctrl.kup = ctrl.kdn = ctrl.krt = ctrl.klt = 0;} // ど真ん中の空白地帯
			else if(-18 < x && x <  18 && y < -18){ctrl.kup = 1; ctrl.kdn = ctrl.krt = ctrl.klt = 0; mouseMode = 1;} // 上
			else if(-18 < x && x <  18 && y >  18){ctrl.kdn = 1; ctrl.kup = ctrl.krt = ctrl.klt = 0; mouseMode = 1;} // 下
			else if(-18 < y && y <  18 && x >  18){ctrl.krt = 1; ctrl.kup = ctrl.kdn = ctrl.klt = 0; mouseMode = 1;} // 右
			else if(-18 < y && y <  18 && x < -18){ctrl.klt = 1; ctrl.kup = ctrl.kdn = ctrl.krt = 0; mouseMode = 1;} // 左
			else if(x >  18 && y < -18){ctrl.kup = ctrl.krt = 1; ctrl.kdn = ctrl.klt = 0; mouseMode = 1;} // 右上
			else if(x >  18 && y >  18){ctrl.kdn = ctrl.krt = 1; ctrl.kup = ctrl.klt = 0; mouseMode = 1;} // 右下
			else if(x < -18 && y < -18){ctrl.kup = ctrl.klt = 1; ctrl.kdn = ctrl.krt = 0; mouseMode = 1;} // 左上
			else if(x < -18 && y >  18){ctrl.kdn = ctrl.klt = 1; ctrl.kup = ctrl.krt = 0; mouseMode = 1;} // 左下
			else{
				if(x > y && x < -y){ctrl.kup = 1; ctrl.kdn = ctrl.krt = ctrl.klt = 0; mouseMode = 1;} // 内側上
				if(x < y && x > -y){ctrl.kdn = 1; ctrl.kup = ctrl.krt = ctrl.klt = 0; mouseMode = 1;} // 内側下
				if(x > y && x > -y){ctrl.krt = 1; ctrl.kup = ctrl.kdn = ctrl.klt = 0; mouseMode = 1;} // 内側右
				if(x < y && x < -y){ctrl.klt = 1; ctrl.kup = ctrl.kdn = ctrl.krt = 0; mouseMode = 1;} // 内側左
			}
		}else{ctrl.kup = ctrl.kdn = ctrl.krt = ctrl.klt = 0;} // 押していない
		
		// ZXボタン
		x = ctrl.mousex - (canvas.width - 10 - 64);
		y = ctrl.mousey - (canvas.height - 10 - 48);
		if(-8 < x && x < 8 && -8 < y && y < 8){ctrl.k_z =ctrl.k_x = 1; mouseMode = 1;} // 同時押し
		else if(-64 < x && x <  0 && -16 < y && y < 48){ctrl.k_z = 1; ctrl.k_x = 0; mouseMode = 1;} // z押し
		else if(  0 < x && x < 64 && -48 < y && y < 16){ctrl.k_x = 1; ctrl.k_z = 0; mouseMode = 1;} // x押し
		else{ctrl.k_z = ctrl.k_x = 0;}
	}
	
	// マウスを押す
	var mdnEvent = function(e){
		// コントローラークリックの確認
		btnEvent();
		if(mouseMode != 1){
			// 回転開始
			touchx = ctrl.mousex;
			touchy = ctrl.mousey;
			touchrv = ctrl.rotv;
			touchrh = ctrl.roth;
			mouseMode = 2;
		}
		// マウスイベント終了
		e.preventDefault();
	}
	
	// マウス移動
	var mmvEvent = function(e){
		// 座標を獲得する
		var rect = e.target.getBoundingClientRect();
		ctrl.mousex = e.clientX - rect.left;
		ctrl.mousey = e.clientY - rect.top;
		// マウス移動イベント
		if(mouseMode == 1){btnEvent();}
		else if(mouseMode == 2){
			// 回転中
			ctrl.rotv = touchrv + (ctrl.mousex - touchx) * 0.03;
			ctrl.roth = touchrh + (ctrl.mousey - touchy) * 0.03;
			if(ctrl.roth > roth_max){ctrl.roth = roth_max;}
			if(ctrl.roth < roth_min){ctrl.roth = roth_min;}
		}
		// マウスイベント終了
		e.preventDefault();
	}
	
	// マウスボタンを離す
	var mupEvent = function(e){
		mouseMode = 0;
		ctrl.kup = ctrl.kdn = ctrl.krt = ctrl.klt = ctrl.k_z = ctrl.k_x = false;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// キーイベント
	
	// キーを押す
	var kdnEvent = function(e){
		var getkey = true;
		switch (e.keyCode){
			case 37: ctrl.klt = true; break;
			case 38: ctrl.kup = true; break;
			case 39: ctrl.krt = true; break;
			case 40: ctrl.kdn = true; break;
			case 88: ctrl.k_x = true; break;
			case 90: ctrl.k_z = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){
			e.preventDefault();
		}
	}
	
	// キーを離す
	var kupEvent = function(e){
		var getkey = true;
		switch (e.keyCode){
			case 37: ctrl.klt = false; break;
			case 38: ctrl.kup = false; break;
			case 39: ctrl.krt = false; break;
			case 40: ctrl.kdn = false; break;
			case 88: ctrl.k_x = false; break;
			case 90: ctrl.k_z = false; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){
			e.preventDefault();
		}
	}
	
	// ----------------------------------------------------------------
}
