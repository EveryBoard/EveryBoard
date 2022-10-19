import firebase_admin
from firebase_admin import firestore

# Important: it is necessary to set the environment variable
# GOOGLE_APPLICATION_CREDENTIALS to point to the .json credentials, that is
# generated from the firebase console. To generate it, go to the firebase
# console and generate a private key. For example, go to:
# https://console.firebase.google.com/project/everyboard-test/settings/serviceaccounts/adminsdk

print('WARNING: Make sure that the renamed collection does not contain any sub-collections. If it does, this script needs to be updated')
old_collection_name = input('What is the name of the old collection you want to rename? ')
new_collection_name = input('What is the name of the new collection? ')

print(f'WARNING: This will rename collection {old_collection_name} in {new_collection_name} in your firebase project and move many documents')
print('WARNING: Please confirm that this is what you want to do')
confirmation = input('WARNING: Are you sure? (y/n) ')
if confirmation != 'y':
    exit(1)

app = firebase_admin.initialize_app()
db = firestore.client()
old_collection_reference = db.collection(old_collection_name)
old_collection_snapshot = old_collection_reference.get()
length = len(old_collection_snapshot)
i = 0
for document in old_collection_snapshot:
    i += 1
    print(f'[{i}/{length}] Copying document {document.id}')
    # Create a document in the new collection with the same idea as the old document
    db.collection(new_collection_name).document(document.id).set(document.to_dict())

print('Collection moved. You can now remove the old collection in the firebase console')
