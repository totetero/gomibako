// 本ソースコードと"player.png", "ball.png"のライセンスはMITライセンスではなく
// バンザイライセンスです。ソースコードの一部もしくは全部を使用したものを配布するまえに
// 「ばんじゃーい」と3回叫んでください。叫ばないと再配布権がないので誰も見てなくても叫んで下さい。
// 作者は、ソフトウェアに関してなんら責任を負いません。

// ビルボード構造体
var billBoardStruct = new Object();
billBoardStruct.tmpMat1 = new Object();
billBoardStruct.tmpMat2 = new Object();
billBoardStruct.img1 = null;
billBoardStruct.img2 = null;

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクターポーズの描画
function drawCharacter1(mat, id, size, x, y, z, r){
	// ワールド座標系拡大回転移動
	mulMat44Translate(billBoardStruct.tmpMat2, mat, x, y, z);
	mulMat44RotY(billBoardStruct.tmpMat1, billBoardStruct.tmpMat2, -r);
	mulMat44Scale(billBoardStruct.tmpMat2, billBoardStruct.tmpMat1, size, size, size);
	
	var img = billBoardStruct.img1;
	var matrix = billBoardStruct.tmpMat2;
	switch(id){
		case 0:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.50, r);// 歩き1
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.25, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.05, -0.08, 0.12, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.05,  0.08, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05, -0.16, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.05,  0.16, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.48, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.48, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.38, r); break;
		case 1:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.52, r);// 歩き2
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.27, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.00, -0.08, 0.11, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.00,  0.08, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.02, -0.18, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.02,  0.18, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.50, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.50, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.40, r); break;
		case 2:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.50, r);// 歩き3
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.25, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.05, -0.08, 0.10, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.05,  0.08, 0.12, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.05, -0.18, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05,  0.18, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.48, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.48, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.38, r); break;
		case 3:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.01,  0.00, 0.52, r);// 歩き4
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.27, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.00, -0.08, 0.10, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.00,  0.08, 0.11, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.02, -0.16, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.02,  0.16, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04,  0.20, 0.50, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.04, -0.20, 0.50, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.14,  0.00, 0.40, r); break;
		case 4:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.45, r);// 走り1
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.23, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.20, -0.07, 0.20, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.10,  0.07, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.10, -0.15, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.10,  0.15, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.43, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.43, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.33, r); break;
		case 5:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.47, r);// 走り2
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.26, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.00, -0.07, 0.15, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.00,  0.07, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05, -0.18, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.05,  0.18, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.45, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.45, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.35, r); break;
		case 6:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.45, r);// 走り3
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.23, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.10, -0.07, 0.10, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.20,  0.07, 0.20, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.10, -0.15, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.10,  0.15, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.43, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.43, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.33, r); break;
		case 7:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.47, r);// 走り4
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.26, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.00, -0.07, 0.10, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.00,  0.07, 0.15, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.05, -0.18, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05,  0.18, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.45, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.45, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.35, r); break;
		case 8:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.43, r);// しゃがむ
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.22, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.02, -0.10, 0.10, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.02,  0.10, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05, -0.18, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05,  0.18, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.41, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.41, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.05,  0.00, 0.31, r); break;
		case 9:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.45, r);// ジャンプ
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.20, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.12, -0.10, 0.10, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.12,  0.10, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.02, -0.20, 0.28);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.02,  0.20, 0.28);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.05,  0.20, 0.43, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.05, -0.20, 0.43, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.15,  0.00, 0.33, r); break;
		case 10:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.45, r);// 落下 ダメージ
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.20, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25,  0.12, -0.10, 0.10, r + Math.PI);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25,  0.12,  0.10, 0.10, r + Math.PI);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.02, -0.20, 0.28);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.02,  0.20, 0.28);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.05,  0.20, 0.43, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.05, -0.20, 0.43, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.15,  0.00, 0.33, r); break;
		case 11:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.12,  0.00, 0.30, r);// 飛び込み
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.20, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.18, -0.07, 0.10, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.18,  0.07, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.20, -0.13, 0.17);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.20,  0.13, 0.17);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07,  0.20, 0.28, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.07, -0.20, 0.28, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.06,  0.00, 0.30, r); break;
		case 12:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,  -0.06, -0.00, 0.6 - 0.38, r + Math.PI, 1);// 前転1
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.02, -0.00, 0.6 - 0.15, r + Math.PI, 1);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.14,  0.07, 0.6 - 0.10, r,           1);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.14, -0.07, 0.6 - 0.10, r,           1);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.12,  0.15, 0.6 - 0.10);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.12, -0.14, 0.6 - 0.10);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.01, -0.20, 0.6 - 0.36, r + Math.PI, 1);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.01,  0.20, 0.6 - 0.36, r + Math.PI, 1);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,   0.12, -0.00, 0.6 - 0.26, r + Math.PI, 1); break;
		case 13:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.06,  0.00, 0.38, r);// 前転2
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.15, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25,  0.14, -0.07, 0.10, r + Math.PI);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25,  0.14,  0.07, 0.10, r + Math.PI);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.12, -0.15, 0.10);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.12,  0.14, 0.10);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.01,  0.20, 0.36, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.01, -0.20, 0.36, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.12,  0.00, 0.26, r); break;
		case 14:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.08,  0.00, 0.46, r);// キック1
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.21, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.25, -0.17, -0.10, 0.20, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.02,  0.05, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.05, -0.16, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05,  0.16, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.03,  0.20, 0.44, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,   0.03, -0.20, 0.44, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.07,  0.00, 0.34, r); break;
		case 15:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.03,  0.00, 0.52, r);// キック2
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.01,  0.00, 0.27, r);
			drawBall2(img, matrix, 32,  96,  8, size * 0.3,   0.15, -0.05, 0.20, r + Math.PI);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.02,  0.05, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.05, -0.16, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.05,  0.16, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.02,  0.20, 0.50, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.02, -0.20, 0.50, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.12,  0.00, 0.40, r); break;
		default:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.52, r);// 棒立ち
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,  -0.02,  0.00, 0.27, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25, -0.02, -0.10, 0.10, r);
			drawBall2(img, matrix,  0,  96,  8, size * 0.25,  0.02,  0.10, 0.10, r);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25,  0.02, -0.20, 0.25);
			drawBall1(img, matrix,  0, 120,  8, size * 0.25, -0.02,  0.20, 0.25);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.05,  0.20, 0.50, r);
			drawBall2(img, matrix, 64,   0, 16, size * 0.5,  -0.05, -0.20, 0.50, r);
			drawBall2(img, matrix, 64,  48, 16, size * 0.5,  -0.15,  0.00, 0.40, r); break;//*/
	}
}

