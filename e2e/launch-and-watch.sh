#!/bin/sh

# This script launches the emulator and opens all links it sees

npm run start:emulator 2>&1 | tee allout.txt &

tail -f allout.txt | grep --line-buffered -Eo '([-+.[:alnum:]]+://)?([-[:alnum:]]+.)*(localhost|127.0.0.1)(:[[:digit:]]+)?(/[[:graph:]]*)?' |
    while read line
    do
        echo "Opening $line"
        curl -s $line > /dev/null
    done
