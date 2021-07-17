#!/bin/sh
npx xlf-merge messages.xlf --convert json && mv messages.json src/assets/fr.json
