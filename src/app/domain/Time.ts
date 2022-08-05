import * as Firestore from '@angular/fire/firestore';
import { JSONObject } from '../utils/utils';

export type FirestoreTime = Firestore.FieldValue | Firestore.Timestamp | null;
