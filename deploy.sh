#!/bin/sh
BASE_HREF="/board-test/"
ls
npm run build -- --base-href=$BASE_HREF
rsync -avzr --delete dist/pantheonsgame gaviall@awesom.eu:/var/www/html/$BASE_HREF
