To run load tests, from the main directory of this repository, do the following.

# Create a bunch of users.
To create 100 users, use the script `scripts/create-users.py`, which creates a `users.json` list that should be moved in the `load-test` directory.

From the EveryBoard directory:
``` sh
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
python ./scripts/create-users.py
npx firebase -P everyboard-loadtest auth:import users.json --hash-algo=MD5 --rounds=0
```

# Launch load-testing interface

``` sh
export FIREBASE_API_KEY=your-api-key-here
python -u ./load-test/launch.py
```

Then, go to http://localhost:8089 and experiment.

