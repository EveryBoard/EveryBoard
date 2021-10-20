const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore();

// Create a new function which is triggered on changes to /status/{uid}
// Note: This is a Realtime Database trigger, *not* Cloud Firestore.
exports.onUserStatusChanged = functions.database.ref('/status/{uid}').onUpdate(
    async (change: any, context: any) => {
        console.log(context.params.uid + " now");
        const eventStatus = change.after.val();

        const joueurFirestoreRef = firestore.doc(`joueurs/${context.params.uid}`);

        const userSnapshot = await change.after.ref.once('value');
        const user = userSnapshot.val();
        console.log(user, eventStatus);
        if (user.last_changed > eventStatus.last_changed) {
            return null;
        }
        eventStatus.last_changed = new Date(eventStatus.last_changed);

        return joueurFirestoreRef.set(eventStatus, { merge: true });
    });