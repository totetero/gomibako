
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";

// 情報構造体
interface ComponentViewPage03Props extends React.Props<any>{
}

// 状態構造体
interface ComponentViewPage03State{
}

// コンポーネント
export default class ComponentViewPage03 extends React.Component<ComponentViewPage03Props, ComponentViewPage03State>{
	// プロパティ初期値
	static defaultProps: ComponentViewPage03Props = {
	};

	// コンストラクタ
	constructor(props: ComponentViewPage03Props){
		super(props);
		// 状態設定
		this.state = {
		};
	}

	// レンダー
	public render(): JSX.Element{
		return(
			<div style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				width: "100%",
				height: "100%",
			}}>page03</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

