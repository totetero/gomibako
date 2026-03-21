
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import * as React from "react";

// 情報構造体
interface ComponentViewPage02Props extends React.Props<any>{
}

// 状態構造体
interface ComponentViewPage02State{
}

// コンポーネント
export default class ComponentViewPage02 extends React.Component<ComponentViewPage02Props, ComponentViewPage02State>{
	// プロパティ初期値
	static defaultProps: ComponentViewPage02Props = {
	};

	// コンストラクタ
	constructor(props: ComponentViewPage02Props){
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
			}}>page02</div>
		);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

