import { JSONObject } from '../utils/utils';
import firebase from 'firebase';

export interface Time extends JSONObject {

    seconds: number;

    nanoseconds: number;
}

export type FirebaseTime = firebase.firestore.FieldValue | Time | null;
