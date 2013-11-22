import 'js/web.jsx';

import 'Ctrl.jsx';
import 'EventCartridge.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// さいころクラス
class Dice{
	var pos0 : number[][];
	var pos1 : number[][];
	var rotq = [0, 0, 0, 1];

	var size : number;
	var x : number;
	var y : number;
	var h : number;

	var img : HTMLImageElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(img : HTMLImageElement){
		this.img = img;

		// サイコロの頂点を作成
		var s = 0.2;
		this.pos0 = [
			[0, 0, 1 + s], [0, 1, 1 + s], [1, 1, 1 + s], [1, 0, 1 + s],
			[0, 0, 0 - s], [1, 0, 0 - s], [1, 1, 0 - s], [0, 1, 0 - s],
			[0, 1 + s, 0], [1, 1 + s, 0], [1, 1 + s, 1], [0, 1 + s, 1],
			[0, 0 - s, 0], [0, 0 - s, 1], [1, 0 - s, 1], [1, 0 - s, 0],
			[1 + s, 0, 0], [1 + s, 0, 1], [1 + s, 1, 1], [1 + s, 1, 0],
			[0 - s, 0, 0], [0 - s, 1, 0], [0 - s, 1, 1], [0 - s, 0, 1]
		];
		// 座標変換後用の配列を作成
		this.pos1 = new number[][];
		for(var i = 0; i < this.pos0.length; i++){this.pos1[i] = new number[];}
		// サイコロの大きさ
		this.size = 30;
		// サイコロの位置
		this.x = 0;
		this.y = 100;
		this.h = 0;
		// サイコロの初期角度
		this.setQuat(this.rotq, Math.random(), Math.random(), Math.random(), Math.random() * Math.PI * 2);
	}

