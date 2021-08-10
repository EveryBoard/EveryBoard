#!/bin/sh
grep "trans-unit id=" translations/messages.xlf | sort > orig.txt
grep "trans-unit id=" translations/messages.fr.xlf | sort > new.txt
echo 'Only in messages.xlf (new translations to add)'
for id in $(diff orig.txt new.txt | grep '^<' | sed 's/.*id="\(.*\)" .*/\1/'); do
    grep "$id" translations/messages.xlf -A1
done
echo '--------------------'
echo 'Only in messages.fr.xlf (old translations to remove)'
for id in $(diff orig.txt new.txt | grep '^>' | sed 's/.*id="\(.*\)" .*/\1/'); do
    grep "$id" translations/messages.fr.xlf -A1
done
echo '--------------------'
rm -f orig.txt new.txt

SOURCES=$(grep "<source>" translations/messages.fr.xlf | wc -l)
TARGETS=$(grep "<target>" translations/messages.fr.xlf | wc -l)
if [[ "$SOURCES" -gt "$TARGETS" ]]; then
    echo "There are $SOURCES <source> tags but only $TARGETS <target> tags!"
    grep -n "</source>" translations/messages.fr.xlf -A1 | grep "</trans" -B1
elif [[ "$SOURCES" -lt "$TARGETS" ]]; then
    echo "There are $TARGETS <target> tags but only $SOURCES <source> tags!"
    grep -n "<target>" translations/messages.fr.xlf -B1 | grep -e "[0-9]\+-" | grep -v "</source>"
fi
