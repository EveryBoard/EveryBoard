from locust import FastHttpUser, task
import json
import urllib
import requests

# Set this as an environment variable. It is the apiKey field of firebaseConfig
FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY')

users = []
with open('load-test/users.json') as f:
    users = json.load(f)['users']

def jsonify(d):
    print(d)
    return urllib.parse.quote_plus(json.dumps(d))

def authenticate(email, password):
    # doc: https://firebase.google.com/docs/reference/rest/auth
    payload = json.dumps({ "email": email, "password": password, "return_secure_token": True})
    endpoint = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
    result = requests.post(endpoint, params={"key": FIREBASE_API_KEY}, data=payload).json()
    print(result)
    print(result['idToken'])
    return result['idToken']

if __name__ == '__main__':
    user = users.pop()
    print(authenticate(user['email'], 'hunter2'))

class User():
    def __init__(self, rest):
        user_json = users.pop()
        self.token = authenticate(user_json['email'], 'hunter2')
        self.headers = {'Authorization': f'Bearer {self.token}'}
        self.rest = rest
        self.minimal_user = { 'id': user_json['localId'], 'name': user_json['displayName'] }

    def create_game(self, game_name):
        endpoint = f'/game?gameName={game_name}'
        with self.rest('POST', endpoint, headers=self.headers, name='create_game') as response:
            if response is not None and response.js['id'] is not None:
                return response.js['id']
            else:
                response.failure('Cannot create game')

    def select_opponent(self, game_id, opponent):
        opponent_str = jsonify(opponent.minimal_user)
        endpoint = f'/config-room/{game_id}?action=selectOpponent&opponent={opponent_str}'
        with self.rest('POST', endpoint, headers=self.headers, name='select_opponent') as response:
            pass

    def propose_config(self, game_id, config):
        config_str = jsonify(config)
        endpoint = f'/config-room/{game_id}?action=propose&config={config_str}'
        with self.rest('POST', endpoint, headers=self.headers, name='propose_config') as response:
            pass

    def join(self, game_id):
        endpoint = f'/config-room/{game_id}/candidates'
        with self.rest('POST', endpoint, headers=self.headers, name='join') as response:
            pass

    def accept_config(self, game_id):
        endpoint = f'/config-room/{game_id}?action=accept'
        with self.rest('POST', endpoint, headers=self.headers, name='accept_config') as response:
            pass

    def play(self, game_id, move):
        move_str = jsonify(move)
        endpoint = f'/game/{game_id}?action=move&move={move_str}'
        with self.rest('POST', endpoint, headers=self.headers, name='move') as response:
            pass

    def play_last_move(self, game_id, move, winner):
        move_str = jsonify(move)
        endpoint = f'/game/{game_id}?action=moveAndEnd&move={move_str}&winner={winner}'
        with self.rest('POST', endpoint, headers=self.headers, name='last_move') as response:
            pass

class TwoPlayers(FastHttpUser):
    # for a proper firestore read count, we should subscribe to receive all
    # events, but for now we solely focus on writes, as this is usually the
    # limiting factor

    def on_start(self):
        self.user1 = User(self.rest)
        self.user2 = User(self.rest)

    @task
    def play_p4(self):
        # start the part
        game_id = self.user1.create_game('P4')
        if game_id != None:
            self.user2.join(game_id)
            self.user1.select_opponent(game_id, self.user2)
            config = {
                'partStatus': 2,
                'partType': 'STANDARD',
                'maximalMoveDuration': 42000,
                'totalPartDuration': 42000,
                'firstPlayer': 'RANDOM',
                'rulesConfig': {
                    'width': 7,
                    'height': 6,
                }
               }
            self.user1.propose_config(game_id, config)
            self.user2.accept_config(game_id)

            # plays a minimal game where p0 wins
            self.user1.play(game_id, [0])
            self.user2.play(game_id, [1])
            self.user1.play(game_id, [0])
            self.user2.play(game_id, [1])
            self.user1.play(game_id, [0])
            self.user2.play(game_id, [1])
            self.user1.play_last_move(game_id, [0], 0)
            # instead of playing a minimal p4, we could extract a bunch of real games and replay them
