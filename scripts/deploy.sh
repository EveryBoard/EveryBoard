#!/bin/sh
BASE_HREF="&#x2f;board-test/"
npm run build -- --base-href=$BASE_HREF
time scp -C -r ./dist/pantheonsgame/* "gaviall@awesom.eu:/var/www/html/board-test"
