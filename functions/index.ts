/* eslint-disable */
/**
 * Since functions are no longer available for free use in firebase
 * here is the code still running but that cannot be changed.
 * Considers an user connected when an handshake with a user is made
 * Consider an unser disconnected when an handshake breaks.
 * Unfortunately, when a user creates two handshakes (in two browsers)
 * then break one of those two, he'll become disconnected
 */
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
    async(change: any, context: any) => {
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
exports.test = functions.database.ref('/test').onUpdate(
    async(change: any, context: any) => {
        console.log('saluk');
    });
