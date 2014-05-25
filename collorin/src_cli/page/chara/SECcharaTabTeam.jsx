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

import "../core/data/DataChara.jsx";
import "../core/data/PartsButtonDataChara.jsx";
import "../core/data/SECpopupDataChara.jsx";
import "../core/data/SECpopupDataCharaPicker.jsx";
import "../core/popup/SECpopupPicker.jsx";
import "../core/popup/SECpopupTextarea.jsx";
import "PageChara.jsx";
import "SECcharaTab.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター編成タブカートリッジ
class SECcharaTabTeam extends SECcharaTab{
	var _scroller : PartsScroll;
	var _charaList : PartsButtonDataChara[];
	var _sortPicker : SECpopupPicker;

	// パートナーデータ
	var _partner : PartsButtonDataChara;
	// チームデータ
	var _teams = new SECcharaTabTeam._Team[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChara, response : variant){
		super(page, "team");
		this.parse(response);

		// ピッカー作成
		this._sortPicker = new SECpopupPicker(this.page, null, "並べ替え", [
			new SECpopupPickerItem("level", "レベル順"),
			new SECpopupPickerItem("team", "チーム順"),
			new SECpopupPickerItem("favorite", "ファボ順"),
			new SECpopupPickerItem("type", "種類順"),
			new SECpopupPickerItem("new", "新着順"),
		]);
		this._sortPicker.setSelectedItem("level");
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function parse(response : variant) : void{
		// キャラクターリスト作成
		var list = response["list"] as variant[];
		if(list != null){
			this._charaList = new PartsButtonDataChara[];
			for(var i = 0; i < list.length; i++){
				this._charaList.push(new PartsButtonDataChara(0, 0, list[i]));
			}
		}

		// パートナーアイコンとチームアイコンリセット
		for(var i = 0; i < this._charaList.length; i++){
			var chara = this._charaList[i];
			chara.partner = false;
			chara.sortTeam = 65535;
		}

		// パートナーデータ読み取り
		var partnerId = response["partner"] as string;
		for(var i = 0; i < this._charaList.length; i++){
			if(this._charaList[i].data.id == partnerId){
				this._partner = new PartsButtonDataChara(this._charaList[i]);
				this._partner.basey = 40;
				this._partner.partner = false;
				this._partner.sortTeam = 0;
				// キャラクターリストのパートナーアイコン設定
				this._charaList[i].partner = true;
				break;
			}
		}

		// チームデータ読み取り
		var teams = response["teams"] as variant[];
		for(var i = 0; i < teams.length; i++){
			var team = new SECcharaTabTeam._Team();
			team.id = teams[i]["id"] as string;
			team.name = new SECcharaPopupTabTeamName(this.page, this, teams[i]["name"] as string);
			team.lock = teams[i]["lock"] as boolean;
			var memberIds = teams[i]["members"] as string[];
			for(var j = 0; j < memberIds.length; j++){
				var member : PartsButtonDataChara = null;
				for(var k = 0; k < this._charaList.length; k++){
					if(this._charaList[k].data.id == memberIds[j]){
						member = new PartsButtonDataChara(this._charaList[k]);
						member.partner = (this._partner.data == member.data);
						member.sortTeam = 65535;
						// キャラクターリストのチームアイコン設定
						var sortTeam = (i + 1) * 128 + k;
						this._charaList[k].sortTeam = sortTeam;
						// パートナーのチームアイコン設定
						if(member.partner){this._partner.sortTeam = sortTeam;}
						break;
					}
				}
				if(member == null){member = new PartsButtonDataChara(0, 0);}
				team.members[j] = member;
			}
			this._teams.push(team);
		}

		// スクローラ作成
		this._scroller = new PartsScroll(SECcharaTab.tabWidth, 50, 0, 0, 0, 0);
		// ラベル設定
		this._scroller.labList["partner"] = new PartsLabel("パートナー", 40, 10, 150, 20);
		this._scroller.labList["partner"].setAlign("left");
		// ボタン作成
		this._scroller.btnList["pbox"] = this._partner;
		this._scroller.btnList["face0"] = this._partner.faceBtn;
		for(var i = 0; i < this._teams.length; i++){
			this._scroller.btnList["t" + i + "name"] = this._teams[i].name.createButton(40, 0, 160, 24);
			for(var j = 0; j < this._teams[i].members.length; j++){
				var member = this._teams[i].members[j];
				this._scroller.btnList["t" + i + "m" + j + "box"] = member;
				if(member.data != null){this._scroller.btnList["t" + i + "m" + j + "face"] = member.faceBtn;}
			}
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		super.init();
		// トリガーリセット
		for(var name in this._scroller.btnList){this._scroller.btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function tabCalc() : boolean{
		this._scroller.calc(true);

		// test
		if(this._partner.trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECpopupDataCharaPicker(this.page, this, "test", this._charaList, this._sortPicker, false));
			return false;
		}

		// パートナー情報ポップアップボタン処理
		if(this._partner.faceBtn.trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECpopupDataChara(this.page, this, this._partner.data));
			return false;
		}

		// チームメンバーボタン処理
		for(var i = 0; i < this._teams.length; i++){
			for(var j = 0; j < this._teams[i].members.length; j++){
				var member = this._teams[i].members[j];

				// メンバー情報ポップアップ
				if(member.data != null && member.faceBtn.trigger){
					Sound.playSE("ok");
					this.page.serialPush(new SECpopupDataChara(this.page, this, member.data));
					return false;
				}
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function tabDraw() : void{
		// ウインドウサイズに対する位置調整
		this._scroller.cw = Ctrl.screen.w - SECcharaTab.tabWidth;
		this._scroller.ch = Ctrl.screen.h - 50;
		var rowNum = Math.floor((this._scroller.cw - 10) / (this._partner.w + 10));
		var colNum = 4 - rowNum;
		var teamHeight = 2 + 44 + 70 * colNum;
		var cx = (this._scroller.cw - ((this._partner.w + 10) * rowNum - 10)) * 0.5;
		this._scroller.sh = 110 + teamHeight * this._teams.length;
		// パートナー位置調整
		this._partner.basex = cx;
		for(var i = 0; i < this._teams.length; i++){
			// チーム名位置調整
			this._scroller.btnList["t" + i + "name"].basey = 110 + 2 + 10 + teamHeight * i;
			for(var j = 0; j < this._teams[i].members.length; j++){
				// チームメンバー位置調整
				var member = this._teams[i].members[j];
				member.basex = cx + (this._partner.w + 10) * (j % rowNum);
				member.basey = 110 + 2 + 44 + 70 * Math.floor(j / rowNum) + teamHeight * i;
			}
		}

		// スクローラー描画
		this._scroller.draw(function() : void{
			// パートナーマーク
			var img = Loader.imgs["img_system_character_partner"];
			if(this._scroller.isDrawClip(10, 10, 20, 20)){Ctrl.sctx.drawImage(img, 10, 10, 20, 20);}

			Ctrl.sctx.fillStyle = "black";
			for(var i = 0; i < this._teams.length; i++){
				// 区切り線
				var y = 110 + teamHeight * i;
				var w = this._scroller.cw - 20;
				if(this._scroller.isDrawClip(10, y, w, 2)){Ctrl.sctx.fillRect(10, y, w, 2);}
				// チームマーク
				var y = 110 + 2 + 10 + 2 + teamHeight * i;
				var img = Loader.imgs["img_system_character_team" + (i + 1)];
				if(img != null && this._scroller.isDrawClip(10, y, 20, 20)){Ctrl.sctx.drawImage(img, 10, y, 20, 20);}
			}
		}, SECcharaTab.tabWidth, 0, Ctrl.screen.w - SECcharaTab.tabWidth, Ctrl.screen.h);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}

	// ----------------------------------------------------------------
	// チームデータクラス
	class _Team{
		var id : string;
		var lock : boolean;
		var name : SECcharaPopupTabTeamName;
		var members = new PartsButtonDataChara[];
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チーム名変更のテキストエリア
class SECcharaPopupTabTeamName extends SECpopupTextarea{
	var _prevName : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, name : string){
		super(page, cartridge, "チーム名", 16);
		this.setValue(name);
		this._prevName = name;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		if(value != this._prevName){
			//this.page.serialPush(new SECload(this, "/setting?comment=" + value, null, function(response : variant) : void{
			//	this._parse(response);
			//}));
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

