class CharacterDrawInfo{
	var weapon : string;
	var parts : Map.<number[][]>;
	var pose : Map.<Map.<number[]>[]>;
	// コンストラクタ
	function constructor(dat : variant) {
		this.weapon = dat["weapon"] as string;
		this.parts  = dat["parts"] as Map.<number[][]>;
		this.pose  = dat["pose"] as Map.<Map.<number[]>[]>;
    }

	static var data : Map.<CharacterDrawInfo> = {} : Map.<CharacterDrawInfo>;
	static function init() : void{
		// ----------------------------------------------------------------
		// 人間型キャラクター情報
		CharacterDrawInfo.data["human"] = new CharacterDrawInfo({
			"weapon": "whiteSword",
			"parts": {
				"head": [
					[  0.00,  0.00,  0.00,  0,  0, 16, 0],
					[ -0.06,  0.20, -0.02,  0, 48, 16, 0],
					[ -0.06, -0.20, -0.02,  0, 48, 16, 1],
					[ -0.19,  0.00, -0.09,  0, 64, 16, 0],
					[ -0.16,  0.00,  0.08,  0, 80, 16, 0],
				],
				"body": [[ 0.00, 0.00, 0.00,  0, 16, 16, 0]],
				"ftr1": [[ 0.00, 0.00, 0.00,  0, 32,  8, 0]],
				"ftl1": [[ 0.00, 0.00, 0.00,  0, 32,  8, 1]],
				"ftr2": [[ 0.00, 0.00, 0.00, 32, 32,  8, 0]],
				"ftl2": [[ 0.00, 0.00, 0.00, 32, 32,  8, 1]],
				"hndr": [[ 0.00, 0.00, 0.00,  0, 40,  8, 0]],
				"hndl": [[ 0.00, 0.00, 0.00,  0, 40,  8, 1]],
			},
			"pose": {
				"stand": [
					{
						"head": [1,  0.00,  0.00,  0.52, 45 * 0],
						"body": [1, -0.02,  0.00,  0.27, 0],
						"ftr1": [1,  0.02,  0.10,  0.10, 0],
						"ftl1": [1, -0.02, -0.10,  0.10, 0],
						"hndr": [0, -0.02,  0.20,  0.25, 0],
						"hndl": [0,  0.02, -0.20,  0.25, 0],
					},
				],
				"walk": [
					{
						"head": [1,  0.12,  0.00,  0.45, 0],
						"body": [1,  0.00,  0.00,  0.23, 0],
						"ftr1": [1,  0.10,  0.07,  0.10, 0],
						"ftl2": [1, -0.20, -0.07,  0.20, 0],
						"hndr": [0, -0.10,  0.15,  0.25, 0],
						"hndl": [0,  0.10, -0.15,  0.25, 0],
					},{
						"head": [1,  0.12,  0.00,  0.47, 0],
						"body": [1,  0.00,  0.00,  0.26, 0],
						"ftr1": [1,  0.00,  0.07,  0.10, 0],
						"ftl1": [1,  0.00, -0.07,  0.15, 0],
						"hndr": [0, -0.05,  0.18,  0.25, 0],
						"hndl": [0,  0.05, -0.18,  0.25, 0],
					},{
						"head": [1,  0.12,  0.00,  0.45, 0],
						"body": [1,  0.00,  0.00,  0.23, 0],
						"ftr2": [1, -0.20,  0.07,  0.20, 0],
						"ftl1": [1,  0.10, -0.07,  0.10, 0],
						"hndr": [0,  0.10,  0.15,  0.25, 0],
						"hndl": [0, -0.10, -0.15,  0.25, 0],
					},{
						"head": [1,  0.12,  0.00,  0.47, 0],
						"body": [1,  0.00,  0.00,  0.26, 0],
						"ftr1": [1,  0.00,  0.07,  0.15, 0],
						"ftl1": [1,  0.00, -0.07,  0.10, 0],
						"hndr": [0,  0.05,  0.18,  0.25, 0],
						"hndl": [0, -0.05, -0.18,  0.25, 0],
					},
				],
				"dive": [
					{
						"head": [1,  0.12,  0.00,  0.30, 0],
						"body": [1, -0.02,  0.00,  0.20, 0],
						"ftr2": [1, -0.18,  0.07,  0.10, 0],
						"ftl2": [1, -0.18, -0.07,  0.10, 0],
						"hndr": [0,  0.20,  0.13,  0.17, 0],
						"hndl": [0,  0.20, -0.13,  0.17, 0],
					},
				],
				"roll": [
					{
						"head": [3, -0.06,  0.00,  0.22, 0],
						"body": [3,  0.02,  0.00,  0.45, 0],
						"ftr2": [4, -0.14,  0.07,  0.50, 0],
						"ftl2": [4, -0.14, -0.07,  0.50, 0],
						"hndr": [0, -0.12,  0.15,  0.50, 0],
						"hndl": [0, -0.12, -0.15,  0.50, 0],
					},{
						"head": [1,  0.06,  0.00,  0.38, 0],
						"body": [1, -0.02,  0.00,  0.15, 0],
						"ftr2": [2,  0.14,  0.07,  0.10, 0],
						"ftl2": [2,  0.14, -0.07,  0.10, 0],
						"hndr": [0,  0.12,  0.15,  0.10, 0],
						"hndl": [0,  0.12, -0.15,  0.10, 0],
					},
				],
				"attack1": [
					{
						"head": [1,  0.00,  0.00,  0.55, 0],
						"body": [1, -0.02,  0.00,  0.30, 0],
						"ftr1": [1,  0.00,  0.10,  0.10, 0],
						"ftl1": [1,  0.00, -0.10,  0.12, 0],
						"hndr": [0,  0.08, -0.05,  0.28, 0],
						"hndl": [0,  0.00, -0.20,  0.28, 0],
					},{
						"head": [1,  0.00,  0.00,  0.55, 0],
						"body": [1, -0.02,  0.00,  0.30, 0],
						"ftr1": [1,  0.00,  0.10,  0.10, 0],
						"ftl1": [1,  0.00, -0.10,  0.12, 0],
						"hndr": [0,  0.08, -0.05,  0.28, 0],
						"hndl": [0,  0.00, -0.20,  0.28, 0],
					},{
						"head": [1,  0.03,  0.00,  0.53, 0],
						"body": [1, -0.01,  0.00,  0.28, 0],
						"ftr1": [1, -0.02,  0.10,  0.10, 0],
						"ftl1": [1,  0.02, -0.10,  0.15, 0],
						"hndr": [0,  0.06, -0.08,  0.26, 0],
						"hndl": [0,  0.00, -0.20,  0.26, 0],
						"weapon": [0, 0.6, 0, 0.25, 0],
					},{
						"head": [1,  0.05,  0.00,  0.51, 0],
						"body": [1,  0.01,  0.00,  0.26, 0],
						"ftr1": [1, -0.04,  0.09,  0.10, 0],
						"ftl1": [1,  0.04, -0.09,  0.15, 0],
						"hndr": [0,  0.08, -0.05,  0.24, 0],
						"hndl": [0,  0.00, -0.20,  0.24, 0],
						"weapon": [1, 0.6, 0, 0.25, 0],
					},{
						"head": [1,  0.08,  0.00,  0.50, 0],
						"body": [1,  0.03,  0.00,  0.25, 0],
						"ftr1": [1, -0.08,  0.08,  0.10, 0],
						"ftl1": [1,  0.08, -0.08,  0.10, 0],
						"hndr": [0,  0.12,  0.15,  0.23, 0],
						"hndl": [0,  0.00, -0.20,  0.23, 0],
						"weapon": [2, 0.6, 0, 0.25, 0],
					},{
						"head": [1,  0.08,  0.00,  0.50, 0],
						"body": [1,  0.03,  0.00,  0.25, 0],
						"ftr1": [1, -0.08,  0.08,  0.10, 0],
						"ftl1": [1,  0.08, -0.08,  0.10, 0],
						"hndr": [0,  0.12,  0.15,  0.23, 0],
						"hndl": [0,  0.00, -0.20,  0.23, 0],
						"weapon": [2, 0.6, 0, 0.25, 0],
					},
				],
				"attack2": [
					{
						"head": [1,  0.08,  0.00,  0.50, 0],
						"body": [1,  0.03,  0.00,  0.25, 0],
						"ftr1": [1, -0.08,  0.08,  0.10, 0],
						"ftl1": [1,  0.08, -0.08,  0.10, 0],
						"hndr": [0,  0.08,  0.20,  0.23, 0],
						"hndl": [0,  0.00, -0.20,  0.23, 0],
						"weapon": [3, 0.6, 0, 0.25, 0],
					},{
						"head": [1,  0.08,  0.00,  0.50, 0],
						"body": [1,  0.03,  0.00,  0.25, 0],
						"ftr1": [1, -0.08,  0.08,  0.10, 0],
						"ftl1": [1,  0.08, -0.08,  0.10, 0],
						"hndr": [0,  0.08,  0.20,  0.23, 0],
						"hndl": [0,  0.00, -0.20,  0.23, 0],
						"weapon": [3, 0.6, 0, 0.25, 0],
					},{
						"head": [1,  0.08,  0.00,  0.50, 0],
						"body": [1,  0.03,  0.00,  0.25, 0],
						"ftr1": [1, -0.08,  0.08,  0.10, 0],
						"ftl1": [1,  0.08, -0.08,  0.10, 0],
						"hndr": [0,  0.08,  0.20,  0.23, 0],
						"hndl": [0,  0.00, -0.20,  0.23, 0],
						"weapon": [3, 0.6, 0, 0.25, 0],
					},
				],
				"damage": [
					{
						"head": [1,  0.00,  0.00,  0.45 + 0.25, 0],
						"body": [1, -0.02,  0.00,  0.20 + 0.25, 0],
						"ftr2": [2,  0.12,  0.10,  0.10 + 0.25, 0],
						"ftl2": [2,  0.12, -0.10,  0.10 + 0.25, 0],
						"hndr": [0,  0.02,  0.20,  0.28 + 0.25, 0],
						"hndl": [0,  0.02, -0.20,  0.28 + 0.25, 0],
					},{
						"head": [1,  0.00,  0.00,  0.45 + 0.3, 0],
						"body": [1, -0.02,  0.00,  0.20 + 0.3, 0],
						"ftr2": [2,  0.12,  0.10,  0.10 + 0.3, 0],
						"ftl2": [2,  0.12, -0.10,  0.10 + 0.3, 0],
						"hndr": [0,  0.02,  0.20,  0.28 + 0.3, 0],
						"hndl": [0,  0.02, -0.20,  0.28 + 0.3, 0],
					},{
						"head": [1,  0.00,  0.00,  0.45 + 0.25, 0],
						"body": [1, -0.02,  0.00,  0.20 + 0.25, 0],
						"ftr2": [2,  0.12,  0.10,  0.10 + 0.25, 0],
						"ftl2": [2,  0.12, -0.10,  0.10 + 0.25, 0],
						"hndr": [0,  0.02,  0.20,  0.28 + 0.25, 0],
						"hndl": [0,  0.02, -0.20,  0.28 + 0.25, 0],
					},{
						"head": [1,  0.00,  0.00,  0.45 + 0.1, 0],
						"body": [1, -0.02,  0.00,  0.20 + 0.1, 0],
						"ftr2": [2,  0.12,  0.10,  0.10 + 0.1, 0],
						"ftl2": [2,  0.12, -0.10,  0.10 + 0.1, 0],
						"hndr": [0,  0.02,  0.20,  0.28 + 0.1, 0],
						"hndl": [0,  0.02, -0.20,  0.28 + 0.1, 0],
					},{
						"head": [1,  0.00,  0.00,  0.45, 0],
						"body": [1, -0.02,  0.00,  0.20, 0],
						"ftr2": [2,  0.12,  0.10,  0.10, 0],
						"ftl2": [2,  0.12, -0.10,  0.10, 0],
						"hndr": [0,  0.02,  0.20,  0.28, 0],
						"hndl": [0,  0.02, -0.20,  0.28, 0],
					},{
						"head": [1,  0.12,  0.00,  0.43, 0],
						"body": [1, -0.02,  0.00,  0.22, 0],
						"ftr1": [1, -0.02,  0.10,  0.10, 0],
						"ftl1": [1, -0.02, -0.10,  0.10, 0],
						"hndr": [0,  0.05,  0.18,  0.25, 0],
						"hndl": [0,  0.05, -0.18,  0.25, 0],
					},{
						"head": [1,  0.12,  0.00,  0.43, 0],
						"body": [1, -0.02,  0.00,  0.22, 0],
						"ftr1": [1, -0.02,  0.10,  0.10, 0],
						"ftl1": [1, -0.02, -0.10,  0.10, 0],
						"hndr": [0,  0.05,  0.18,  0.25, 0],
						"hndl": [0,  0.05, -0.18,  0.25, 0],
					},{
						"head": [1,  0.12,  0.00,  0.43, 0],
						"body": [1, -0.02,  0.00,  0.22, 0],
						"ftr1": [1, -0.02,  0.10,  0.10, 0],
						"ftl1": [1, -0.02, -0.10,  0.10, 0],
						"hndr": [0,  0.05,  0.18,  0.25, 0],
						"hndl": [0,  0.05, -0.18,  0.25, 0],
					},{
						"head": [1,  0.12,  0.00,  0.43, 0],
						"body": [1, -0.02,  0.00,  0.22, 0],
						"ftr1": [1, -0.02,  0.10,  0.10, 0],
						"ftl1": [1, -0.02, -0.10,  0.10, 0],
						"hndr": [0,  0.05,  0.18,  0.25, 0],
						"hndl": [0,  0.05, -0.18,  0.25, 0],
					},
				],
			}
		});
		// ----------------------------------------------------------------
	}
}

