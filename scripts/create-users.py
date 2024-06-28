import hashlib
import string
import random
import json
import base64
import firebase_admin
from firebase_admin import firestore, auth

# Important: it is necessary to set the environment variable
# GOOGLE_APPLICATION_CREDENTIALS to point to the .json credentials, that is
# generated from the firebase console. To generate it, go to the firebase
# console and generate a private key. For example, go to:
# https://console.firebase.google.com/project/everyboard-test/settings/serviceaccounts/adminsdk

def hex_b64_hash(password):
    # insecure hash, don't really care as it's for a test environment and will get rehashed by firebase anyway
    return base64.b64encode(hashlib.md5(password.encode('utf-8')).hexdigest().encode('utf-8')).decode('utf-8')

def hash(password):
    return hashlib.md5(password.encode('utf-8')).hexdigest().encode('utf-8')

def random_string(length):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def random_user():
    uid = random_string(16)
    password = 'hunter2' # much security, wow! (also used below in users_to_import!)
    return {
        'localId': uid,
        'email': f'{uid}@everyboard.org',
        'emailVerified': True,
        'displayName': uid,
        'passwordHash': hex_b64_hash(password),
        'salt': None,
    }

# Create 1000 users, as firebase does not support importing more than 1000 users at a time
random_users = [random_user() for i in range(1000)]
users_json = {
    'users': random_users
}
users_to_import = [auth.ImportUserRecord(uid=user['localId'],
                                         email=user['email'],
                                         password_hash=hash('hunter2'),
                                         password_salt=None)
                   for user in random_users]

# The list of users can then be imported as follows:
# npx firebase auth:import users.json --hash-algo=MD5 --rounds=0
with open('users.json', 'w') as users_file:
    users_file.write(json.dumps(users_json))

# Import all the users
print('Importing users')
app = firebase_admin.initialize_app()
print(firebase_admin.auth.import_users(users_to_import, hash_alg=auth.UserImportHash.md5(rounds=0), app=None))

# Import them in firestore as well
print('Setting them up in DB')
db = firestore.client()
for user in random_users:
    uid = user['localId']
    db.collection('users').document(uid).set({ 'username': uid, 'verified': True })
print('All good!')
