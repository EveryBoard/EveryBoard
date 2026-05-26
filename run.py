#!/usr/bin/python
import os
import subprocess
import re
import requests
import time
import threading
import killport

POSTGRES_HOST = '127.0.0.1'
POSTGRES_PORT = 5432
BACKEND_URL = 'http://localhost:8081/version'
FRONTEND_URL = 'http://localhost:4200'

def open_urls(process):
    for line in iter(process.stdout.readline, ""):
        print(f'[front] {line}', end='')
        # Match the URL that we will have to visit in order to validate our account
        matches = re.findall(r'(http://)(localhost|127.0.0.1)(:[0-9]+)?(/\S*)?', line)
        for match in matches:
            url = ''.join(match)
            try:
                response = requests.get(url)
                print(f'[runner] Visited {url}, got {response.status_code}')
            except Exception as e:
                print(f'[runner] Failed to visit {url}: {e}')

def log_stream(stream, prefix):
    for line in iter(stream.readline, ""):
        print(f'{prefix} {line}', end='')

def start_log_thread(stream, prefix):
    thread = threading.Thread(target=log_stream, args=(stream, prefix), daemon=True)
    thread.start()
    return thread

def require_running(processes):
    for name, process in processes:
        exit_code = process.poll()
        if exit_code is not None:
            raise RuntimeError(f'{name} exited early with status {exit_code}')

def docker_output(args):
    try:
        return subprocess.check_output(args, stderr=subprocess.STDOUT, text=True)
    except subprocess.CalledProcessError as e:
        return e.output

def print_postgres_diagnostics(docker_id, last_error):
    print(f'[runner] Last postgres readiness error: {last_error}')
    if docker_id is None:
        return

    print('[runner] Postgres container:')
    print(docker_output(['docker', 'ps', '-a', '--filter', f'id={docker_id}']))

    print('[runner] Recent postgres logs:')
    print(docker_output(['docker', 'logs', '--tail', '80', docker_id]))

def wait_for_postgres(docker_id, user, database, processes, timeout=60):
    print('[runner] Waiting for postgres to be reachable')
    deadline = time.monotonic() + timeout
    last_error = None
    while time.monotonic() < deadline:
        require_running(processes)
        try:
            subprocess.run(
                [
                    'pg_isready',
                    '-h', POSTGRES_HOST,
                    '-p', str(POSTGRES_PORT),
                    '-U', user,
                    '-d', database,
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                text=True,
                timeout=2,
                check=True,
            )
            print('[runner] Postgres is reachable')
            return
        except subprocess.TimeoutExpired:
            last_error = 'timed out while connecting'
        except subprocess.CalledProcessError as e:
            last_error = e.stderr.strip()
        except FileNotFoundError:
            raise RuntimeError('pg_isready is required to wait for postgres readiness')
        time.sleep(1)
    print_postgres_diagnostics(docker_id, last_error)
    raise RuntimeError(f'postgres did not become reachable: {last_error}')

def wait_for_http(url, label, processes, timeout=120):
    print(f'[runner] Waiting for {label} to be reachable at {url}')
    deadline = time.monotonic() + timeout
    last_error = None
    while time.monotonic() < deadline:
        require_running(processes)
        try:
            response = requests.get(url, timeout=2)
            response.raise_for_status()
            print(f'[runner] {label} is reachable: {response.status_code}')
            return
        except Exception as e:
            last_error = e
        time.sleep(1)
    raise RuntimeError(f'{label} did not become reachable: {last_error}')

def run():
    docker_id = None
    backend_process = None
    frontend_process = None
    watch_thread = None
    backend_log_thread = None
    try:
        print('[runner] Launching processes')
        postgres_user = 'everyboard'
        postgres_password = 'everyboard'
        postgres_db = 'everyboard'
        docker_id = subprocess.check_output(['docker', 'run', '-d',
                                             '-e', f'POSTGRES_USER={postgres_user}',
                                             '-e', f'POSTGRES_PASSWORD={postgres_password}',
                                             '-e', f'POSTGRES_DB={postgres_db}',
                                             '--network', 'host',
                                             'postgres:17']).decode().strip()
        wait_for_postgres(docker_id, postgres_user, postgres_db, [])

        env = os.environ.copy()
        env['DB_USERNAME'] = postgres_user
        env['DB_PASSWORD'] = postgres_password
        env['DB_NAME'] = postgres_db
        env['DB_HOST'] = POSTGRES_HOST
        backend_process = subprocess.Popen(
            ['make', '-C', 'backend', 'run-postgres'],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )
        backend_log_thread = start_log_thread(backend_process.stdout, '[back]')
        start_log_thread(backend_process.stderr, '[back:err]')
        wait_for_http(BACKEND_URL, 'backend', [('backend', backend_process)])

        frontend_process = subprocess.Popen(
            ['npm', 'run', 'start:emulator'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )
        start_log_thread(frontend_process.stderr, '[front:err]')

        print('[runner] Watching URLs')
        watch_thread = threading.Thread(target=open_urls, args=(frontend_process,), daemon=True)
        watch_thread.start()

        wait_for_http(
            FRONTEND_URL,
            'frontend',
            [('backend', backend_process), ('frontend', frontend_process)],
        )

        print('[runner] Waiting for ^C')
        while True:
            require_running([('backend', backend_process), ('frontend', frontend_process)])
            time.sleep(1)

    except KeyboardInterrupt:
        print('[runner] Interrupted')
        return True

    except Exception as e:
        print(f'[runner] Failed! {e}')
        return False

    finally:
        print('[runner] Killing processes and exiting')
        # We can't just kill the processes as they have created detached children
        killport.kill_ports(ports=[9000, 8080, 8081, 4200, 4000])

        if docker_id != None:
            subprocess.run(["docker", "rm", "-f", docker_id])
        if backend_process != None:
            backend_process.kill()
        if frontend_process != None:
            frontend_process.kill()
        if watch_thread != None:
            watch_thread.join(timeout=5)
        if backend_log_thread != None:
            backend_log_thread.join(timeout=5)

if __name__ == '__main__':
    success = run()
    print('[runner] Done.')
    if success == False:
        exit(1)
