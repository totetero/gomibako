// 簡易3Dエンジン
// webglを使用
// 
// このソースコードは
// WebOS Goodies
// 「JavaScript でリアルタイム 3DCG を実現する WebGL の使い方」
// (http://webos-goodies.jp/archives/getting_started_with_webgl.html)
// をパ…参考に作られました。
// 
// このソースコードはMITライセンスです
// 楽しく使ってね 仲良く使ってね
// Copyright (c) 2011 totetero
// 

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 頂点シェーダー
var vshader_src =
	"#ifdef GL_ES                                                    \n" +
	"    precision highp float;                                      \n" +
	"#endif                                                          \n" +
	"                                                                \n" +
	"attribute vec3 vs_attr_pos;                                     \n" +
	"attribute vec2 vs_attr_uv;                                      \n" +
	"uniform mat4 vs_unif_mat;                                       \n" +
	"                                                                \n" +
	"varying vec4 color;                                             \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    color       = vec4(1.0, 1.0, 1.0, 1.0);                     \n" +
	"    texCoord    = vs_attr_uv;                                   \n" +
	"    gl_Position = vs_unif_mat * vec4(vs_attr_pos, 1.0);         \n" +
	"}                                                               \n" +
"";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// フラグメントシェーダー
var fshader_src =
	"#ifdef GL_ES                                                    \n" +
	"    precision highp float;                                      \n" +
	"#endif                                                          \n" +
	"                                                                \n" +
	"uniform sampler2D texture;                                      \n" +
	"                                                                \n" +
	"varying vec4 color;                                             \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    gl_FragColor = texture2D(texture, texCoord) * color;        \n" +
	"}                                                               \n" +
"";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 簡易3Dエンジンクラス
function Engine3d(){
	this.gl;
	this.shader;
	this.s_pos;
	this.s_uvc;
	this.s_mat;
	
	// ----------------------------------------------------------------
	// 初期化
	
	// エンジン初期化
	this.init = function(canvas){
		// コンテキストの獲得
		var gl = canvas.getContext("experimental-webgl");
		if(!gl){
			alert("WebGL がサポートされていません。");
			return -1;
		}
		
		// 頂点シェーダーの作成
		var vshader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vshader, vshader_src);
		gl.compileShader(vshader);
		if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)){
			alert(gl.getShaderInfoLog(vshader));
			return -1;
		}
		
		// フラグメントシェーダーの作成
		var fshader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fshader,  fshader_src);
		gl.compileShader(fshader);
		if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)){
			alert(gl.getShaderInfoLog(fshader));
			return -1;
		}
		
		// プログラムオブジェクトを作成
		this.shader = gl.createProgram();
		gl.attachShader(this.shader, vshader);
		gl.attachShader(this.shader, fshader);
		
		// シェーダー内の変数を頂点属性に結びつける
		gl.bindAttribLocation(this.shader, this.s_pos = 0, "vs_attr_pos");
		gl.bindAttribLocation(this.shader, this.s_uvc = 1, "vs_attr_uv");
		
		// 頂点シェーダーとフラグメントシェーダーをリンクする
		gl.linkProgram(this.shader);
		if(!gl.getProgramParameter(this.shader, gl.LINK_STATUS)){
			alert(gl.getProgramInfoLog(this.shader));
			return -1;
		}
		
		// シェーダーパラメータのインデックスを取得保存
		this.s_mat = gl.getUniformLocation(this.shader, "vs_unif_mat");
		
		// opengl描画設定
		gl.clearColor(0, 0, 1, 1);
		gl.clearDepth(1000);
		// デプステスト
		gl.enable(gl.DEPTH_TEST);
		// カリング
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		// シェーダーを指定
		gl.useProgram(this.shader);
		
		this.gl = gl;
		return 0;
	}
	
	// ----------------------------------------------------------------
	// モデル作成
	
	// VBO作成
	this.createVBO = function(vertices){
		var gl = this.gl;
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return vertexBuffer;
	}
	
	// IBO作成
	this.createIBO = function(indexes){
		var gl = this.gl;
		var indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexes), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		return indexBuffer;
	}
	
	// テクスチャ読込み
	this.loadTexture = function(url){
		var gl = this.gl;
		// テクスチャーオブジェクトを作成
		var texture = gl.createTexture();
		// 画像の読み込み完了時の処理
		var image = new Image();
		image.onload = function() {
			gl.enable(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		// 画像の読み込みを開始
		image.src = url;
		
		return texture;
	}
	
	// ----------------------------------------------------------------
	// 描画処理
	
	// 描画のクリア
	this.clear = function(){
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}
	
	// 行列の設定
	this.setMatrix = function(matrix){
		var matrixArray = new Float32Array([
			matrix._11, matrix._12, matrix._13, matrix._14,
			matrix._21, matrix._22, matrix._23, matrix._24,
			matrix._31, matrix._32, matrix._33, matrix._34,
			matrix._41, matrix._42, matrix._43, matrix._44,
		]);
		this.gl.uniformMatrix4fv(this.s_mat, false, matrixArray);
	}
	
	// 描画
	this.draw = function(offset, count, vertVBO, texcVBO, faceIBO, texture){
		var gl = this.gl;
		// VBO 頂点座標
		gl.enableVertexAttribArray(this.s_pos);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertVBO);
		gl.vertexAttribPointer(this.s_pos, 3, gl.FLOAT, false, 0, 0);
		// VBO テクスチャ座標
		gl.enableVertexAttribArray(this.s_uvc);
		gl.bindBuffer(gl.ARRAY_BUFFER, texcVBO);
		gl.vertexAttribPointer(this.s_uvc, 2, gl.FLOAT, false, 0, 0);
		// IBO 頂点インデックス
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceIBO);
		
		// テクスチャを指定
		gl.enable(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		// 描画
		gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset * Uint16Array.BYTES_PER_ELEMENT);
	}
	
	// 描画の反映
	this.flush = function(){
		this.gl.flush();
	}
	
	// ----------------------------------------------------------------
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

