ifeq ($(OS),Windows_NT)
	DIR = $(shell cygpath -m `pwd`)
else
	DIR = $(shell pwd)
endif
JSX = $(DIR)/node_modules/jsx/bin/jsx
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
FOREVER = $(DIR)/node_modules/forever/bin/forever
APPNAME = game_collorin.js
SRC_SRV_DIR = src_srv
SRC_CLI_DIR = src_cli
SRC_SRV_SRCS = $(shell find $(SRC_SRV_DIR) -name "*.jsx")
SRC_CLI_SRCS = $(shell find $(SRC_CLI_DIR) -name "*.jsx")
DEV_HOST = uni
DEV_DIR = /home/tote/nodeTest/collorin

test: build

# --------------------------------

build: $(APPNAME) content/main.js

tool: toolImgCrypt.js toolMakeData.js toolMakeMotion.js
	node toolImgCrypt.js
	node toolMakeData.js
	node toolMakeMotion.js

# --------------------------------

clean:
	rm $(APPNAME) content/main.js tool*.js

cleandb: toolMakeData.js
	redis-cli keys "coll:*" | xargs redis-cli del
	redis-cli keys "sess:*" | xargs redis-cli del
	echo "db.dropDatabase()" | mongo totetest
	node toolMakeData.js

# --------------------------------

start: build
	node $(APPNAME)

srvStart: build
	$(FOREVER) start $(APPNAME)

srvStop:
	-$(FOREVER) stop $(APPNAME)

srvRestart: srvStop srvStart

# --------------------------------

put: build
	rsync -av * $(DEV_HOST):$(DEV_DIR)

putsrv: put
	ssh $(DEV_HOST) "cd $(DEV_DIR) ; make srvRestart"

db:
	mongod &
	redis-server &

# --------------------------------

content/main.js: $(SRC_CLI_DIR)/Main.jsx $(SRC_CLI_SRCS)
	$(JSX) --executable web --output $@ $<

$(APPNAME): $(SRC_SRV_DIR)/Main.jsx $(SRC_SRV_SRCS)
	$(JSX) --executable node --output $@ $<

tool%.js: $(SRC_SRV_DIR)/tool/Tool%.jsx $(SRC_SRV_SRCS)
	$(JSX) --executable node --output $@ $<

%.min.js: %.js
	$(MIN) -c -o $@ $<

# --------------------------------

