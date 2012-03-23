// 本ソースコードと"mapchip.png"のライセンスはMITライセンスではなく
// バンザイライセンスです。ソースコードの一部もしくは全部を使用したものを配布するまえに
// 「ばんじゃーい」と3回叫んでください。叫ばないと再配布権がないので誰も見てなくても叫んで下さい。
// 作者は、ソフトウェアに関してなんら責任を負いません。

// 地形構造体
var mapStruct = new Object();
mapStruct.vertexes = null;
mapStruct.x = 5;
mapStruct.y = 5;
mapStruct.z = 5;
mapStruct.map = [[
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
	[3, 3, 3, 3, 3],
],[
	[0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[4, 0, 0, 5, 0],
	[4, 4, 0, 0, 0],
],[
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 6, 0],
	[0, 0, 6, 5, 6],
	[4, 0, 0, 6, 0],
],[
	[0, 0, 0, 0, 7],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 6, 0],
	[0, 0, 6, 5, 6],
	[0, 0, 0, 6, 0],
],[
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 6, 0],
	[0, 0, 0, 0, 0],
]];
mapStruct.color = new Array();

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// マップチップの範囲外チェック
function getMapChip(x, y, z){
	if(x < 0 || mapStruct.x <= x){return 0;}
	if(y < 0 || mapStruct.y <= y){return 0;}
	if(z < 0 || mapStruct.z <= z){return 0;}
	return mapStruct.map[z][y][x];
}

// マップチップの透過チェック
function isMapChipVisible(x, y, z){
	return getMapChip(x, y, z) != 0;
}

// マップチップのあたりチェック
function isMapChipHit(x, y, z){
	var chip = getMapChip(x, y, z);
	return chip != 0 && chip != 6;
}
function isMapChipHit2(x, y, z0, z1){return isMapChipHit(x, y, z0) || isMapChipHit(x, y, z1);}


// 地形の頂点配列作成
function createMapVertexes(){
	mapStruct.vertexes = new Array();
	for(var i = 0; i < mapStruct.x; i++){
		for(var j = 0; j < mapStruct.y; j++){
			for(var k = 0; k < mapStruct.z; k++){
				if(mapStruct.map[k][j][i] > 0){
					if(!isMapChipVisible(i, j, k + 1)){pushSurfaces(i, j, k, 1);}
					if(!isMapChipVisible(i, j, k - 1)){pushSurfaces(i, j, k, 2);}
					if(!isMapChipVisible(i, j + 1, k)){pushSurfaces(i, j, k, 3);}
					if(!isMapChipVisible(i, j - 1, k)){pushSurfaces(i, j, k, 4);}
					if(!isMapChipVisible(i + 1, j, k)){pushSurfaces(i, j, k, 5);}
					if(!isMapChipVisible(i - 1, j, k)){pushSurfaces(i, j, k, 6);}
				}
			}
		}
	}
}

// 面の頂点配列作成
function pushSurfaces(x0, y0, z0, s){
	var x1 = x0 + 1;
	var y1 = y0 + 1;
	var z1 = z0 + 1;
	var chip = mapStruct.map[z0][y0][x0] - 1;
	var u0 = (chip % 2) * 64;
	var v0 = Math.floor(chip / 2) * 16;
	var v1 = v0 + 16;
	switch(s){
		case 1:
			var u1 = u0 + 16;
			mapStruct.vertexes.push(new Vertex(x0, z1, y0, u0, v0));
			mapStruct.vertexes.push(new Vertex(x0, z1, y1, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y1, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y0, u1, v0));
			break;
		case 2:
			u0 = u0 + 48;
			var u1 = u0 + 16;
			mapStruct.vertexes.push(new Vertex(x0, z0, y1, u0, v0));
			mapStruct.vertexes.push(new Vertex(x0, z0, y0, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y0, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y1, u1, v0));
			break;
		case 3:
			u0 = u0 + 16;
			var u1 = u0 + 16;
			mapStruct.vertexes.push(new Vertex(x0, z1, y1, u0, v0));
			mapStruct.vertexes.push(new Vertex(x0, z0, y1, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y1, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y1, u1, v0));
			break;
		case 4:
			u0 = u0 + 16;
			var u1 = u0 + 16;
			mapStruct.vertexes.push(new Vertex(x1, z1, y0, u0, v0));
			mapStruct.vertexes.push(new Vertex(x1, z0, y0, u0, v1));
			mapStruct.vertexes.push(new Vertex(x0, z0, y0, u1, v1));
			mapStruct.vertexes.push(new Vertex(x0, z1, y0, u1, v0));
			break;
		case 5:
			u0 = u0 + 32;
			var u1 = u0 + 16;
			mapStruct.vertexes.push(new Vertex(x1, z1, y1, u0, v0));
			mapStruct.vertexes.push(new Vertex(x1, z0, y1, u0, v1));
			mapStruct.vertexes.push(new Vertex(x1, z0, y0, u1, v1));
			mapStruct.vertexes.push(new Vertex(x1, z1, y0, u1, v0));
			break;
		case 6:
			u0 = u0 + 32;
			var u1 = u0 + 16;
			mapStruct.vertexes.push(new Vertex(x0, z1, y0, u0, v0));
			mapStruct.vertexes.push(new Vertex(x0, z0, y0, u0, v1));
			mapStruct.vertexes.push(new Vertex(x0, z0, y1, u1, v1));
			mapStruct.vertexes.push(new Vertex(x0, z1, y1, u1, v0));
			break;
	}
	switch(chip){
		case 0: mapStruct.color.push("rgb(255, 128,   0)"); break;
		case 1: mapStruct.color.push("rgb(128, 255,   0)"); break;
		case 2: mapStruct.color.push("rgb(128, 255,   0)"); break;
		case 3: mapStruct.color.push("rgb(128, 128, 128)"); break;
		case 4: mapStruct.color.push("rgb(160, 128,   0)"); break;
		case 5: mapStruct.color.push("rgb(  0, 128,   0)"); break;
		case 6: mapStruct.color.push("rgb(255, 255, 255)"); break;
		case 7: mapStruct.color.push("rgb(255, 255, 255)"); break;
	}
}

