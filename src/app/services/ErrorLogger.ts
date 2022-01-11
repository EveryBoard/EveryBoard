import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { FirebaseFirestoreDAO } from '../dao/FirebaseFirestoreDAO';
import { FirebaseTime } from '../domain/Time';
import { MGPValidation } from '../utils/MGPValidation';
import { FirebaseJSONObject } from '../utils/utils';

export interface EncounteredError extends FirebaseJSONObject {
    // The component in which the error occured
    component: string,
    // A message detailing the error
    message: string,
    // The time at which the error occured
    time: FirebaseTime,
}

@Injectable({
    providedIn: 'root',
})
export class ErrorDAO extends FirebaseFirestoreDAO<EncounteredError> {
    private constructor(afs: AngularFirestore) {
        super('errors', afs);
    }
}

@Injectable({
    providedIn: 'root',
})
export class ErrorLogger {
    // The DAO used to log the errors within firebase
    public constructor(private readonly errorDAO: ErrorDAO) {
    }
    public async logError(component: string, message: string): Promise<MGPValidation> {
        const error: EncounteredError = {
            component,
            message,
            time: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await this.errorDAO.create(error);
        console.log('2')
        return MGPValidation.failure(component + ': ' + message);
    }
}
