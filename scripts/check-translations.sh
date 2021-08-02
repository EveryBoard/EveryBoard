#!/bin/sh
grep "trans-unit id=" translations/messages.xlf > orig.txt
grep "trans-unit id=" translations/messages.fr.xlf > new.txt
diff orig.txt new.txt
rm -f orig.txt new.txt
