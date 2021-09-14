#!/bin/sh
npm run build:test
time scp -C -r ./dist/pantheonsgame/* "gaviall@awesom.eu:/var/www/html/board-test"
