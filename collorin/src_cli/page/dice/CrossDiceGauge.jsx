import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "../core/data/chara/DataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくゲージクラス カートリッジをまたぐクロス要素
class CrossDiceGauge{
	static const _actionMax = 10;

	var lActive : boolean;
	var rActive : boolean;
	var lChara : DataChara;
	var rChara : DataChara;

	var _currentLchara : DataChara;
	var _currentRchara : DataChara;
	var _lShow : boolean;
	var _rShow : boolean;
	var _lAction = CrossDiceGauge._actionMax;
	var _rAction = CrossDiceGauge._actionMax;
	var _lFrame : int;
	var _rFrame : int;

	var _rhp : number;
	var _rsp : number;
	var _lhp : number;
	var _lsp : number;

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		this.lActive = false;
		this.rActive = false;

		// 展開処理
		if(this._lAction > 0 || (0 > this._lAction && this._lShow)){this._lAction++;}
		if(this._rAction > 0 || (0 > this._rAction && this._rShow)){this._rAction++;}
		if(this._lAction == 0 && this._lFrame > 0 && --this._lFrame == 0){this.setLeft(null, 0);}
		if(this._rAction == 0 && this._rFrame > 0 && --this._rFrame == 0){this.setRight(null, 0);}
		if(this._lAction > CrossDiceGauge._actionMax){this._lAction = -CrossDiceGauge._actionMax;}
		if(this._rAction > CrossDiceGauge._actionMax){this._rAction = -CrossDiceGauge._actionMax;}
		if(this._lAction == -CrossDiceGauge._actionMax){this._lToggle();}
		if(this._rAction == -CrossDiceGauge._actionMax){this._rToggle();}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		var lmx = -50 * Math.abs(this._lAction / CrossDiceGauge._actionMax);
		var rmx = -50 * Math.abs(this._rAction / CrossDiceGauge._actionMax);

		// 表示関数
		var drawGauge = function(active : boolean, chara : DataChara, hp : number, sp : number) : void{
			Ctrl.sctx.fillStyle = active ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";
			Ctrl.sctx.fillRect(0, 0, 50, 50);
			Ctrl.sctx.drawImage(Loader.imgs["img_chara_icon_" + chara.code], 0, 0, 50, 50);
			// ゲージ土台
			Ctrl.sctx.fillStyle = "#ffffff";
			Ctrl.sctx.fillRect(0, 55, 50, 10);
			Ctrl.sctx.fillRect(0, 70, 50, 10);
			Ctrl.sctx.fillStyle = "#cccccc";
			Ctrl.sctx.fillRect(2, 57, 46, 6);
			Ctrl.sctx.fillRect(2, 72, 46, 6);
			// HPゲージ
			Ctrl.sctx.fillStyle = "#ff6666";
			Ctrl.sctx.fillRect(2, 57, Math.max(0, Math.min(1, (Math.max(chara.hp, hp) / chara.maxhp))) * 46, 6);
			Ctrl.sctx.fillStyle = "#ff0000";
			Ctrl.sctx.fillRect(2, 57, Math.max(0, Math.min(1, (Math.min(chara.hp, hp) / chara.maxhp))) * 46, 6);
			// SPゲージ
			Ctrl.sctx.fillStyle = "#6666ff";
			Ctrl.sctx.fillRect(2, 72, Math.max(0, Math.min(1, (Math.max(chara.sp, sp) / chara.maxsp))) * 46, 6);
			Ctrl.sctx.fillStyle = "#0000ff";
			Ctrl.sctx.fillRect(2, 72, Math.max(0, Math.min(1, (Math.min(chara.sp, sp) / chara.maxsp))) * 46, 6);
		};

		// 左表示
		if(this._currentLchara != null){
			Ctrl.sctx.save();
			Ctrl.sctx.translate(lmx, 0);
			drawGauge(this.lActive, this._currentLchara, this._lhp, this._lsp);
			Ctrl.sctx.restore();
			this._lhp -= (this._lhp - this._currentLchara.hp) * 0.1;
			this._lsp -= (this._lsp - this._currentLchara.sp) * 0.1;
		}

		// 右表示
		if(this._currentRchara != null){
			Ctrl.sctx.save();
			Ctrl.sctx.translate(Ctrl.screen.w - 50 - rmx + 25, 0);
			Ctrl.sctx.scale(-1, 1);
			Ctrl.sctx.translate(-25, 0);
			drawGauge(this.rActive, this._currentRchara, this._rhp, this._rsp);
			Ctrl.sctx.restore();
			this._rhp -= (this._rhp - this._currentRchara.hp) * 0.1;
			this._rsp -= (this._rsp - this._currentRchara.sp) * 0.1;
		}
	}

	// ----------------------------------------------------------------
	// 左表示設定
	function setLeft(chara : DataChara, frame : int) : void{
		if(this.lChara != chara){
			this.lChara = chara;
			this._lAction = (this._lAction == 0) ? 1 : Math.abs(this._lAction);
		}
		this._lShow = (this.lChara != null);
		this._lFrame = frame;

		// 左右での重複を防ぐ
		if(this._lShow && this.lChara == this.rChara){this.setRight(null, 0);}

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._lAction = this._lShow ? 0 : CrossDiceGauge._actionMax;
			this._lToggle();
		}
	}


	// ----------------------------------------------------------------
	// 右表示設定
	function setRight(chara : DataChara, frame : int) : void{
		if(this.rChara != chara){
			this.rChara = chara;
			this._rAction = (this._rAction == 0) ? 1 : Math.abs(this._rAction);
		}
		this._rShow = (this.rChara != null);
		this._rFrame = frame;

		// 左右での重複を防ぐ
		if(this._rShow && this.rChara == this.lChara){this.setLeft(null, 0);}

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._rAction = this._rShow ? 0 : CrossDiceGauge._actionMax;
			this._rToggle();
		}
	}

	// ----------------------------------------------------------------
	// 左切り替え
	function _lToggle() : void{
		if(!this._lShow){return;}
		if(this._currentLchara != this.lChara){
			this._currentLchara = this.lChara;
			this._lhp = this.lChara.hp;
			this._lsp = this.lChara.sp;
		}
	}

	// ----------------------------------------------------------------
	// 右切り替え
	function _rToggle() : void{
		if(!this._rShow){return;}
		if(this._currentRchara != this.rChara){
			this._currentRchara = this.rChara;
			this._rhp = this.rChara.hp;
			this._rsp = this.rChara.sp;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

