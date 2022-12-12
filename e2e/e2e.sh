#!/bin/sh

echo 'Launching server'
./e2e/launch-and-watch.sh &
echo 'Waiting for server to be reachable'
until $(curl --output /dev/null --silent --head --fail http://localhost:4200); do
    echo -ne '.'
    sleep 5
done
echo 'Launching python script'
python ./e2e/e2e.py
status=$?
echo "Return value was: $status"
echo 'Killing processes and exiting'
kill $(pgrep "ng serve")
exit $status
