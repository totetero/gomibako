// 地球の表示
// 
// このソースコードは
// WebOS Goodies
// 「JavaScript でリアルタイム 3DCG を実現する WebGL の使い方」
// (http://webos-goodies.jp/archives/getting_started_with_webgl.html)
// をパ…参考に作られました。
// 

function Earth(){
	this.vertBuffer;
	this.texcBuffer;
	this.faceBuffer;
	this.texture;
	this.faceNum;
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d){
		var vert = new Array();
		var texc = new Array();
		var face = new Array();
		
		// 頂点データを生成
		for(var i = 0 ; i <= 8 ; ++i) {
			var v = i / 8.0;
			var y = Math.cos(Math.PI * v);
			var r = Math.sin(Math.PI * v);
			for(var j = 0 ; j <= 16 ; ++j) {
				var u = j / 16.0;
				vert.push(r * Math.cos(2 * Math.PI * u));
				vert.push(y);
				vert.push(r * Math.sin(2 * Math.PI * u));
				texc.push(u);
				texc.push(v);
			}
		}
		
		// インデックスデータを生成
		for(var j = 0 ; j < 8 ; ++j) {
			var base = j * 17;
			for(var i = 0 ; i < 16 ; ++i) {
				face.push(base + i);
				face.push(base + i + 1);
				face.push(base + i + 17);
				face.push(base + i + 17);
				face.push(base + i + 1);
				face.push(base + i + 1 + 17);
			}
		}
		// インデックスの数を保存しておく
		this.faceNum = face.length;
		
		// VBOとIBOを作成し、データを転送
		this.vertBuffer = e3d.createVBO(vert);
		this.texcBuffer = e3d.createVBO(texc);
		this.faceBuffer = e3d.createIBO(face);
		
		// テクスチャ読込み
		this.texture = e3d.loadTexture("earth.jpg");
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d){
		e3d.draw(0, this.faceNum, this.vertBuffer, this.texcBuffer, this.faceBuffer, this.texture);
	}
}