	// ----------------------------------------------------------------
	// クオータニオン作成関数 回転軸と回転角度から回転のクオータニオンを生成する
	function setQuat(quat : number[], x : number, y : number, z : number, rot : number) : void{
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
	function multiQuat(q0 : number[], q1 : number[], q2 : number[]) : void{
		var qax = q1[0]; var qay = q1[1]; var qaz = q1[2]; var qaw = q1[3];
		var qbx = q2[0]; var qby = q2[1]; var qbz = q2[2]; var qbw = q2[3];
		q0[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		q0[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		q0[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		q0[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		for(var i = 0; i < this.pos0.length; i++){
			// クォータニオン回転の適用
			var x = this.pos0[i][0] - 0.5;
			var y = this.pos0[i][1] - 0.5;
			var z = this.pos0[i][2] - 0.5;
			var ix =  this.rotq[3] * x + this.rotq[1] * z - this.rotq[2] * y;
			var iy =  this.rotq[3] * y + this.rotq[2] * x - this.rotq[0] * z;
			var iz =  this.rotq[3] * z + this.rotq[0] * y - this.rotq[1] * x;
			var iw = -this.rotq[0] * x - this.rotq[1] * y - this.rotq[2] * z;
			x = ix * this.rotq[3] - iw * this.rotq[0] - iy * this.rotq[2] + iz * this.rotq[1];
			y = iy * this.rotq[3] - iw * this.rotq[1] - iz * this.rotq[0] + ix * this.rotq[2];
			z = iz * this.rotq[3] - iw * this.rotq[2] - ix * this.rotq[1] + iy * this.rotq[0];
			// サイズと位置
			this.pos1[i][0] = this.size * x + this.x + Ctrl.canvas.width * 0.5;
			this.pos1[i][1] = this.size * y + (this.y - this.h) + Ctrl.canvas.height * 0.5;
			this.pos1[i][2] = this.size * z;
		}

		// 影描画
		Ctrl.context.fillStyle = "rgba(0, 0, 0, 0.5)";
		Ctrl.context.save();
		Ctrl.context.translate(this.x + Ctrl.canvas.width * 0.5, this.y + Ctrl.canvas.height * 0.5 + this.size * 0.5);
		Ctrl.context.scale(1, Ccvs.sinh);
		Ctrl.context.beginPath();
		Ctrl.context.arc(0, 0, this.size, 0, Math.PI*2, false);
		Ctrl.context.fill();
		Ctrl.context.restore();

		// 面描画
		this.drawPolygon(1,  0,  1,  2,  3);
		this.drawPolygon(6,  4,  5,  6,  7);
		this.drawPolygon(2,  8,  9, 10, 11);
		this.drawPolygon(5, 12, 13, 14, 15);
		this.drawPolygon(3, 16, 17, 18, 19);
		this.drawPolygon(4, 20, 21, 22, 23);
		// 頂点の三角形
		this.drawPolygon(0,  0, 13, 23, -1);
		this.drawPolygon(0,  1, 22, 11, -1);
		this.drawPolygon(0,  2, 10, 18, -1);
		this.drawPolygon(0,  3, 17, 14, -1);
		this.drawPolygon(0,  4, 20, 12, -1);
		this.drawPolygon(0,  5, 15, 16, -1);
		this.drawPolygon(0,  6, 19,  9, -1);
		this.drawPolygon(0,  7,  8, 21, -1);
		// 側面の四角形
		this.drawPolygon(0,  1,  0, 23, 22);
		this.drawPolygon(0,  2,  1, 11, 10);
		this.drawPolygon(0,  3,  2, 18, 17);
		this.drawPolygon(0,  0,  3, 14, 13);
		this.drawPolygon(0,  5,  4, 12, 15);
		this.drawPolygon(0,  6,  5, 16, 19);
		this.drawPolygon(0,  7,  6,  9,  8);
		this.drawPolygon(0,  4,  7, 21, 20);
		this.drawPolygon(0, 10,  9, 19, 18);
		this.drawPolygon(0,  8, 11, 22, 21);
		this.drawPolygon(0, 13, 12, 20, 23);
		this.drawPolygon(0, 15, 14, 17, 16);
	}

	// 面を描画する関数
	function drawPolygon(type : int, top0 : int, top1 : int, top2 : int, top3 : int) : void{
		// カリング(隠面消去)
		var x1 = this.pos1[top1][0] - this.pos1[top0][0];
		var y1 = this.pos1[top1][1] - this.pos1[top0][1];
		var x2 = this.pos1[top2][0] - this.pos1[top0][0];
		var y2 = this.pos1[top2][1] - this.pos1[top0][1];
		var cz = x1 * y2 - y1 * x2;
		if(cz < 0){return;}

		if(true){
			// 環境光と反射光
			var z1 = this.pos1[top1][2] - this.pos1[top0][2];
			var z2 = this.pos1[top2][2] - this.pos1[top0][2];
			var cx = y1 * z2 - z1 * y2;
			var cy = z1 * x2 - x1 * z2;
			var cr = Math.sqrt(cx * cx + cy * cy + cz * cz);
			var dot = (cx * 0 + cy * 0.5 + cz * 0.87) / cr;
			var light = Math.min(255, 150 + 200 * dot) as int;
			var color = "rgb(" + light + "," + light + "," + light + ")";
			Ctrl.context.fillStyle = color;
		}else{
			// 面の種類によって色分け
			switch(type){
				case 1: Ctrl.context.fillStyle = "#faa"; break;
				case 2: Ctrl.context.fillStyle = "#afa"; break;
				case 3: Ctrl.context.fillStyle = "#aaf"; break;
				case 4: Ctrl.context.fillStyle = "#aff"; break;
				case 5: Ctrl.context.fillStyle = "#faf"; break;
				case 6: Ctrl.context.fillStyle = "#ffa"; break;
				default: Ctrl.context.fillStyle = "#fff"; break;
			}
		}

		if(type > 0){
			// 面の描画
			// 参考 最速チュパカブラ研究会 2009年2月11日の日記(http://d.hatena.ne.jp/gyuque/20090211)
			var u0 = ((type - 1) % 3) * 32;
			var v0 = (((type - 1) / 3) as int) * 32;
			var u1 = u0 + 0;
			var v1 = v0 + 0;
			var u2 = u0 + 0;
			var v2 = v0 + 32;
			var u3 = u0 + 32;
			var v3 = v0 + 32;
			var uv11 = u2 - u1;
			var uv12 = v2 - v1;
			var uv21 = u3 - u1;
			var uv22 = v3 - v1;
			var det = uv11 * uv22 - uv12 * uv21;
			if (-0.0001 < det && det < 0.0001){return;}
			var	uv11d = uv22 / det;
			var uv22d = uv11 / det;
			var uv12d = -uv12 / det;
			var uv21d = -uv21 / det;
			var t11 = uv11d * x1 + uv12d * x2;
			var t21 = uv11d * y1 + uv12d * y2;
			var t12 = uv21d * x1 + uv22d * x2;
			var t22 = uv21d * y1 + uv22d * y2;
			var t13 = this.pos1[top0][0] - (t11 * u1 + t12 * v1);
			var t23 = this.pos1[top0][1] - (t21 * u1 + t22 * v1);
			var uw0 = u1 < u2 ? u1 : u2; uw0 = uw0 < u3 ? uw0 : u3;
			var uw1 = u1 > u2 ? u1 : u2; uw1 = uw1 > u3 ? uw1 : u3;
			var vh0 = v1 < v2 ? v1 : v2; vh0 = vh0 < v3 ? vh0 : v3;
			var vh1 = v1 > v2 ? v1 : v2; vh1 = vh1 > v3 ? vh1 : v3;
			uw1 = uw1 - uw0;
			vh1 = vh1 - vh0;
			Ctrl.context.save();
			Ctrl.context.beginPath();
			Ctrl.context.moveTo(this.pos1[top0][0], this.pos1[top0][1]);
			Ctrl.context.lineTo(this.pos1[top1][0], this.pos1[top1][1]);
			Ctrl.context.lineTo(this.pos1[top2][0], this.pos1[top2][1]);
			Ctrl.context.lineTo(this.pos1[top3][0], this.pos1[top3][1]);
			Ctrl.context.closePath();
			Ctrl.context.clip();
			Ctrl.context.transform(t11, t21, t12, t22, t13, t23);
			Ctrl.context.fill();
			Ctrl.context.drawImage(this.img, uw0, vh0, uw1, vh1, uw0, vh0, uw1, vh1);
			Ctrl.context.restore();
		}else{
			// 辺と頂点の描画
			Ctrl.context.strokeStyle = "#000";
			Ctrl.context.beginPath();
			Ctrl.context.moveTo(this.pos1[top0][0], this.pos1[top0][1]);
			Ctrl.context.lineTo(this.pos1[top1][0], this.pos1[top1][1]);
			Ctrl.context.lineTo(this.pos1[top2][0], this.pos1[top2][1]);
			if(top3 >= 0){Ctrl.context.lineTo(this.pos1[top3][0], this.pos1[top3][1]);}
			Ctrl.context.closePath();
			Ctrl.context.stroke();
			Ctrl.context.fill();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

