#!/bin/bash

cd $(dirname $0)

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

# オレオレ証明書の作成
CERT_FLAG=true
if [ ${CERT_FLAG} = true ]; then
	CERT_DIR=$(pwd)/cert
	CERT_COMMON_NAME=ssl_fuhaha_face
	CERT_FILENAME1=${CERT_DIR}/${CERT_COMMON_NAME}.key
	CERT_FILENAME2=${CERT_DIR}/${CERT_COMMON_NAME}.csr
	CERT_FILENAME3=${CERT_DIR}/${CERT_COMMON_NAME}.crt

	[ ! -f ${CERT_FILENAME1} ] && {
		mkdir -p $CERT_DIR
		openssl genrsa -out ${CERT_FILENAME1} 2048
		openssl req -new -key ${CERT_FILENAME1} -out ${CERT_FILENAME2} -subj "/CN="${CERT_COMMON_NAME}
		openssl x509 -req -signkey ${CERT_FILENAME1} -in ${CERT_FILENAME2} -out ${CERT_FILENAME3} -days 3650
		rm ${CERT_FILENAME2}
	}
else
	CERT_FLAG=false
	CERT_FILENAME1=none.key
	CERT_FILENAME3=none.crt
fi

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

# npmパッケージの準備
[ ! -d "node_modules" ] && {
	npm install express
	npm install serve-index
	npm install errorhandler
}

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

cat <<EOS | node
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

const libFs = require("fs");
const libHttp = require("http");
const libHttps = require("https");
const libExpress = require("express");
const libServeIndex = require("serve-index");
const libErrorHandler = require("errorhandler");
const libChildProcess = require("child_process");

const isHttps = ${CERT_FLAG};
const port = 8000;
(() => {
	if (isHttps) {
		const key = libFs.readFileSync("${CERT_FILENAME1}");
		const cert = libFs.readFileSync("${CERT_FILENAME3}");
		return libHttps.createServer({ key, cert, });
	} else {
		return libHttp.createServer();
	}
})().on("request", (() => {
	// expressを使用する
	const app = libExpress();
	app.use(libExpress.static("./"));
	app.use(libServeIndex("./"));
	app.use(libErrorHandler());
	return app;
})()).listen(port, () => {
	const url = (isHttps ? "https" : "http") + "://localhost:" + port;
	console.log("Server " + url);
});

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
EOS

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

