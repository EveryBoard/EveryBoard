import * as Firestore from '@angular/fire/firestore';

/* For time handled by firestore:
 *   - when we send it in a document, we send a FieldValue
 *   - we then directly receive a local update, setting the time as null
 *   - we later receive an update from the server with an actual Firestore.Timestamp
  */
export type FirestoreTime = Firestore.FieldValue | Firestore.Timestamp | null;
