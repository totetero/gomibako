import 'js/web.jsx';

import "../util/Ctrl.jsx";
import "../util/Sound.jsx";
import "../util/Drawer.jsx";
import "../util/Loader.jsx";
import "../util/Loading.jsx";
import "../util/EventCartridge.jsx";

import "Bb3dCanvas.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// さいころ描画クラス
class Bb3dDice{
	var x : number = 0;
	var y : number = 0;
	var h : number = 0;
	var rotq = [1, 0, 0, 0];
	var pip1 = 1;
	var pip2 = 2;
	var pip3 = 3;
	var pip4 = 4;
	var pip5 = 5;
	var pip6 = 6;
	var skipCount = 0;

	var _img : HTMLImageElement;
	var _cvs : HTMLCanvasElement;
	var _ctx : CanvasRenderingContext2D;
	var _size : number;
	var _basePos : number[][];
	var _tempPos : number[][];
	var _tempRot : number[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(code : string, size : int){
		this._img = Loader.imgs["img_dice"]; // TODO code
		this._size = size;
		// オフスクリーンcanvasの準備
		this._cvs = dom.document.createElement("canvas") as HTMLCanvasElement;
		this._ctx = this._cvs.getContext("2d") as CanvasRenderingContext2D;
		this._cvs.width = this._size * 2;
		this._cvs.height = this._size * 2;

		// サイコロ頂点を作成
		var s = 0.2;
		this._basePos = [
			[0, 0, 1 + s], [0, 1, 1 + s], [1, 1, 1 + s], [1, 0, 1 + s],
			[0, 0, 0 - s], [1, 0, 0 - s], [1, 1, 0 - s], [0, 1, 0 - s],
			[0, 1 + s, 0], [1, 1 + s, 0], [1, 1 + s, 1], [0, 1 + s, 1],
			[0, 0 - s, 0], [0, 0 - s, 1], [1, 0 - s, 1], [1, 0 - s, 0],
			[1 + s, 0, 0], [1 + s, 0, 1], [1 + s, 1, 1], [1 + s, 1, 0],
			[0 - s, 0, 0], [0 - s, 1, 0], [0 - s, 1, 1], [0 - s, 0, 1]
		];
		// サイコロ頂点を原点中心の最大座標0.5に正規化する
		for(var i = 0; i < this._basePos.length; i++){
			for(var j = 0; j < this._basePos[i].length; j++){
				this._basePos[i][j] = (this._basePos[i][j] - 0.5) / (1 + s * 2);
			}
		}
		// 座標変換後用の配列を作成
		this._tempRot = new number[];
		this._tempPos = new number[][];
		for(var i = 0; i < this._basePos.length; i++){this._tempPos[i] = new number[];}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(bcvs : Bb3dCanvas) : void{
		// 影描画
		Ctrl.gctx.save();
		Ctrl.gctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		Ctrl.gctx.translate(bcvs.centerx, bcvs.centery);
		Ctrl.gctx.translate(this.x, this.y);
		Ctrl.gctx.scale(1, bcvs.sinh);
		Ctrl.gctx.beginPath();
		Ctrl.gctx.arc(0, 0, this._size * 0.65, 0, Math.PI * 2, false);
		Ctrl.gctx.fill();
		Ctrl.gctx.restore();

		// さいころ描画
		if((this.skipCount++ % 3) == 0){
			// 回転クォータニオンに視角をかける
			var rq = this._tempRot;
			Bb3dDice.setQuat(rq, 1, 0, 0, bcvs.roth);
			Bb3dDice.multiQuat(rq, rq, this.rotq);
			// 各頂点座標にクォータニオン回転の適用
			var pos = this._tempPos;
			for(var i = 0; i < this._basePos.length; i++){
				var x = this._basePos[i][0];
				var y = this._basePos[i][1];
				var z = this._basePos[i][2];
				var ix =  rq[3] * x + rq[1] * z - rq[2] * y;
				var iy =  rq[3] * y + rq[2] * x - rq[0] * z;
				var iz =  rq[3] * z + rq[0] * y - rq[1] * x;
				var iw = -rq[0] * x - rq[1] * y - rq[2] * z;
				pos[i][0] = ix * rq[3] - iw * rq[0] - iy * rq[2] + iz * rq[1];
				pos[i][1] = iy * rq[3] - iw * rq[1] - iz * rq[0] + ix * rq[2];
				pos[i][2] = iz * rq[3] - iw * rq[2] - ix * rq[1] + iy * rq[0];
			}

			this._ctx.save();
			this._ctx.clearRect(0, 0, this._cvs.width, this._cvs.height);
			this._ctx.translate(this._cvs.width * 0.5, this._cvs.height * 0.5);
			this._ctx.scale(this._size, this._size);
			for(var i = 0; i < 2; i++){
				var type = ((i == 0) ? -1 : 0);
				// 面描画
				this.drawPolygon(type != 0 ? type : this.pip1, pos[ 0], pos[ 1], pos[ 2], pos[ 3]);
				this.drawPolygon(type != 0 ? type : this.pip6, pos[ 4], pos[ 5], pos[ 6], pos[ 7]);
				this.drawPolygon(type != 0 ? type : this.pip2, pos[ 8], pos[ 9], pos[10], pos[11]);
				this.drawPolygon(type != 0 ? type : this.pip5, pos[12], pos[13], pos[14], pos[15]);
				this.drawPolygon(type != 0 ? type : this.pip3, pos[16], pos[17], pos[18], pos[19]);
				this.drawPolygon(type != 0 ? type : this.pip4, pos[20], pos[21], pos[22], pos[23]);
				// 頂点の三角形
				this.drawPolygon(type, pos[ 0], pos[13], pos[23], null);
				this.drawPolygon(type, pos[ 1], pos[22], pos[11], null);
				this.drawPolygon(type, pos[ 2], pos[10], pos[18], null);
				this.drawPolygon(type, pos[ 3], pos[17], pos[14], null);
				this.drawPolygon(type, pos[ 4], pos[20], pos[12], null);
				this.drawPolygon(type, pos[ 5], pos[15], pos[16], null);
				this.drawPolygon(type, pos[ 6], pos[19], pos[ 9], null);
				this.drawPolygon(type, pos[ 7], pos[ 8], pos[21], null);
				// 側面の四角形
				this.drawPolygon(type, pos[ 1], pos[ 0], pos[23], pos[22]);
				this.drawPolygon(type, pos[ 2], pos[ 1], pos[11], pos[10]);
				this.drawPolygon(type, pos[ 3], pos[ 2], pos[18], pos[17]);
				this.drawPolygon(type, pos[ 0], pos[ 3], pos[14], pos[13]);
				this.drawPolygon(type, pos[ 5], pos[ 4], pos[12], pos[15]);
				this.drawPolygon(type, pos[ 6], pos[ 5], pos[16], pos[19]);
				this.drawPolygon(type, pos[ 7], pos[ 6], pos[ 9], pos[ 8]);
				this.drawPolygon(type, pos[ 4], pos[ 7], pos[21], pos[20]);
				this.drawPolygon(type, pos[10], pos[ 9], pos[19], pos[18]);
				this.drawPolygon(type, pos[ 8], pos[11], pos[22], pos[21]);
				this.drawPolygon(type, pos[13], pos[12], pos[20], pos[23]);
				this.drawPolygon(type, pos[15], pos[14], pos[17], pos[16]);
			}
			this._ctx.restore();
		}
		var x = bcvs.centerx + this.x - this._cvs.width * 0.5;
		var y = bcvs.centery + this.y - this._cvs.height * 0.5 - (this.h + this._size * 0.5) * bcvs.cosh;
		Ctrl.gctx.drawImage(this._cvs, x, y);
	}

	// 面を描画する関数
	function drawPolygon(type : int, top0 : number[], top1 : number[], top2 : number[], top3 : number[]) : void{
		// カリング(隠面消去)
		var x1 = top1[0] - top0[0];
		var y1 = top1[1] - top0[1];
		var x2 = top2[0] - top0[0];
		var y2 = top2[1] - top0[1];
		var cz = x1 * y2 - y1 * x2;
		if(cz < 0){return;}

		if(type < 0){
			// 描画順により枠線になる面の描画
			var scale = 1.05;
			this._ctx.fillStyle = "#000";
			this._ctx.beginPath();
			this._ctx.moveTo(top0[0] * scale, top0[1] * scale);
			this._ctx.lineTo(top1[0] * scale, top1[1] * scale);
			this._ctx.lineTo(top2[0] * scale, top2[1] * scale);
			if(top3 != null){this._ctx.lineTo(top3[0] * scale, top3[1] * scale);}
			this._ctx.closePath();
			this._ctx.fill();
		}else{
			// 環境光と反射光
			var z1 = top1[2] - top0[2];
			var z2 = top2[2] - top0[2];
			var cx = y1 * z2 - z1 * y2;
			var cy = z1 * x2 - x1 * z2;
			var cr = Math.sqrt(cx * cx + cy * cy + cz * cz);
			var dot = (cx * 0 + cy * 0.5 + cz * 0.87) / cr;
			var light = Math.min(255, 150 + 200 * dot) as int;
			var color = "rgb(" + light + "," + light + "," + light + ")";
			this._ctx.fillStyle = color;

			if(type > 0){
				// 面の描画
				// 参考 最速チュパカブラ研究会 2009年2月11日の日記(http://d.hatena.ne.jp/gyuque/20090211)
				//var u0 = ((type - 1) % 3) * 32;
				//var v0 = (((type - 1) / 3) as int) * 32;
				//var u1 = u0 + 0;
				//var v1 = v0 + 0;
				//var u2 = u0 + 0;
				//var v2 = v0 + 32;
				//var u3 = u0 + 32;
				//var v3 = v0 + 32;
				//var uv11 = u2 - u1;
				//var uv12 = v2 - v1;
				//var uv21 = u3 - u1;
				//var uv22 = v3 - v1;
				//var det = uv11 * uv22 - uv12 * uv21;
				//if (-0.0001 < det && det < 0.0001){return;}
				//var uv11d = uv22 / det;
				//var uv22d = uv11 / det;
				//var uv12d = -uv12 / det;
				//var uv21d = -uv21 / det;
				//var t11 = uv11d * x1 + uv12d * x2;
				//var t21 = uv11d * y1 + uv12d * y2;
				//var t12 = uv21d * x1 + uv22d * x2;
				//var t22 = uv21d * y1 + uv22d * y2;
				//var t13 = top0[0] - (t11 * u1 + t12 * v1);
				//var t23 = top0[1] - (t21 * u1 + t22 * v1);
				//var uw0 = u1 < u2 ? u1 : u2; uw0 = uw0 < u3 ? uw0 : u3;
				//var uw1 = u1 > u2 ? u1 : u2; uw1 = uw1 > u3 ? uw1 : u3;
				//var vh0 = v1 < v2 ? v1 : v2; vh0 = vh0 < v3 ? vh0 : v3;
				//var vh1 = v1 > v2 ? v1 : v2; vh1 = vh1 > v3 ? vh1 : v3;
				//uw1 = uw1 - uw0;
				//vh1 = vh1 - vh0;
				//this._ctx.save();
				//this._ctx.beginPath();
				//this._ctx.moveTo(top0[0], top0[1]);
				//this._ctx.lineTo(top1[0], top1[1]);
				//this._ctx.lineTo(top2[0], top2[1]);
				//this._ctx.lineTo(top3[0], top3[1]);
				//this._ctx.closePath();
				//this._ctx.clip();
				//this._ctx.transform(t11, t21, t12, t22, t13, t23);
				//this._ctx.fill();
				//this._ctx.drawImage(this._img, uw0, vh0, uw1, vh1, uw0, vh0, uw1, vh1);
				//this._ctx.restore();
				// ↓ 省略！！
				var uvsize = 32;
				var u = ((type - 1) % 3) * uvsize;
				var v = (((type - 1) / 3) as int) * uvsize;
				var t11 = (x2 - x1) / uvsize;
				var t21 = (y2 - y1) / uvsize;
				var t12 = x1 / uvsize;
				var t22 = y1 / uvsize;
				var t13 = top0[0] - (t11 * u + t12 * v);
				var t23 = top0[1] - (t21 * u + t22 * v);
				this._ctx.save();
				this._ctx.beginPath();
				this._ctx.moveTo(top0[0], top0[1]);
				this._ctx.lineTo(top1[0], top1[1]);
				this._ctx.lineTo(top2[0], top2[1]);
				this._ctx.lineTo(top3[0], top3[1]);
				this._ctx.closePath();
				this._ctx.transform(t11, t21, t12, t22, t13, t23);
				this._ctx.fill();
				this._ctx.drawImage(this._img, u, v, uvsize, uvsize, u, v, uvsize, uvsize);
				this._ctx.restore();
			}else{
				// 辺と頂点の描画
				this._ctx.beginPath();
				this._ctx.moveTo(top0[0], top0[1]);
				this._ctx.lineTo(top1[0], top1[1]);
				this._ctx.lineTo(top2[0], top2[1]);
				if(top3 != null){this._ctx.lineTo(top3[0], top3[1]);}
				this._ctx.closePath();
				this._ctx.fill();
			}
		}
	}

	// ----------------------------------------------------------------
	// クオータニオン作成関数 回転軸と回転角度から回転のクオータニオンを生成する
	static function setQuat(quat : number[], x : number, y : number, z : number, rot : number) : void{
		var r = x * x + y * y + z * z;
		if(r == 0){x = r = 1; y = z = 0;}
		var s = Math.sin(rot * 0.5) / Math.sqrt(r);
		quat[0] = x * s;
		quat[1] = y * s;
		quat[2] = z * s;
		quat[3] = Math.cos(rot * 0.5);
	}

	// ----------------------------------------------------------------
	// クオータニオン掛け合わせ関数
	static function multiQuat(q0 : number[], q1 : number[], q2 : number[]) : void{
		var qax = q1[0]; var qay = q1[1]; var qaz = q1[2]; var qaw = q1[3];
		var qbx = q2[0]; var qby = q2[1]; var qbz = q2[2]; var qbw = q2[3];
		q0[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		q0[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		q0[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		q0[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
	}

	// ----------------------------------------------------------------
	// クオータニオン設定関数 ランダムな回転のクオータニオンを設定する
	function setRandomQuat() : void{
		Bb3dDice.setQuat(this.rotq, Math.random(), Math.random(), Math.random(), Math.random() * Math.PI * 2);
	}

	// ----------------------------------------------------------------
	// クオータニオン設定関数 さいころの目設定
	function setDiceQuat(pip : int) : void{
		switch(pip){
			case 1: Bb3dDice.setQuat(this.rotq, 1, 0, 0, Math.PI *  0.5); break;
			case 2: Bb3dDice.setQuat(this.rotq, 1, 0, 0, Math.PI *  1  ); break;
			case 3: Bb3dDice.setQuat(this.rotq, 0, 0, 1, Math.PI * -0.5); break;
			case 4: Bb3dDice.setQuat(this.rotq, 0, 0, 1, Math.PI *  0.5); break;
			case 5: Bb3dDice.setQuat(this.rotq, 1, 0, 0, Math.PI *  0  ); break;
			case 6: Bb3dDice.setQuat(this.rotq, 1, 0, 0, Math.PI * -0.5); break;
		}
		var rq = this._tempRot;
		Bb3dDice.setQuat(rq, 0, 1, 0, Math.random() * Math.PI * 2);
		Bb3dDice.multiQuat(this.rotq, rq, this.rotq);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

