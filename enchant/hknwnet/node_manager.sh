#!/bin/bash

SERVER="server.js"

getID(){
	echo `ps aux | grep $SERVER | grep -v grep | awk '{print $2}'`
}

case $1 in
	start)
		node $SERVER > /dev/null &
		;;
	status)
		echo process ID `getID`
		;;
	stop)
		kill `getID`
		;;
	*)
		echo "Usage: node_manager.sh (start|status|stop)"
		;;
esac

