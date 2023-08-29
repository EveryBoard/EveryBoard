import { FirestoreDAO } from './FirestoreDAO';
import { Part } from '../domain/Part';
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Debug } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class PartDAO extends FirestoreDAO<Part> {

    public constructor(firestore: Firestore) {
        super('parts', firestore);
    }
}
