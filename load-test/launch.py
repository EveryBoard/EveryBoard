#!/usr/bin/python
import subprocess
import re
import requests
import time
import threading
import killport
import os
import json

def run_load_test():
    try:
        print('[load-test] Launching processes')
        frontend_process = subprocess.Popen(['npm', 'run', 'start'], stdout=subprocess.PIPE, universal_newlines=True)
        backend_process = subprocess.Popen(['make', '-C', 'backend', 'run-load-test'])
        time.sleep(5)

        print('[load-test] Checking if backend is reachable')
        print(requests.get('http://localhost:8081'))

        print('[load-test] Waiting for frontend to be reachable')
        connected = False
        while connected == False:
            time.sleep(5)
            try:
                print('[load-test] Trying to connect to frontend...')
                response = requests.get('http://localhost:4200')
                print(response)
                connected = True
            except Exception as e:
                print(f'[load-test] Got {e}')

        print('[load-test] Starting load tests')
        locust_process = subprocess.Popen(['locust', '-f', 'load-test/locustfile.py', '-H', 'http://localhost:8081'])
        input('Press ^C when done to kill everything')

        print('[load-test] load tests done with success')
        with open('stats.json', 'w') as stats_file:
            stats_file.write(json.dumps(json.loads(requests.get('http://localhost:8081/stats').content), indent=2))
        print('[load-test] backend stats saved in stats.json')
        return True

    except Exception as e:
        print(f'[load-test] Failed! {e}')
        return False

    finally:
        print('[load-test] Killing processes and exiting')
        # We can't just kill the processes as they have created detached children
        killport.kill_ports(ports = [9000, 8080, 8081, 4200, 4000])

        locust_process.kill()
        frontend_process.kill()
        #backend_process.kill()

if __name__ == '__main__':
    success = run_load_test()
    print('[load-test] Done.')
    if success == False:
        exit(1)