// 頂点配列から地形描画
function drawMap(img, matrix){
	var num = mapStruct.vertexes.length / 4
	for(var i = 0; i < num; i++){
		if(gameStruct.liteMode){
			pushColorSquare(mapStruct.color[i], matrix, mapStruct.vertexes[i * 4 + 0], mapStruct.vertexes[i * 4 + 1], mapStruct.vertexes[i * 4 + 2], mapStruct.vertexes[i * 4 + 3]);
		}else{
			pushTexTriangle(img, matrix, mapStruct.vertexes[i * 4 + 0], mapStruct.vertexes[i * 4 + 1], mapStruct.vertexes[i * 4 + 2]);
			pushTexTriangle(img, matrix, mapStruct.vertexes[i * 4 + 0], mapStruct.vertexes[i * 4 + 2], mapStruct.vertexes[i * 4 + 3]);
		}
		
		
	}
}

// あたり判定
// 斜めのあたり判定が若干怪しいが放置！！
function mapCollision(character, r, h){
	// 垂直軸あたり判定
	var x0 = Math.floor(character.x);
	var y0 = Math.floor(character.y);
	var z0 = Math.floor(character.z);
	var z1 = Math.floor(character.z + h);
	character.ground = false;
	if(isMapChipHit(x0, y0, z0)){
		// 下方向
		character.ground = true;
		character.z = z0 + 0.99;
		if(character.velv < 0){character.velv = 0;}
	}else if(isMapChipHit(x0, y0, z1)){
		// 上方向
		character.z = z1 - h - 0.01;
		if(character.velv > 0){character.velv = 0;}
	}
	
	// 高さ測定
	if(!character.ground){
		for(var i = z0; i >= 0; i--){
			if(isMapChipHit(x0, y0, i)){break;}
		}
		if(i == -1){
			character.height = -1;
		}else{
			character.height = character.z - i - 1;
		}
	}else{
		character.height = 0;
	}
	
	// 水平軸直角あたり判定
	var x1 = Math.floor(character.x + r);
	var y1 = Math.floor(character.y + r);
	var x2 = Math.floor(character.x - r);
	var y2 = Math.floor(character.y - r);
	z0 = Math.floor(character.z + 0.02);
	z1 = Math.floor(character.z + h);
	if(isMapChipHit2(x1, y0, z0, z1)){character.x = x1 - r;}// x軸正方向
	else if(isMapChipHit(x2, y0, z0, z1)){character.x = x2 + r + 1;}// x軸負方向
	if(isMapChipHit2(x0, y1, z0, z1)){character.y = y1 - r;}// y軸正方向
	else if(isMapChipHit2(x0, y2, z0, z1)){character.y = y2 + r + 1;}// y軸負方向
	
	// 水平軸斜めあたり判定
	x1 = character.x - x0;
	y1 = character.y - y0;
	x2 = x0 + 1 - character.x;
	y2 = y0 + 1 - character.y;
	var rr = r * r;
	var dd = x1 * x1 + y1 * y1;
	if(dd < rr && isMapChipHit2(x0 - 1, y0 - 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x += x1 * d;
		character.y += y1 * d;
	}
	dd = x2 * x2 + y1 * y1;
	if(dd < rr && isMapChipHit2(x0 + 1, y0 - 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x -= x2 * d;
		character.y += y1 * d;
	}
	dd = x1 * x1 + y2 * y2;
	if(dd < rr && isMapChipHit2(x0 - 1, y0 + 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x += x1 * d;
		character.y -= y2 * d;
	}
	dd = x2 * x2 + y2 * y2;
	if(dd < rr && isMapChipHit2(x0 + 1, y0 + 1, z0, z1)){
		var d = 1 - Math.sqrt(dd / rr);
		character.x -= x2 * d;
		character.y -= y2 * d;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

