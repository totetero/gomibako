#!/bin/bash

echo localhost:8000
ruby -run -e httpd . -p 8000