// ボールキャラクターの描画
function drawCharacter2(mat, id, size, x, y, z, r){
	// ワールド座標系拡大回転移動
	mulMat44Translate(billBoardStruct.tmpMat2, mat, x, y, z);
	mulMat44RotY(billBoardStruct.tmpMat1, billBoardStruct.tmpMat2, -r);
	mulMat44Scale(billBoardStruct.tmpMat2, billBoardStruct.tmpMat1, size, size, size);
	
	var img = billBoardStruct.img2;
	var matrix = billBoardStruct.tmpMat2;
	switch(id){
		case 1:
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.24, r + Math.PI, 1); break;
		case 2:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.24, r + Math.PI, 1); break;
		case 3:
			drawBall2(img, matrix,  0,  48, 16, size * 0.5,   0.00,  0.00, 0.24, r); break;
		default:
			drawBall2(img, matrix,  0,   0, 16, size * 0.5,   0.00,  0.00, 0.24, r); break;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 球体の描画 全方向同じ絵柄
function drawBall1(img, mat, u0, v0, uv, size, x, y, z){
	// ローカル座標系移動
	mulMat44Translate(billBoardStruct.tmpMat1, mat, x, z, y);
	
	pushBillBoard(img, billBoardStruct.tmpMat1, size, u0, v0, uv, uv);
}

// 球体の描画 方向によって絵柄が変わる
function drawBall2(img, mat, u0, v0, uv, size, x, y, z, r, turn){
	// ローカル座標系移動
	mulMat44Translate(billBoardStruct.tmpMat1, mat, x, z, y);
	
	// ワールド座標系での向きを求める
	var u, v;
	var mx = billBoardStruct.tmpMat1._41;
	var my = billBoardStruct.tmpMat1._42;
	var mz = billBoardStruct.tmpMat1._43;
	var anglev = 180 + 180 / Math.PI * (-ctrlStruct.rotv + Math.atan2(mz, mx) + r);
	var angleh = -180 / Math.PI * (-ctrlStruct.roth + Math.atan2(my, Math.sqrt(mx * mx + mz * mz)));
	while(anglev >  360 - 45){anglev -= 360;}
	while(anglev <=   0 - 45){anglev += 360;}
	
	if(!turn){
		if(anglev < 45){u = 3;}
		else if(anglev <= 135){u = 2;}
		else if(anglev < 225){u = 1;}
		else{u = 0;}
	
		if(angleh < -30){v = 2;}
		else if(angleh <  30){v = 1;}
		else{v = 0;}
	}else{
		// 反転時
		if(anglev < 45){u = 1;}
		else if(anglev <= 135){u = 2;}
		else if(anglev < 225){u = 3;}
		else{u = 0;}
	
		if(angleh < -30){v = 0;}
		else if(angleh <  30){v = 1;}
		else{v = 2;}
	}
	
	u = u0 + u * uv;
	v = v0 + v * uv;
	
	pushBillBoard(img, billBoardStruct.tmpMat1, size, u, v, uv, uv, turn);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

