import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseTime } from '../domain/Time';
import { FirebaseJSONObject, JSONValue } from '../utils/utils';
import { FirebaseDocument, FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';

export interface MGPError extends FirebaseJSONObject {
    // The component in which the error occured
    component: string,
    // Route on which the error occured
    route: string,
    // A message detailing the error
    message: string,
    // Some extra data for the error
    data?: NonNullable<JSONValue>,
    // First time the error occured
    firstEncounter: FirebaseTime,
    // Last time the error occured
    lastEncounter: FirebaseTime,
    // Number of times the error occured
    occurences: number,
}
export type ErrorDocument = FirebaseDocument<MGPError>;

@Injectable({
    providedIn: 'root',
})
// The DAO used to log the errors within firebase
export class ErrorDAO extends FirebaseFirestoreDAO<MGPError> {
    public constructor(firestore: Firestore) {
        super('errors', firestore);
    }
    public findErrors(component: string, route: string, message: string, data?: JSONValue): Promise<ErrorDocument[]> {
        if (data === undefined) {
            return this.findWhere([['component', '==', component], ['route', '==', route], ['message', '==', message]]);
        } else {
            return this.findWhere([['component', '==', component], ['route', '==', route], ['message', '==', message], ['data', '==', data]]);
        }
    }
}
