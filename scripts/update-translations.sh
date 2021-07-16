#!/bin/sh
npx xlf-merge messages.fr.xlf --convert json && mv messages.fr.json src/assets/fr.json
