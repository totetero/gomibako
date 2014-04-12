import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/PartsScroll.jsx";
import "../core/PartsCharacter.jsx";
import "../core/SECload.jsx";
import "../core/SECpopupMenu.jsx";
import "../core/SECpopupPicker.jsx";
import "../core/SECpopupCharacterPicker.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabTeam extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div class="scrollContainerContainer">
			<div class="scrollContainer">
				<div class="scroll">
					<div class="core-btn test">テスト</div>
					<div style="width:230px;margin:20px;margin-top:52px;font-size:12px;">
						•編成について<br>
						マイページで表示するリーダーの設定と、
						ステージで使用する3人までのチームを設定することができる。
						<br><br>
						•補給について<br>
						補給タブではSP回復アイテムを消費することによってSPを回復することができる。
						SPはステージで行動すると消費する値であり、消費量はキャラクターやステージによって異なる。
						SP回復アイテムは時間経過で入手することができ、いわゆるスタミナの役割を果たす。
						SP回復アイテムはショップでも購入できる。
					</div>
				</div>
				<div class="core-ybar"></div>
			</div>
		</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var charaList : PartsCharaListItem[];
	var sortPicker : SECpopupPicker;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, response : variant){
		this._page = page;
		this.parse(response);

		// キャラクターリスト作成
		var list = response["list"] as variant[];
		this.charaList = new PartsCharaListItem[];
		for(var i = 0; i < list.length; i++){
			this.charaList.push(new PartsCharaListItem(list[i]));
		}

		// 並べ替え要素作成
		this.sortPicker = new SECpopupPicker("並べ替え", [
			new SECpopupPickerItem("test1", "新着順"),
			new SECpopupPickerItem("test2", "Lv順"),
			new SECpopupPickerItem("test3", "atk順"),
			new SECpopupPickerItem("test4", "grd順"),
			new SECpopupPickerItem("test5", "luk順"),
		]);
		this.sortPicker.getItem("test1").selected = true;
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function parse(response : variant) : void{
		log response;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		if(this._page.bodyDiv.innerHTML == ""){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = SECcharaTabTeam._htmlTag;
			this._page.bodyDiv.className = "body team";

			this._scroller = null;
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["team"] = new PartsButton(this._page.tabTeamDiv, true);
		this._btnList["supp"] = new PartsButton(this._page.tabSuppDiv, true);
		this._btnList["rest"] = new PartsButton(this._page.tabRestDiv, true);
		this._btnList["pwup"] = new PartsButton(this._page.tabPwupDiv, true);
		this._btnList["sell"] = new PartsButton(this._page.tabSellDiv, true);

		// スクロール作成
		if(this._scroller == null){
			this._scroller = new PartsScroll(
				this._page.bodyDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement,
				this._page.bodyDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement,
				null,
				this._page.bodyDiv.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
			);
		}
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		this._scroller.btnList["test"] = new PartsButton(this._page.bodyDiv.getElementsByClassName("core-btn test").item(0) as HTMLDivElement, true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// テストボタン
		if(this._scroller.btnList["test"].trigger){
			Sound.playSE("ok");
			// TODO 選択できないキャラクターはthis._charaListのselectフラグ？
			this._page.serialPush(new SECcharaTabTeamPopupCharacterPicker(this._page, this, "テスト"));
			return false;
		}

		// タブボタン
		if(this._btnList["supp"].trigger){Sound.playSE("ok"); this._page.toggleTab("supp"); return false;}
		if(this._btnList["rest"].trigger){Sound.playSE("ok"); this._page.toggleTab("rest"); return false;}
		if(this._btnList["pwup"].trigger){Sound.playSE("ok"); this._page.toggleTab("pwup"); return false;}
		if(this._btnList["sell"].trigger){Sound.playSE("ok"); this._page.toggleTab("sell"); return false;}

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){Sound.playSE("ok"); this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){Sound.playSE("ng"); Page.transitionsPage("mypage");}

		return true;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabTeamPopupCharacterPicker extends SECpopupCharacterPicker{
	var _cPage : CharaPage;
	var _parent : SECcharaTabTeam;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, cartridge : SECcharaTabTeam, title : string){
		super(page, cartridge, title, cartridge.charaList, cartridge.sortPicker);
		this._cPage = page;
		this._parent = cartridge;
	}

	// ----------------------------------------------------------------
	// 選択時の動作 継承用
	override function onSelect(chara : PartsCharaListItem) : void{
		// テスト とりあえず通信
		this._cPage.serialPush(new SECload("/chara/team", null, function(response : variant) : void{this._parent.parse(response);}));
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

