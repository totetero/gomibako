import "js/web.jsx";
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// glMatrix.0.9.6.jsのインターフェイス

native class vec3{
	static function create() : Float32Array;
	static function create(vec : number[]) : Float32Array;
	static function create(vec : Float32Array) : Float32Array;
	static function set(vec : number[], dest : Float32Array) : Float32Array;
	static function set(vec : Float32Array, dest : Float32Array) : Float32Array;
	static function add(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function add(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function subtract(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function subtract(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function negate(vec : Float32Array) : Float32Array;
	static function negate(vec : Float32Array, dest : Float32Array) : Float32Array;
	static function scale(vec : Float32Array, val : number) : Float32Array;
	static function scale(vec : Float32Array, val : number, dest : Float32Array) : Float32Array;
	static function normalize(vec : Float32Array) : Float32Array;
	static function normalize(vec : Float32Array, dest : Float32Array) : Float32Array;
	static function cross(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function cross(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function length(vec : Float32Array) : number;
	static function dot(vec : Float32Array, vec2 : Float32Array) : number;
	static function direction(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function direction(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function lerp(vec : Float32Array, vec2 : Float32Array, lerp : number) : Float32Array;
	static function lerp(vec : Float32Array, vec2 : Float32Array, lerp : number, dest : Float32Array) : Float32Array;
	static function str(vec : Float32Array) : string;
}

native class mat3{
	static function create() : Float32Array;
	static function create(mat : number[]) : Float32Array;
	static function create(mat : Float32Array) : Float32Array;
	static function set(mat : number[], dest : Float32Array) : Float32Array;
	static function set(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function identity(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat4(mat : Float32Array) : Float32Array;
	static function toMat4(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function str(mat : Float32Array) : string;
}

native class mat4{
	static function create() : Float32Array;
	static function create(mat : number[]) : Float32Array;
	static function create(mat : Float32Array) : Float32Array;
	static function set(mat : number[], dest : Float32Array) : Float32Array;
	static function set(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function identity(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function determinant(mat : Float32Array) : number;
	static function inverse(mat : Float32Array) : Float32Array;
	static function inverse(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toRotationMat(mat : Float32Array) : Float32Array;
	static function toRotationMat(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat3(mat : Float32Array) : Float32Array;
	static function toMat3(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toInverseMat3(mat : Float32Array) : Float32Array;
	static function toInverseMat3(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function multiply(mat : Float32Array, mat2 : Float32Array) : Float32Array;
	static function multiply(mat : Float32Array, mat2 : Float32Array, dest : Float32Array) : Float32Array;
	static function multiplyVec3(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function multiplyVec3(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function multiplyVec4(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function multiplyVec4(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function translate(mat : Float32Array, vec : number[]) : Float32Array;
	static function translate(mat : Float32Array, vec : number[], dest : Float32Array) : Float32Array;
	static function translate(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function translate(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function scale(mat : Float32Array, vec : number[]) : Float32Array;
	static function scale(mat : Float32Array, vec : number[], dest : Float32Array) : Float32Array;
	static function scale(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function scale(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : number[]) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : number[], dest : Float32Array) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : Float32Array) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : Float32Array, dest : Float32Array) : Float32Array;
	static function rotateX(mat : Float32Array, angle : number) : Float32Array;
	static function rotateX(mat : Float32Array, angle : number, dest : Float32Array) : Float32Array;
	static function rotateY(mat : Float32Array, angle : number) : Float32Array;
	static function rotateY(mat : Float32Array, angle : number, dest : Float32Array) : Float32Array;
	static function rotateZ(mat : Float32Array, angle : number) : Float32Array;
	static function rotateZ(mat : Float32Array, angle : number, dest : Float32Array) : Float32Array;
	static function frustum(left : number, right : number, bottom : number, top : number, near : number, far : number) : Float32Array;
	static function frustum(left : number, right : number, bottom : number, top : number, near : number, far : number, dest : Float32Array) : Float32Array;
	static function perspective(fovy : number, aspect : number, near : number, far : number) : Float32Array;
	static function perspective(fovy : number, aspect : number, near : number, far : number, dest : Float32Array) : Float32Array;
	static function ortho(left : number, right : number, bottom : number, top : number, near : number, far : number) : Float32Array;
	static function ortho(left : number, right : number, bottom : number, top : number, near : number, far : number, dest : Float32Array) : Float32Array;
	static function lookAt(eye : number[], center : number[], up : number[]) : Float32Array;
	static function lookAt(eye : number[], center : number[], up : number[], dest : Float32Array) : Float32Array;
	static function lookAt(eye : Float32Array, center : Float32Array, up : Float32Array) : Float32Array;
	static function lookAt(eye : Float32Array, center : Float32Array, up : Float32Array, dest : Float32Array) : Float32Array;
	static function str(mat : Float32Array) : string;
}

native class quat4{
	static function create() : Float32Array;
	static function create(quat : number[]) : Float32Array;
	static function create(quat : Float32Array) : Float32Array;
	static function set(quat : number[], dest : Float32Array) : Float32Array;
	static function set(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function calculateW(quat : Float32Array) : Float32Array;
	static function calculateW(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function inverse(quat : Float32Array) : Float32Array;
	static function inverse(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function length(quat : Float32Array) : number;
	static function normalize(quat : Float32Array) : Float32Array;
	static function normalize(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function multiply(quat : Float32Array, quat2 : Float32Array) : Float32Array;
	static function multiply(quat : Float32Array, quat2 : Float32Array, dest : Float32Array) : Float32Array;
	static function multiplyVec3(quat : Float32Array, vec : Float32Array) : Float32Array;
	static function multiplyVec3(quat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat3(quat : Float32Array) : Float32Array;
	static function toMat3(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat4(quat : Float32Array) : Float32Array;
	static function toMat4(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function slerp(quat : Float32Array, quat2 : Float32Array, sleap : number) : Float32Array;
	static function slerp(quat : Float32Array, quat2 : Float32Array, sleap : number, dest : Float32Array) : Float32Array;
	static function str(quat : Float32Array) : string;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class _Main{
	var gl     : WebGLRenderingContext;
	var canvas : HTMLCanvasElement;
	var shader : WebGLProgram;
	var s_pos  : int;
	var s_nor  : int;
	var s_mat  : WebGLUniformLocation;
	var s_nmat : WebGLUniformLocation;
	var s_lig  : WebGLUniformLocation;
	
	var vertBuffer : WebGLBuffer;
	var normBuffer : WebGLBuffer;
	var faceBuffer : WebGLBuffer;
	var faceNum    : int;
	
	var count : int;
	
	// -------------------------------- main関数--------------------------------
	static function main() : void {
		var main : _Main = new _Main();
		// webGLの初期化
		try{main.initGL();}catch(e : Object){return;}
		// サムネイル用画像を除去
		var e = dom.window.document.getElementById('screenshot');
		if(e){e.parentNode.removeChild(e);}
		// モデル生成
		main.createModel();
		// メインループ開始
		Timer.setInterval(function():void{main.drawFrame();}, 30);
	}
	
	// -------------------------------- 頂点シェーダー --------------------------------
	var vshader_src =
		"#ifdef GL_ES                                                    \n" +
		"    precision highp float;                                      \n" +
		"#endif                                                          \n" +
		"                                                                \n" +
		"attribute vec3 vs_attr_pos;                                     \n" +
		"attribute vec3 vs_attr_nor;                                     \n" +
		"uniform mat4 vs_unif_mat;                                       \n" +
		"uniform mat3 vs_unif_nmat;                                      \n" +
		"                                                                \n" +
		"varying vec3 vs_normal;                                         \n" +
		"                                                                \n" +
		"void main() {                                                   \n" +
		"    vs_normal = vs_unif_nmat * vs_attr_nor;                     \n" +
		"    gl_Position = vs_unif_mat * vec4(vs_attr_pos, 1.0);         \n" +
		"}                                                               \n" +
	"";
	
	// -------------------------------- フラグメントシェーダー --------------------------------
	var fshader_src =
		"#ifdef GL_ES                                                    \n" +
		"    precision highp float;                                      \n" +
		"#endif                                                          \n" +
		"                                                                \n" +
		"uniform vec3 fs_unif_lig;                                       \n" +
		"                                                                \n" +
		"varying vec3 vs_normal;                                         \n" +
		"                                                                \n" +
		"void main() {                                                   \n" +
		"    vec3 normal = normalize(vs_normal);                         \n" +
		"    float diff = max(dot(normal, fs_unif_lig), 0.0);            \n" +
		"                                                                \n" +
		"    vec3 view = -vec3(0.0, 0.0, 1.0);                           \n" +
		"    float toon = pow(max(dot(normal, view), 0.0), 5.0);         \n" +
		"                                                                \n" +
		"    if(toon < 0.5){                                             \n" +
		"        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);                \n" +
		"    }else if(diff < 0.5){                                       \n" +
		"        gl_FragColor = vec4(0.4, 0.6, 0.4, 1.0);                \n" +
		"    }else{                                                      \n" +
		"        gl_FragColor = vec4(0.8, 0.9, 0.8, 1.0);                \n" +
		"    }                                                           \n" +
		"}                                                               \n" +
	"";
	
	// -------------------------------- GL初期化 --------------------------------
	function initGL() : int {
		this.canvas = dom.window.document.getElementById('canvas') as HTMLCanvasElement;
		this.gl = this.canvas.getContext("experimental-webgl") as WebGLRenderingContext;
		if(!this.gl){return -1;}
		var gl : WebGLRenderingContext = this.gl;
		// 頂点シェーダーの作成
		var vshader : WebGLShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vshader, this.vshader_src);
		gl.compileShader(vshader);
		// フラグメントシェーダーの作成
		var fshader : WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fshader,  this.fshader_src);
		gl.compileShader(fshader);
		// プログラムオブジェクトを作成
		this.shader = gl.createProgram();
		gl.attachShader(this.shader, vshader);
		gl.attachShader(this.shader, fshader);
		// 頂点シェーダーとフラグメントシェーダーをリンクする
		gl.linkProgram(this.shader);
		// シェーダーパラメータ取得
		this.s_pos = gl.getAttribLocation(this.shader, "vs_attr_pos");
		this.s_nor = gl.getAttribLocation(this.shader, "vs_attr_nor");
		this.s_mat = gl.getUniformLocation(this.shader, "vs_unif_mat");
		this.s_nmat = gl.getUniformLocation(this.shader, "vs_unif_nmat");
		this.s_lig = gl.getUniformLocation(this.shader, "fs_unif_lig");
		
		// opengl描画設定
		gl.clearColor(0, 0, 1, 1);
		gl.clearDepth(1);
		gl.enable(gl.DEPTH_TEST);
		// カリング 裏面消去
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		// シェーダーを指定
		gl.useProgram(this.shader);
		
		return 0;
	}
	
	// -------------------------------- モデル生成 トーラス --------------------------------
	function createModel() : void {
		var gl : WebGLRenderingContext = this.gl;
		
		// 頂点データと法線データを生成
		var divide : int = 16;
		var r1 : number = 1;
		var r2 : number = 2;
		var vert : number[] = new number[];
		var norm : number[] = new number[];
		for(var i = 0; i < divide; i++){
			for(var j = 0; j < divide; j++){
				var rot1 : number = Math.PI * 2 * i / divide;
				var rot2 : number = Math.PI * 2 * j / divide;
				var r3 : number = r1 * Math.cos(rot2) + r2;
				var y : number = r1 * Math.sin(rot2);
				var x : number = r3 * Math.cos(rot1);
				var z : number = r3 * Math.sin(rot1);
				vert.push(x, y, z);
				var nx : number = x - r2 * Math.cos(rot1);
				var nz : number = z - r2 * Math.sin(rot1);
				var ny : number = y - 0;
				var r : number = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
				norm.push(nx * r, ny * r, nz * r);
			}
		}
	
		// インデックスデータを生成
		var face : int[] = new int[];
		for(var i0 = 0; i0 < divide; i0++){
			for(var j0 = 0; j0 < divide; j0++){
				var i1 : int = (i0 + 1) % divide;
				var j1 : int = (j0 + 1) % divide;
				face.push(divide * i0 + j1);
				face.push(divide * i1 + j1);
				face.push(divide * i1 + j0);
				face.push(divide * i0 + j1);
				face.push(divide * i1 + j0);
				face.push(divide * i0 + j0);
			}
		}
		this.faceNum = face.length;
		
		// 頂点データをVBOに変換
		this.vertBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
	
		// 法線データをVBOに変換
		this.normBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);
	
		// インデックスデータをIBOに変換
		this.faceBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.faceBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(face), gl.STATIC_DRAW);
		
		this.count = 0;
	}
	
	// -------------------------------- フレーム毎の描画処理 --------------------------------
	function drawFrame() : void {
		var gl : WebGLRenderingContext = this.gl;
		
		// クリア
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// 光源方向登録
		gl.uniform3fv(this.s_lig, new Float32Array([0.577, 0.577, -0.577]));
		
		// 行列作成と登録
		var mat = mat4.perspective(30, this.canvas.width / this.canvas.height, 1, 100);
		mat4.translate(mat, [0, 0, -15]);
		mat4.rotateY(mat, this.count / 50);
		mat4.rotateX(mat, this.count++ / 100);
		gl.uniformMatrix4fv(this.s_mat, false, mat);
		// 法線行列の作成と登録
		var nmat = mat4.toInverseMat3(mat);
		mat3.transpose(nmat);
		gl.uniformMatrix3fv(this.s_nmat, false, nmat);
		
		// VBO登録 頂点データ
		gl.enableVertexAttribArray(this.s_pos);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer(this.s_pos, 3, gl.FLOAT, false, 0, 0);
		// VBO登録 法線データ
		gl.enableVertexAttribArray(this.s_nor);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.vertexAttribPointer(this.s_nor, 3, gl.FLOAT, false, 0, 0);
		// IBO登録 インデックスデータ
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.faceBuffer);
		
		// 描画
		gl.drawElements(gl.TRIANGLES, this.faceNum, gl.UNSIGNED_SHORT, 0);
		
		// 画面の更新
		gl.flush();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

//-->

