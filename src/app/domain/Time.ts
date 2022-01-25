import { FieldValue } from 'firebase/firestore';
import { JSONObject } from '../utils/utils';

export interface Time extends JSONObject {

    seconds: number;

    nanoseconds: number;
}

export type FirebaseTime = FieldValue | Time | null;
