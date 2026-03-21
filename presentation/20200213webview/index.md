# iOSのwebViewで<br>カメラを<br>動かしたかった話

勉三さん

---

# 自己紹介

## 勉三さん

>>>

#### 自己紹介

## やっていること

- 子育て
- フロントエンド

>>>

#### 自己紹介

## 趣味

- プラレールショップ
- ゲームプログラミング

---

# 目的

- アプリ版の開発の話が出始めた大昔

- webブラウザ用に作ったものが<br>アプリでそのまま動けば楽だ！

- iOSとAndroidのwebViewで<br>&lt;プロジェクト&gt;を動かしたい

- **&lt;プロジェクト&gt;のために<br>webViewでカメラを使いたい**

---

でも

# できない

iOSのwebViewではカメラ撮影が出来ない

```javascript
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: false,
}).then(stream => {
	document.getElementById("testVideo").srcObject = stream;
});
```

上図はjsでカメラを使う関数

---

# どうしよう

ブラウザからカメラが使えないのならば

ネイティブのカメラを使うしかない

>>>

#### どうしよう

## 方針

- ネイティブのカメラを使う
- 撮影したデータをwebViewのjavascriptに送る
- 受け取ったデータをブラウザで表示する

>>>

#### どうしよう

## 方針に対する課題

#### 重い画像データをいかにして受け取るか

ネイティブのコードとwebViewのjavascriptでデータをやり取りするのは時間がかかる

---

本日はこの課題に対して<br>個人的に試行錯誤して失敗した話をします

---

# 試行1

## ネイティブのカメラで<br>撮影したデータを<br>文字列にして<br>webViewに送る

>>>

#### 試行1 文字列

- カメラで撮影したデータをbase64にする
- webViewのevaluateJavaScript関数で<br>js関数の引数を通じてwebViewに送る
- 受け取ったbase64をimg要素のsrcに入れる
- img要素をcanvasに描画する

```swift
private func shutterSend(_ base64: String) -> Void {
	guard let webView: WKWebView = self.webView  else { return }
	let format: String = "window.shutter('data:image/png;base64,%@');"
	let script: String = String(format: format, base64)
	webView.evaluateJavaScript(script)
}
```

上図はswiftの関数でwindow.shutterはjsの関数

>>>

#### 試行1 文字列

## 結果

送れたけど重い 1fpsも辛い

- 画像データを**base64**にして
- **evaluateJavaScript**を使って
- base64を**img**にして
- imgを**canvas**にして

---

# 試行2

## ネイティブのカメラで<br>撮影したデータを<br>MediaStreamにして<br>webViewに送る

>>>

#### 試行2 MediaStream

```javascript
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: false,
}).then(stream => {
	document.getElementById("testVideo").srcObject = stream;
});
```

上図はjsでカメラを使う関数

getUserMediaの代わりとなる関数を作成して<br>返値のMediaStreamオブジェクトを<br>ネイティブで作成できないか

>>>

#### 試行2 MediaStream

TODO<br>時間があれば<br>MediaStreamについて調べた結果を書く

>>>

#### 試行2 MediaStream

## 結果

google先生に聞き、<br>MediaStreamオブジェクトの形式を調べ、

**できなそう**

そのようなインターフェイスは<br>webViewには用意されていないっぽい

理解が追いつかなかった

---

# 試行3

## ネイティブのカメラで<br>撮影したデータを<br>webGLのコンテキスト経由で<br>webViewに送る

>>>

#### 試行3 webGL

```javascript
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
```

```javascript
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
```

上図はjsのwebGLで「テクスチャを作る関数」と<br>「テクスチャを上書きする関数」

基本は画像データをネイティブから<br>webViewに渡してテクスチャを上書きする

テクスチャを上書きする際に変数textureを使う

>>>

#### 試行3 webGL

ネイティブでテクスチャを上書きできれば<br>ネイティブからwebViewに渡すコストがなくなる

変数textureをネイティブに渡し、<br>ネイティブでテクスチャを<br>上書きすることはできないか

>>>

#### 試行3 webGL

## 結果

セキュリティの問題でできない気がする

iOSのwebGLは内部でMetalを使ってうんぬん

(思いついた瞬間は良いアイデアだと思った)

---

# 試行4

## ネイティブのカメラで<br>撮影したデータを<br>webViewの背景にする

>>>

#### 試行4 背景

- ネイティブのカメラviewの上に<br>webViewを配置する
- webViewの背景を透明にする

>>>

#### 試行4 背景

## 結果

できた

位置調整が難しいデメリットがある

&lt;プロジェクト&gt;をそのまま使うことはできず、<br>コードの修正が必要になる

画像をwebViewに送ることはできるが、<br>動画は表示するだけ。

あまりエレガントではない気がする

---

# 色々試した結果

webViewでも&lt;プロジェクト&gt;を使えなくもないが<br>
優秀なアプリエンジニアが続々入社したので<br>
webViewを使った手抜きをする必要がなくなった
