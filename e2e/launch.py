#!/usr/bin/python
import subprocess
import re
import requests
import time
import threading
import e2e
import killport

failed = False

def open_urls(process):
    for line in iter(process.stdout.readline, ""):
        print(f'[front] {line}', end='')
        # Match the URL that we will have to visit in order to validate our account
        matches = re.findall(r'(http://)(localhost|127.0.0.1)(:[0-9]+)?(/\S*)?', line)
        for match in matches:
            url = ''.join(match)
            try:
                response = requests.get(url)
                print(f'[e2e] Visited {url}, got {response.status_code}')
            except Exception as e:
                print(f'[e2e] Failed to visit {url}: {e}')

def run_e2e():
    try:
        print('[e2e] Launching processes')
        frontend_process = subprocess.Popen(['npm', 'run', 'start:emulator'], stdout=subprocess.PIPE, universal_newlines=True)
        backend_process = subprocess.Popen(['make', '-C', 'backend', 'run'])

        print('[e2e] Watching URLs')
        watch_thread = threading.Thread(target=open_urls, args=(frontend_process,))
        watch_thread.start()

        print('[e2e] Waiting for frontend to be reachable')
        connected = False
        while connected == False:
            time.sleep(5)
            try:
                print('[e2e] Trying to connect...')
                response = requests.get('http://localhost:4200')
                print(response)
                connected = True
            except Exception as e:
                print(f'[e2e] Got {e}')

        print('[e2e] Starting e2e tests')
        e2e.launch_scenarios()
        print('[e2e] e2e tests done with success')
        return True

    except Exception as e:
        print(f'[e2e] Failed! {e}')
        return False

    finally:
        print('[e2e] Killing processes and exiting')
        # We can't just kill the processes as they have created detached children
        killport.kill_ports(ports = [9000, 8080, 8081, 4200, 4000])

        frontend_process.kill()
        backend_process.kill()
        watch_thread.join()


if __name__ == '__main__':
    success = run_e2e()
    print('[e2e] Done.')
    if success == False:
        exit(1)
